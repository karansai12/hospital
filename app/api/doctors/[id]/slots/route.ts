import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSlots, isValidDateString } from "@/lib/slots";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const date = new URL(req.url).searchParams.get("date") ?? "";
  if (!isValidDateString(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const all = generateSlots(date);
  const booked = await prisma.appointment.findMany({
    where: { doctorId: id, status: { not: "CANCELLED" }, slotStart: { in: all } },
    select: { slotStart: true },
  });

  const taken = new Set(booked.map((b) => b.slotStart.getTime()));
  const now = Date.now();
  const available = all.filter((s) => s.getTime() > now && !taken.has(s.getTime()));

  return NextResponse.json({ slots: available.map((s) => s.toISOString()) });
}