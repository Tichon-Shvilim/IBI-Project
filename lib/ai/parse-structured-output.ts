export const STRUCTURED_SECTIONS = {
  summary: "תמצית המצב",
  highlights: "דגשים מאנשי מפתח",
  tasks: "אופרטיבי",
  whatsapp: "טיוטת WhatsApp",
} as const;

export type StructuredSectionKey = keyof typeof STRUCTURED_SECTIONS;
export type ParsedSections = Partial<Record<StructuredSectionKey, string>>;

export function parseStructuredOutput(text: string): ParsedSections | null {
  const headingRegex = new RegExp(
    `\\*\\*(${Object.values(STRUCTURED_SECTIONS).map(escape).join("|")})[^*]*\\*\\*`,
    "g",
  );
  const matches = [...text.matchAll(headingRegex)];
  if (matches.length === 0) return null;

  const result: ParsedSections = {};
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const next = matches[i + 1];
    const headingText = m[1].trim();
    const start = m.index! + m[0].length;
    const end = next ? next.index! : text.length;
    const body = text.slice(start, end).trim();

    const entry = Object.entries(STRUCTURED_SECTIONS).find(([, v]) => v === headingText);
    if (!entry) continue;
    const key = entry[0] as StructuredSectionKey;
    result[key] = body;
  }
  return Object.keys(result).length > 0 ? result : null;
}

function escape(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
