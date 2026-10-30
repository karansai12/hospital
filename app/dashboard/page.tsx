import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AppointmentForm } from "@/app/appointmentForm";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, role: true },
  });
  if (!user) redirect("/login");

  if (user.role !== "PATIENT") {
    if (!["STAFF", "ADMIN"].includes(user.role)) redirect("/");
    return <main className="p-8">Welcome {user.name} ({user.role})</main>;
  }

  const [doctors, appointments] = await Promise.all([
    prisma.doctor.findMany({
      where: { isActive: true, hospital: { status: "APPROVED" } },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        hospital: { select: { name: true } },
      },
    }),
    prisma.appointment.findMany({
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
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Welcome, {user.name}</h1>
        <p className="text-sm text-muted-foreground">Book an appointment with an available doctor.</p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Book an appointment</h2>
        {doctors.length > 0 ? (
          <AppointmentForm
            doctors={doctors.map((doctor) => ({
              id: doctor.id,
              name: doctor.name,
              hospitalName: doctor.hospital.name,
            }))}
          />
        ) : (
          <p className="text-sm text-muted-foreground">No approved doctors are currently available.</p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Your appointments</h2>
        {appointments.length === 0 ? (
          <p className="text-sm text-muted-foreground">You have no appointments yet.</p>
        ) : (
          <ul className="divide-y rounded-md border">
            {appointments.map((appointment) => (
              <li key={appointment.id} className="space-y-1 p-4">
                <p className="font-medium">{appointment.doctor.name} · {appointment.doctor.hospital.name}</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.slotStart.toLocaleString("en-IN", {
                    dateStyle: "full",
                    timeStyle: "short",
                    timeZone: "Asia/Kolkata",
                  })} · {appointment.status.replaceAll("_", " ")}
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