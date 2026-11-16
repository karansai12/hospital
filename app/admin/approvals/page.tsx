import { Suspense } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ApprovalButtons } from "./approvals-button";


export default function ApprovalsPage() {
  return (
    <Suspense fallback={<main className="p-8">Loading...</main>}>
      <Approvals />
    </Suspense>
  );
}

async function Approvals() {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin/approvals");

  const me = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } });
  if (me?.role !== "ADMIN") redirect("/");

  const pending = await prisma.doctor.findMany({
    where: { isActive: false, user: { requestedRole: "DOCTOR" } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      hospital: { select: { name: true, city: true } },
      user: { select: { email: true } },
    },
  });

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Doctor approvals</h1>
      {pending.length === 0 ? (
        <p className="text-sm text-muted-foreground">No pending requests.</p>
      ) : (
        <ul className="divide-y rounded-md border">
          {pending.map((d) => (
            <li key={d.id} className="space-y-2 p-4">
              <p className="font-medium">{d.name}</p>
              <p className="text-sm text-muted-foreground">
                {d.user?.email} · wants to join {d.hospital.name}, {d.hospital.city}
              </p>
              <ApprovalButtons doctorId={d.id} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}