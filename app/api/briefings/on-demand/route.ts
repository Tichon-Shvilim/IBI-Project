import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateBriefing } from "@/lib/ai/briefing";

export const maxDuration = 60;

// Trigger a briefing on demand from the dashboard (e.g. "רענן סיכום" button).
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { briefing, usage } = await generateBriefing({
      userId: session.user.id,
      type: "on-demand",
    });
    return NextResponse.json({
      id: briefing.id,
      summary: briefing.summary,
      whatsappDraft: briefing.whatsappDraft,
      usage,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
