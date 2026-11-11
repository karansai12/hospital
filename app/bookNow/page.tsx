import { redirect } from "next/navigation";
import { AppointmentForm } from "@/app/appointmentForm";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";


export default async function BookNow() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, role: true },
  });
  if (!user) redirect("/login");
  if (user.role === "DOCTOR") redirect("/doctor");
  if (user.role !== "PATIENT" && user.role !== "ADMIN") redirect("/dashboard");

  const doctors = await prisma.doctor.findMany({
    where: { isActive: true, hospital: { status: "APPROVED" } },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      hospital: { select: { name: true } },
    },
  });

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
      <Link href="/dashboard" className={buttonVariants()}>
      Your appointments
      </Link>
        </main>
    )
}