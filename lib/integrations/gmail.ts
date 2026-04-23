import { google } from "googleapis";
import { googleClientForUser } from "@/lib/integrations/google-client";

export type GmailMessage = {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  date: string;
  body: string;
};

export async function readGmail({
  userId,
  query,
  limit = 10,
}: {
  userId: string;
  query: string;
  limit?: number;
}): Promise<GmailMessage[]> {
  const auth = await googleClientForUser(userId);
  const gmail = google.gmail({ version: "v1", auth });

  const list = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: Math.min(limit, 25),
  });

  const ids = list.data.messages ?? [];
  if (ids.length === 0) return [];

  // Fetch messages in parallel (batched at ~25 to avoid rate limits)
  const messages = await Promise.all(
    ids.map((m) =>
      gmail.users.messages.get({
        userId: "me",
        id: m.id!,
        format: "full",
      }),
    ),
  );

  return messages.map((res) => {
    const msg = res.data;
    const headers = msg.payload?.headers ?? [];
    const h = (name: string) =>
      headers.find((x) => x.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
    return {
      id: msg.id ?? "",
      threadId: msg.threadId ?? "",
      from: h("From"),
      to: h("To"),
      subject: h("Subject"),
      snippet: msg.snippet ?? "",
      date: h("Date"),
      body: extractBody(msg.payload),
    };
  });
}

type MessagePart = {
  mimeType?: string | null;
  body?: { data?: string | null } | null;
  parts?: MessagePart[];
};

function extractBody(payload: MessagePart | undefined | null): string {
  if (!payload) return "";
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }
  for (const part of payload.parts ?? []) {
    const b = extractBody(part);
    if (b) return b;
  }
  return "";
}

function decodeBase64Url(s: string): string {
  const base64 = s.replace(/-/g, "+").replace(/_/g, "/");
  try {
    return Buffer.from(base64, "base64").toString("utf-8");
  } catch {
    return "";
  }
}

export async function sendGmail({
  userId,
  to,
  subject,
  body,
  cc,
  bcc,
  replyTo,
}: {
  userId: string;
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
  replyTo?: string;
}): Promise<{ id: string; threadId: string }> {
  const auth = await googleClientForUser(userId);
  const gmail = google.gmail({ version: "v1", auth });

  const mime = buildMimeMessage({ to, subject, body, cc, bcc, replyTo });
  const raw = Buffer.from(mime, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });

  return {
    id: res.data.id ?? "",
    threadId: res.data.threadId ?? "",
  };
}

function encodeHeader(value: string): string {
  const hasNonAscii = /[^\x00-\x7F]/.test(value);
  if (!hasNonAscii) return value;
  const b64 = Buffer.from(value, "utf-8").toString("base64");
  return `=?UTF-8?B?${b64}?=`;
}

function buildMimeMessage({
  to,
  subject,
  body,
  cc,
  bcc,
  replyTo,
}: {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
  replyTo?: string;
}): string {
  const headers: string[] = [
    `To: ${to}`,
    cc ? `Cc: ${cc}` : "",
    bcc ? `Bcc: ${bcc}` : "",
    replyTo ? `Reply-To: ${replyTo}` : "",
    `Subject: ${encodeHeader(subject)}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
  ].filter(Boolean);

  const encodedBody = Buffer.from(body, "utf-8")
    .toString("base64")
    .match(/.{1,76}/g)
    ?.join("\r\n") ?? "";

  return headers.join("\r\n") + "\r\n\r\n" + encodedBody;
}
