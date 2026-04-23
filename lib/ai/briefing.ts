import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { prisma } from "@/lib/db";
import { readGmail } from "@/lib/integrations/gmail";

type BriefingType = "daily" | "weekly" | "on-demand";

// Produce + persist a structured briefing for the strategic-advisor agent.
// Returns the Briefing row.
export async function generateBriefing({
  userId,
  agentSlug = "strategic-advisor",
  type = "daily",
}: {
  userId: string;
  agentSlug?: string;
  type?: BriefingType;
}) {
  const agent = await prisma.agent.findUnique({
    where: { userId_slug: { userId, slug: agentSlug } },
  });
  if (!agent) throw new Error("agent_not_found");

  // 1. Pull raw signal (emails from last window)
  const window = type === "weekly" ? "7d" : "1d";
  let emailsBlock = "";
  try {
    const messages = await readGmail({
      userId,
      query: `newer_than:${window} -category:promotions -category:social -in:spam`,
      limit: 20,
    });
    emailsBlock = messages
      .map(
        (m) =>
          `- [${m.date}] ${m.from} — ${m.subject}\n  ${m.snippet.slice(0, 200)}`,
      )
      .join("\n");
    if (!emailsBlock) emailsBlock = "(אין מיילים חדשים בחלון זמן זה)";
  } catch (err) {
    emailsBlock = `(לא הצלחתי למשוך מיילים: ${err instanceof Error ? err.message : "unknown"})`;
  }

  // 2. Pull context: key contacts + verified memories
  const [contacts, memories] = await Promise.all([
    prisma.contact.findMany({
      where: { userId },
      orderBy: { importance: "desc" },
      take: 20,
    }),
    prisma.memory.findMany({
      where: { agentId: agent.id, verified: true },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
  ]);

  const contactsBlock = contacts
    .map((c) => `- ${c.name}${c.role ? ` (${c.role})` : ""}`)
    .join("\n");
  const memoriesBlock = memories
    .map((m) => `- [${m.category}] ${m.key}: ${m.value.slice(0, 200)}`)
    .join("\n");

  // 3. Ask Claude for the fixed-format briefing
  const userPrompt = `הפק סיכום ${type === "weekly" ? "שבועי" : "יומי"} בהתאם למבנה הקבוע של 4 הסעיפים.

# מיילים מהחלון האחרון (${window})
${emailsBlock}

# אנשי מפתח
${contactsBlock || "(אין)"}

# זיכרון מאומת רלוונטי
${memoriesBlock || "(אין)"}

החזר בדיוק במבנה: **תמצית המצב**, **דגשים מאנשי מפתח**, **אופרטיבי** (3 משימות ממוספרות), **טיוטת WhatsApp** (בתוך code block).`;

  const { text, usage } = await generateText({
    model: anthropic(agent.model),
    system: agent.systemPrompt,
    prompt: userPrompt,
    maxOutputTokens: 2000,
  });

  // 4. Parse the fixed sections (same regex as StructuredOutput)
  const parsed = parseSections(text);

  const briefing = await prisma.briefing.create({
    data: {
      agentId: agent.id,
      type,
      summary: parsed.summary || text.slice(0, 1000),
      highlights: parsed.highlights ? { text: parsed.highlights } : {},
      tasks: parsed.tasks ? { text: parsed.tasks } : {},
      whatsappDraft: parsed.whatsapp || "",
    },
  });

  return { briefing, rawText: text, usage };
}

function parseSections(text: string) {
  const sections = {
    summary: "",
    highlights: "",
    tasks: "",
    whatsapp: "",
  };
  const headings: Array<[keyof typeof sections, RegExp]> = [
    ["summary", /\*\*תמצית המצב\*\*/],
    ["highlights", /\*\*דגשים מאנשי מפתח\*\*/],
    ["tasks", /\*\*אופרטיבי\*\*/],
    ["whatsapp", /\*\*טיוטת WhatsApp[^*]*\*\*/],
  ];
  const matches: Array<{ key: keyof typeof sections; start: number; end: number }> = [];
  for (const [key, re] of headings) {
    const m = re.exec(text);
    if (m) matches.push({ key, start: m.index + m[0].length, end: text.length });
  }
  matches.sort((a, b) => a.start - b.start);
  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i];
    const next = matches[i + 1];
    sections[cur.key] = text.slice(cur.start, next ? next.start - 0 : text.length).trim();
  }
  // whatsapp inside ``` block, strip fences
  sections.whatsapp = sections.whatsapp
    .replace(/^```[^\n]*\n?/, "")
    .replace(/\n?```$/, "")
    .trim();
  return sections;
}
