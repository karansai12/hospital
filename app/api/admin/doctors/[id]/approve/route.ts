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

  // both changes succeed together or neither does
  await prisma.$transaction([
    prisma.user.update({ where: { id: doctor.userId }, data: { role: "DOCTOR", requestedRole: null } }),
    prisma.doctor.update({ where: { id }, data: { isActive: true } }),
  ]);

  return NextResponse.json({ ok: true });
}