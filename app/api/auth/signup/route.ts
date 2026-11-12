import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";


const bodySchema = z.object({
    name: z.string().trim().min(2, "Enter your name").max(80),
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    requestedRole: z.enum(["PATIENT", "DOCTOR", "STAFF"]).default("PATIENT"),
  hospitalId: z.string().min(1).optional(),
    password: z.string().min(8, "Password must be at least 8 characters").max(72),
})

export async function POST(req:Request) {
    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { email, password, name, requestedRole, hospitalId } = parsed.data

  if (requestedRole === "DOCTOR" && !hospitalId) {
    return NextResponse.json({ error: "Choose a hospital for your doctor profile" }, { status: 400 });
  }

  const hospital = requestedRole === "DOCTOR" && hospitalId
    ? await prisma.hospital.findFirst({
        where: { id: hospitalId, status: "APPROVED" },
        select: { id: true },
      })
    : null;
  if (requestedRole === "DOCTOR" && !hospital) {
    return NextResponse.json({ error: "Choose an approved hospital" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({where:{email}})
  if(existing) {
    return NextResponse.json({error:"An Account with this email already exists"},{status:409})
  }
  const passwordHash = await bcrypt.hash(password, 12)

  let user;
  try {
    user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: requestedRole === "DOCTOR" ? "DOCTOR" : "PATIENT",
        requestedRole: requestedRole === "DOCTOR" ? null : requestedRole,
        ...(hospital && {
          doctorProfile: {
            create: { name, hospitalId: hospital.id, isActive: false },
          },
        }),
      },
      select:{id:true,name:true,email:true,role:true}
    })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }
    throw e;
  }

   await createSession(user.id, user.role);
  return NextResponse.json({ ok: true, user }, { status: 201 });
}