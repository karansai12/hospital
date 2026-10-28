import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { AppointmentForm } from "@/app/appointmentForm";

export default function DoctorPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<main className="p-8">Loading...</main>}>
      <DoctorContent params={params} />
    </Suspense>
  );
}

async function DoctorContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const doctor = await prisma.doctor.findFirst({
    where: { id, isActive: true, hospital: { status: "APPROVED" } },
    include: { hospital: true, specialties: true },
  });
  if (!doctor) notFound();

  const session = await getSession();

  return (
    <main className="mx-auto max-w-xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{doctor.name}</h1>
        <p className="text-sm text-muted-foreground">
          {doctor.specialties.map((s) => s.name).join(", ")}
          {doctor.qualification ? ` · ${doctor.qualification}` : ""}
        </p>
        <p className="text-sm">{doctor.hospital.name}, {doctor.hospital.city}</p>
      </div>

      {session ? (
        <AppointmentForm doctorId={doctor.id} />
      ) : (
        <p className="rounded-lg border p-4 text-sm">
          <Link href={`/login?next=/doctors/${doctor.id}`} className="underline">Log in</Link> or{" "}
          <Link href="/signup" className="underline">sign up</Link> to book an appointment.
        </p>
      )}
    </main>
  );
}