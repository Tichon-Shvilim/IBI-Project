import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateBriefing } from "@/lib/ai/briefing";

export const maxDuration = 60;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { agents: { some: { slug: "strategic-advisor", isActive: true } } },
    select: { id: true },
  });

  const results = [];
  for (const u of users) {
    try {
      const { briefing } = await generateBriefing({ userId: u.id, type: "weekly" });
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
