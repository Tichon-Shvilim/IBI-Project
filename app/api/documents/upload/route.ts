import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { extractText } from "@/lib/documents/extract";

export const runtime = "nodejs";
export const maxDuration = 60;

// Vercel serverless has a body-size cap (~4.5MB on hobby). For larger files
// we'd need Vercel Blob with presigned uploads; today this endpoint parses
// the file inline and stores only the extracted text.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "invalid_form" }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file_missing" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  let text = "";
  try {
    text = await extractText({
      buffer,
      mimeType: file.type || "application/octet-stream",
      name: file.name,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "extract_failed",
        message: err instanceof Error ? err.message : "unknown",
      },
      { status: 422 },
    );
  }

  if (!text || text.length < 10) {
    return NextResponse.json(
      { error: "empty_text", hint: "לא הצלחנו לחלץ טקסט משמעותי מהקובץ." },
      { status: 422 },
    );
  }

  const doc = await prisma.document.create({
    data: {
      userId: session.user.id,
      source: "upload",
      name: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: buffer.byteLength,
      extractedText: text,
    },
    select: { id: true, name: true, sizeBytes: true, createdAt: true },
  });

  return NextResponse.json({ document: doc, textLength: text.length });
}
