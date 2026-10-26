import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";


const boadyschema = z.object({
    name: z.string().trim().min(2, "Enter your name").max(80),
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters").max(72),
})

export async function POST(req:Request) {
    const parsed = boadyschema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const {email,password,name} = parsed.data

  const existing = await prisma.user.findUnique({where:{email}})
  if(existing) {
    return NextResponse.json({error:"An Account with this email already exists"},{status:409})
  }
  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select:{id:true,name:true,email:true,role:true}
  })

   await createSession(user.id, user.role);
  return NextResponse.json({ ok: true, user }, { status: 201 });
}