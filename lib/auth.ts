import type { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export class AuthError extends Error {
  constructor(public status: 401 | 403) {
    super(status === 401 ? "Not logged in" : "Not allowed");
  }
}

// Use in API routes and server code. Throws AuthError if the check fails.
export async function requireRole(allowed: Role[]) {
  const session = await getSession();
  if (!session) throw new AuthError(401);

  // re-read the role from the database, so a changed role applies immediately
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true },
  });
  if (!user) throw new AuthError(401);
  if (!allowed.includes(user.role)) throw new AuthError(403);

  return user;
}

// Turns an AuthError into a proper JSON response
export function authErrorResponse(e: unknown) {
  if (e instanceof AuthError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  throw e;
}