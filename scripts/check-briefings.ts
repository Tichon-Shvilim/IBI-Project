import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
(async () => {
  const agents = await p.agent.findMany({ select: { id: true, slug: true, userId: true } });
  console.log("Agents:", JSON.stringify(agents, null, 2));

  const briefings = await p.briefing.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, agentId: true, type: true, createdAt: true, summary: true },
  });
  console.log(
    "\nBriefings:",
    JSON.stringify(
      briefings.map((b) => ({ ...b, summary: b.summary.slice(0, 120) })),
      null,
      2,
    ),
  );
  await p.$disconnect();
})();
