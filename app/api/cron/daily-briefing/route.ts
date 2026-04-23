import { NextResponse } from "next/server";

// Vercel Cron יגיע עם Authorization: Bearer $CRON_SECRET (מוגדר ב-env).
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // TODO: Phase 1D — שליפת מיילים, יצירת briefing דרך Claude, שמירה ב-DB, שליחה ב-WhatsApp (Phase 1C).
  return NextResponse.json({ status: "not_implemented", phase: "1D" });
}
