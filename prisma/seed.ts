import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const specialties = ["General Physician", "Pediatrics", "Cardiology", "Orthopedics", "Dermatology", "Gynecology"];

const hospitals = [
  {
    slug: "demo-city-hospital", name: "Demo City Hospital", city: "Tiruchirappalli",
    address: "12 Main Road, Thillai Nagar", phone: "9000000001",
    doctors: [
      { id: "seed-doctor-1", name: "Dr. Demo Kumar", qualification: "MBBS, MD", experienceYears: 12, specialties: ["General Physician"] },
      { id: "seed-doctor-2", name: "Dr. Demo Priya", qualification: "MBBS, DCH", experienceYears: 8, specialties: ["Pediatrics"] },
    ],
  },
  {
    slug: "demo-heart-clinic", name: "Demo Heart Clinic", city: "Tiruchirappalli",
    address: "45 Salai Road, Cantonment", phone: "9000000002",
    doctors: [
      { id: "seed-doctor-3", name: "Dr. Demo Raj", qualification: "MBBS, DM", experienceYears: 15, specialties: ["Cardiology"] },
      { id: "seed-doctor-4", name: "Dr. Demo Anitha", qualification: "MBBS, MD", experienceYears: 10, specialties: ["General Physician", "Dermatology"] },
    ],
  },
  {
    slug: "demo-care-hospital", name: "Demo Care Hospital", city: "Chennai",
    address: "8 Anna Salai", phone: "9000000003",
    doctors: [
      { id: "seed-doctor-5", name: "Dr. Demo Ravi", qualification: "MBBS, MS", experienceYears: 14, specialties: ["Orthopedics"] },
      { id: "seed-doctor-6", name: "Dr. Demo Meena", qualification: "MBBS, MD", experienceYears: 9, specialties: ["Gynecology"] },
    ],
  },
];

async function main() {
  for (const name of specialties) {
    await prisma.specialty.upsert({ where: { name }, update: {}, create: { name } });
  }

  for (const { doctors, ...h } of hospitals) {
    const hospital = await prisma.hospital.upsert({
      where: { slug: h.slug },
      update: {},
      create: { ...h, state: "Tamil Nadu", status: "APPROVED" },
    });

    for (const d of doctors) {
      const { specialties: names, ...fields } = d;
      await prisma.doctor.upsert({
        where: { id: d.id },
        update: {},
        create: {
          ...fields,
          hospitalId: hospital.id,
          specialties: { connect: names.map((name) => ({ name })) },
        },
      });
    }
  }

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());