import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, role: true },
  });
  if (!user || !["STAFF", "ADMIN"].includes(user.role)) redirect("/");

  return <main className="p-8">Welcome {user.name} ({user.role})</main>;
}