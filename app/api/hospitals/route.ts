import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const hospitals = await prisma.hospital.findMany({
    where: { status: "APPROVED" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, city: true },
  });

  return NextResponse.json({ hospitals });
}