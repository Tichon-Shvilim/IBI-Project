import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateBriefing } from "@/lib/ai/briefing";

export const maxDuration = 60;

// Invoked by Vercel Cron daily at 05:00 UTC (07:00 Jerusalem).
// Authorization header is injected automatically by Vercel Cron.
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Single-user app: briefing for every active user with strategic-advisor agent.
  const users = await prisma.user.findMany({
    where: { agents: { some: { slug: "strategic-advisor", isActive: true } } },
    select: { id: true, email: true },
  });

  const results = [];
  for (const u of users) {
    try {
      const { briefing } = await generateBriefing({ userId: u.id, type: "daily" });
      results.push({ userId: u.id, briefingId: briefing.id, status: "ok" });
    } catch (err) {
      results.push({
        userId: u.id,
        status: "error",
        error: err instanceof Error ? err.message : "unknown",
      });
    }
  }

  return NextResponse.json({ count: users.length, results });
}
