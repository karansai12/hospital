import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, authErrorResponse } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["ADMIN"]);
  } catch (e) {
    return authErrorResponse(e);
  }
  const { id } = await params;

  const doctor = await prisma.doctor.findFirst({
    where: { id, isActive: false, userId: { not: null }, user: { requestedRole: "DOCTOR" } },
    select: { userId: true },
  });
  if (!doctor?.userId) {
    return NextResponse.json({ error: "No pending request found" }, { status: 404 });
  }

  // an inactive doctor can have no appointments, so deleting the profile is safe
  await prisma.$transaction([
    prisma.doctor.deleteMany({ where: { id, isActive: false } }),
    prisma.user.update({ where: { id: doctor.userId }, data: { requestedRole: null } }),
  ]);

  return NextResponse.json({ ok: true });
}