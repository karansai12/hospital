import { NextResponse } from "next/server";
import { requireRole, authErrorResponse } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireRole(["ADMIN"]);
    return NextResponse.json({ ok: true, message: "Hello admin", userId: user.id });
  } catch (e) {
    return authErrorResponse(e);
  }
}