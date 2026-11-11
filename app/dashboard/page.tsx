import { redirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <Suspense fallback={<main className="p-8">Loading...</main>}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, role: true },
  });
  if (!user) redirect("/login");
  if (user.role === "DOCTOR") redirect("/doctor");

  if (user.role !== "PATIENT") {
    if (!["STAFF", "ADMIN"].includes(user.role)) redirect("/");
    return <main className="p-8">Welcome {user.name} ({user.role})</main>;
  }

  const appointments = await prisma.appointment.findMany({
    where: { patientId: session.userId },
    orderBy: { slotStart: "asc" },
    select: {
      id: true,
      slotStart: true,
      reason: true,
      status: true,
      doctor: {
        select: {
          name: true,
          hospital: { select: { name: true } },
        },
      },
    },
  });

  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 p-6">
      <section className="space-y-4">
        <section className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-medium">Your appointments</h2>
          <Link href="/bookNow" className={buttonVariants()}>
            Book appointment
          </Link>
        </section>
        {appointments.length === 0 ? (
          <p className="text-sm text-muted-foreground">You have no appointments yet.</p>
        ) : (
          <ul className="divide-y rounded-md border">
            {appointments.map((appointment) => (
              <li key={appointment.id} className="space-y-1 p-4">
                <p className="font-medium">
                  {appointment.doctor.name} · {appointment.doctor.hospital.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {appointment.slotStart.toLocaleString("en-IN", {
                    dateStyle: "full",
                    timeStyle: "short",
                    timeZone: "Asia/Kolkata",
                  })}{" "}
                  · {appointment.status.replaceAll("_", " ")}
                </p>
                {appointment.reason && <p className="text-sm">Reason: {appointment.reason}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}