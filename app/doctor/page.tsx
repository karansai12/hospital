import { Suspense } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { istDateString } from "@/lib/slots";

export default function DoctorHomePage() {
  return (
    <Suspense fallback={<main className="p-8">Loading...</main>}>
      <DoctorHome />
    </Suspense>
  );
}

async function DoctorHome() {
  const session = await getSession();
  if (!session) redirect("/login?next=/doctor");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, role: true, doctorProfile: { select: { id: true, name: true } } },
  });
  if (!user || user.role !== "DOCTOR") redirect("/");

  if (!user.doctorProfile) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-2xl font-semibold">Welcome, {user.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account is not linked to a doctor profile yet. Ask your hospital to link it.
        </p>
      </main>
    );
  }

  const startOfToday = new Date(`${istDateString(new Date())}T00:00:00+05:30`);
  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId: user.doctorProfile.id,
      status: { not: "CANCELLED" },
      slotStart: { gte: startOfToday },
    },
    include: { patient: { select: { name: true } } },
    orderBy: { slotStart: "asc" },
  });

  const fmt = (d: Date) =>
    d.toLocaleString("en-IN", {
      weekday: "short", day: "numeric", month: "short",
      hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata",
    });

  return (
    <main className="mx-auto max-w-xl space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{user.doctorProfile.name}</h1>
        <p className="text-sm text-muted-foreground">Your upcoming appointments</p>
      </div>

      {appointments.length === 0 ? (
        <p className="rounded-lg border p-4 text-sm text-muted-foreground">No appointments at the moment.</p>
      ) : (
        appointments.map((a) => (
          <div key={a.id} className="rounded-lg border p-4">
            <p className="font-medium">{fmt(a.slotStart)}</p>
            <p className="text-sm">{a.patient.name ?? "Patient"}</p>
            {a.reason && <p className="text-sm text-muted-foreground">{a.reason}</p>}
          </div>
        ))
      )}
    </main>
  );
}