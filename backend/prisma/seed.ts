import { PrismaClient, ReportStatus, RoleType, InternshipStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { format, addDays, addWeeks } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  const hash = async (password: string) => await bcrypt.hash(password, 10);

  // 1. Create faculties
  const facultyNames = ["Computing", "Finance", "Education", "Law"];
  const faculties: Record<string, { id: number; name: string }> = {};

  for (const name of facultyNames) {
    const faculty = await prisma.faculty.upsert({
      where: { name: `Faculty of ${name}` },
      update: {},
      create: { name: `Faculty of ${name}` },
    });
    faculties[name] = faculty;
  }

  // 2. Create one admin
  await prisma.user.upsert({
    where: { email: "admin@uok.com" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@uok.com",
      password: await hash("admin123"),
      role: RoleType.ADMIN,
      createdAt: new Date(),
    },
  });

  // 3. Create supervisors
  const supervisorData = [
    { name: "Supervisor Alex", email: "supervisor1@uok.com" },
    { name: "Supervisor Brian", email: "supervisor2@uok.com" },
    { name: "Supervisor David", email: "supervisor3@uok.com"},
    { name: "Supervisor Fred", email: "supervisor4@uok.com"},
    { name: "Supervisor Joseph", email: "supervisor5@uok.com"},
  ];

  for (const supervisor of supervisorData) {
    await prisma.user.upsert({
      where: { email: supervisor.email },
      update: {},
      create: {
        name: supervisor.name,
        email: supervisor.email,
        password: await hash("supervisor123"),
        role: RoleType.SUPERVISOR,
        createdAt: new Date(),
      },
    });
  }

  const supervisors = await prisma.user.findMany({ where: { role: RoleType.SUPERVISOR } });
  if (supervisors.length === 0) {
    throw new Error("No supervisors found. Cannot assign reviewers.");
  }

  // 4. Create deans, lecturers, and students per faculty
  for (const name of facultyNames) {
    const faculty = faculties[name];
    const lower = name.toLowerCase();

    await prisma.user.upsert({
      where: { email: `dean.${lower}@uok.com` },
      update: {},
      create: {
        name: `${name} Dean`,
        email: `dean.${lower}@uok.com`,
        password: await hash("dean123"),
        role: RoleType.DEAN,
        facultyId: faculty.id,
        createdAt: new Date(),
      },
    });

    await prisma.user.upsert({
      where: { email: `lecturer.${lower}@uok.com` },
      update: {},
      create: {
        name: `${name} Lecturer`,
        email: `lecturer.${lower}@uok.com`,
        password: await hash("lecturer123"),
        role: RoleType.LECTURER,
        facultyId: faculty.id,
        createdAt: new Date(),
      },
    });

    // Create student + internship via relation
    await prisma.user.upsert({
      where: { email: `student.${lower}@uok.com` },
      update: {},
      create: {
        name: `${name} Student`,
        email: `student.${lower}@uok.com`,
        password: await hash("student123"),
        role: RoleType.STUDENT,
        facultyId: faculty.id,
        createdAt: new Date(),
        internships: {
          create: {
            company: `${name} Tech Labs`,
            department: "Engineering",
            startDate: new Date("2025-06-02"),
            endDate: new Date("2025-08-31"),
            supervisor: supervisors[0]?.name ?? "Default Supervisor",
            status: InternshipStatus.PENDING,
          },
        },
      },
    });
  }

}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });