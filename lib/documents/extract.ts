import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import * as xlsx from "xlsx";

// Extract plain text from an uploaded file buffer. Caller provides the MIME
// type it got from the browser; we fall back to extension-based detection.
export async function extractText({
  buffer,
  mimeType,
  name,
}: {
  buffer: Buffer;
  mimeType: string;
  name: string;
}): Promise<string> {
  const lower = name.toLowerCase();

  if (mimeType === "application/pdf" || lower.endsWith(".pdf")) {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const res = await parser.getText();
      return (res.text ?? "").trim();
    } finally {
      await parser.destroy().catch(() => {});
    }
  }

  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lower.endsWith(".docx")
  ) {
    const res = await mammoth.extractRawText({ buffer });
    return res.value.trim();
  }

  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mimeType === "application/vnd.ms-excel" ||
    lower.endsWith(".xlsx") ||
    lower.endsWith(".xls") ||
    lower.endsWith(".csv")
  ) {
    const wb = xlsx.read(buffer, { type: "buffer" });
    return wb.SheetNames.map((name) => {
      const sheet = wb.Sheets[name];
      const rows = xlsx.utils.sheet_to_csv(sheet);
      return `# ${name}\n${rows}`;
    }).join("\n\n").trim();
  }

  if (
    mimeType.startsWith("text/") ||
    lower.endsWith(".txt") ||
    lower.endsWith(".md")
  ) {
    return buffer.toString("utf-8").trim();
  }

  // Unsupported — try utf-8 decode as last resort
  const fallback = buffer.toString("utf-8");
  if (/^[\x00-\x7F֐-׿ -ɏ\s]{100,}/.test(fallback)) {
    return fallback.trim();
  }
  throw new Error(`unsupported_mime: ${mimeType} (${name})`);
}
