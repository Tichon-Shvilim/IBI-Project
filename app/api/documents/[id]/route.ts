import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const doc = await prisma.document.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!doc) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await prisma.document.delete({ where: { id: doc.id } });
  return NextResponse.json({ ok: true, id: doc.id });
}
