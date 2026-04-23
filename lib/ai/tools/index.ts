import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { readGmail } from "@/lib/integrations/gmail";

export function buildAgentTools({
  agentId,
  userId,
}: {
  agentId: string;
  userId: string;
}) {
  return {
    search_memory: tool({
      description:
        "חפש בזיכרון ארוך טווח של הסוכן. השתמש לפני מענה לשאלה מהותית.",
      inputSchema: z.object({
        query: z.string().describe("שאילתת חיפוש קצרה בעברית"),
        limit: z.number().int().min(1).max(20).default(5),
      }),
      execute: async ({ query, limit }) => {
        const items = await prisma.memory.findMany({
          where: {
            agentId,
            OR: [
              { key: { contains: query, mode: "insensitive" } },
              { value: { contains: query, mode: "insensitive" } },
            ],
          },
          take: limit,
          orderBy: { updatedAt: "desc" },
        });
        return items.map((m) => ({
          id: m.id,
          category: m.category,
          key: m.key,
          value: m.value,
          verified: m.verified,
        }));
      },
    }),

    verify_with_user: tool({
      description:
        "שאל את נתי לאישור לפני שמירת פרט חדש (שם, החלטה, סכום, הסכם). החזרה של אישור/תיקון.",
      inputSchema: z.object({
        fact: z.string().describe("הפרט שברצונך לאמת, בעברית ברורה"),
        category: z.enum(["person", "decision", "project", "fact"]).default("fact"),
      }),
      execute: async ({ fact, category }) => {
        return {
          status: "pending_user_confirmation",
          fact,
          category,
          note: "הצג למשתמש כבקשת אישור ב-UI; אל תשמור לפני אישור מפורש.",
        };
      },
    }),

    draft_whatsapp: tool({
      description:
        "הפק טיוטת הודעת WhatsApp מוכנה להעתקה. אל תשלח אוטומטית — הכנה בלבד.",
      inputSchema: z.object({
        recipient: z.string().describe("שם הנמען או קבוצה"),
        content: z.string().describe("תוכן ההודעה בעברית"),
      }),
      execute: async ({ recipient, content }) => {
        return { recipient, content, ready: true };
      },
    }),

    search_docs: tool({
      description: "חפש במסמכים שהועלו (PDF/Excel). RAG מבוסס pgvector.",
      inputSchema: z.object({
        query: z.string(),
        limit: z.number().int().min(1).max(10).default(5),
      }),
      execute: async ({ query, limit }) => {
        // Fallback: keyword search over extractedText until embedding pipeline ships.
        const docs = await prisma.document.findMany({
          where: {
            userId,
            extractedText: { contains: query, mode: "insensitive" },
          },
          take: limit,
          orderBy: { createdAt: "desc" },
          select: { id: true, name: true, extractedText: true },
        });
        return docs.map((d) => ({
          id: d.id,
          name: d.name,
          excerpt: (d.extractedText ?? "").slice(0, 500),
        }));
      },
    }),

    read_gmail: tool({
      description:
        'שליפת מיילים רלוונטיים מחשבון Gmail המחובר. ה-query בפורמט של Gmail search (לדוגמה: "from:tal@ibi-capital.co.il newer_than:7d").',
      inputSchema: z.object({
        query: z.string(),
        limit: z.number().int().min(1).max(20).default(10),
      }),
      execute: async ({ query, limit }) => {
        try {
          const messages = await readGmail({ userId, query, limit });
          return messages.map((m) => ({
            id: m.id,
            from: m.from,
            subject: m.subject,
            date: m.date,
            snippet: m.snippet,
            body: m.body.slice(0, 1000),
          }));
        } catch (err) {
          const msg = err instanceof Error ? err.message : "unknown_error";
          return { error: msg, hint: "ייתכן שחיבור Gmail לא הוגדר או שהטוקן פג." };
        }
      },
    }),
  };
}
