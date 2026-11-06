import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, authErrorResponse } from "@/lib/auth";
import { CHANGE_CUTOFF_MS } from "@/lib/appoinmentRules";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireRole(["PATIENT", "ADMIN"]);
  } catch (e) {
    return authErrorResponse(e);
  }
  const { id } = await params;

  // one atomic update: only my own, only BOOKED, only if far enough in the future
  const result = await prisma.appointment.updateMany({
    where: {
      id,
      patientId: user.id,
      status: "BOOKED",
      slotStart: { gt: new Date(Date.now() + CHANGE_CUTOFF_MS) },
    },
    data: { status: "CANCELLED" },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "This appointment can no longer be cancelled" }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}