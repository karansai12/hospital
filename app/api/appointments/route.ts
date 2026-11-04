import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, authErrorResponse } from "@/lib/auth";
import { generateSlots, istDateString, slotEnd } from "@/lib/slots";

const bodySchema = z.object({
  doctorId: z.string().min(1),
  slotStart: z.string().datetime(),
  reason: z.string().trim().max(300).optional(),
});

export async function POST(req: Request) {
  let user;
  try {
    user = await requireRole(["PATIENT", "ADMIN"]);
  } catch (e) {
    return authErrorResponse(e);
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking details" }, { status: 400 });
  }
  const { doctorId, reason } = parsed.data;
  const slotStart = new Date(parsed.data.slotStart);

  // doctor must exist, be active, and belong to an approved hospital
  const doctor = await prisma.doctor.findFirst({
    where: { id: doctorId, isActive: true, hospital: { status: "APPROVED" } },
    select: { id: true },
  });
  if (!doctor) {
    return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
  }

  // the time must be a real slot, in the future (blocks made-up times)
  const isRealSlot = generateSlots(istDateString(slotStart)).some(
    (s) => s.getTime() === slotStart.getTime()
  );
  if (!isRealSlot || slotStart.getTime() <= Date.now()) {
    return NextResponse.json({ error: "That time is not available" }, { status: 400 });
  }

  try {
    const appointment = await prisma.appointment.create({
      data: {
        patientId: user.id,
        doctorId,
        slotStart,
        slotEnd: slotEnd(slotStart),
        reason: reason || null,
      },
      select: { id: true, slotStart: true },
    });
    return NextResponse.json({ ok: true, appointment }, { status: 201 });
  } catch (e) {
    // the unique index fired: someone else took this slot first
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "Sorry, that slot was just taken. Pick another." }, { status: 409 });
    }
    throw e;
  }
}