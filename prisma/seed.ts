import { PrismaClient } from "@prisma/client";
import { STRATEGIC_ADVISOR_SYSTEM_PROMPT } from "../lib/ai/prompts/strategic-advisor";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_USER_EMAIL;
  if (!email) {
    console.log("SEED_USER_EMAIL לא הוגדר — דלג.");
    return;
  }

  const user = await prisma.user.upsert({
    where: { email },
    create: { email, name: "נתי מנשורי" },
    update: {},
  });

  await prisma.agent.upsert({
    where: { userId_slug: { userId: user.id, slug: "strategic-advisor" } },
    create: {
      userId: user.id,
      slug: "strategic-advisor",
      name: "יועץ אסטרטגי",
      description: "IBI Capital — חדירה לשוק החרדי",
      systemPrompt: STRATEGIC_ADVISOR_SYSTEM_PROMPT,
      model: "claude-opus-4-7",
      config: { temperature: 0.3 },
      isActive: true,
    },
    update: { systemPrompt: STRATEGIC_ADVISOR_SYSTEM_PROMPT },
  });

  const keyPeople = [
    { name: "טל דורי", role: "מנכ\"ל IBI Capital", tags: ["IBI", "הנהלה"], importance: 10 },
    { name: "שחר וולף", role: "הנהלה IBI", tags: ["IBI", "הנהלה"], importance: 8 },
    { name: "אבי ארנפרונד", role: "הנהלה IBI", tags: ["IBI", "הנהלה"], importance: 7 },
    { name: "בני ספרא", role: "הנהלה IBI", tags: ["IBI", "הנהלה"], importance: 7 },
    { name: "אלעד בורשטיין", role: "מנכ\"ל סוכנות הפיננסים", tags: ["סוכנויות"], importance: 9 },
    { name: "עידו בדש", role: "מנכ\"ל סוכנות הביטוח", tags: ["סוכנויות"], importance: 8 },
    { name: "מורן ביכלר", role: "מנכ\"לית NextStage", tags: ["שטח"], importance: 8 },
    { name: "צביקה ברנשטיין", role: "פעילות שטח", tags: ["שטח"], importance: 7 },
    { name: "משה רוח", role: "מנכ\"ל Family Office / מגזר חרדי", tags: ["חרדי", "Family Office"], importance: 10 },
  ];

  for (const p of keyPeople) {
    const existing = await prisma.contact.findFirst({
      where: { userId: user.id, name: p.name },
    });
    if (!existing) {
      await prisma.contact.create({
        data: { userId: user.id, ...p },
      });
    }
  }

  console.log(`Seed done עבור ${email}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
