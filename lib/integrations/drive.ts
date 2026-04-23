import { google } from "googleapis";
import { googleClientForUser } from "@/lib/integrations/google-client";

export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  sizeBytes: number;
  webViewLink?: string;
};

export async function listDriveFiles({
  userId,
  query,
  limit = 20,
}: {
  userId: string;
  query?: string;
  limit?: number;
}): Promise<DriveFile[]> {
  const auth = await googleClientForUser(userId);
  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.list({
    q: query || "trashed = false",
    pageSize: Math.min(limit, 50),
    fields: "files(id, name, mimeType, modifiedTime, size, webViewLink)",
    orderBy: "modifiedTime desc",
  });

  return (res.data.files ?? []).map((f) => ({
    id: f.id ?? "",
    name: f.name ?? "",
    mimeType: f.mimeType ?? "",
    modifiedTime: f.modifiedTime ?? "",
    sizeBytes: Number(f.size ?? 0),
    webViewLink: f.webViewLink ?? undefined,
  }));
}

export async function downloadDriveFile({
  userId,
  fileId,
}: {
  userId: string;
  fileId: string;
}): Promise<{ mimeType: string; buffer: Buffer; name: string }> {
  const auth = await googleClientForUser(userId);
  const drive = google.drive({ version: "v3", auth });

  const meta = await drive.files.get({
    fileId,
    fields: "name, mimeType",
  });

  // Google Docs need export, binary files use alt=media
  const isGoogleDoc = (meta.data.mimeType ?? "").startsWith("application/vnd.google-apps.");

  let data: ArrayBuffer;
  if (isGoogleDoc) {
    const exportMime =
      meta.data.mimeType === "application/vnd.google-apps.spreadsheet"
        ? "text/csv"
        : "text/plain";
    const res = await drive.files.export(
      { fileId, mimeType: exportMime },
      { responseType: "arraybuffer" },
    );
    data = res.data as ArrayBuffer;
  } else {
    const res = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "arraybuffer" },
    );
    data = res.data as ArrayBuffer;
  }

  return {
    mimeType: meta.data.mimeType ?? "application/octet-stream",
    buffer: Buffer.from(data),
    name: meta.data.name ?? fileId,
  };
}
