import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@educonsultancy.com" },
    update: {},
    create: {
      email: "admin@educonsultancy.com",
      name: "Admin",
      passwordHash: await bcrypt.hash("admin1234", 12),
      role: "admin",
    },
  });
  console.log(`Admin: ${admin.email} (${admin.id})`);

  const student = await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: {},
    create: {
      email: "student@example.com",
      name: "Jane Student",
      passwordHash,
      role: "student",
      phone: "+1234567890",
      gender: "female",
      country: "Bangladesh",
      studentProfile: {
        create: {
          bio: "Aspiring computer science student looking to study abroad.",
          passportNid: "AB1234567",
          qualification: "bachelor",
          interestedMajor: "Computer Science",
          lastAcademicResult: "3.8 GPA",
          experience: "2 years research assistant",
          language: "English, Bengali",
          address: "123 Main St, Dhaka",
        },
      },
      certificates: {
        create: [
          { name: "IELTS Certificate", fileUrl: "/uploads/certs/ielts.pdf" },
          { name: "Bachelor Degree", fileUrl: "/uploads/certs/degree.pdf" },
        ],
      },
    },
  });
  console.log(`Student: ${student.email} (${student.id})`);

  const partner = await prisma.user.upsert({
    where: { email: "partner@example.com" },
    update: {},
    create: {
      email: "partner@example.com",
      name: "John Partner",
      passwordHash,
      role: "partner",
      phone: "+9876543210",
      gender: "male",
      country: "United Kingdom",
      partnerProfile: {
        create: {
          qualifications: "MBA, Certified Education Consultant",
          experience: "10 years in education consulting",
          specializationAreas: ["UK Universities", "Scholarship Applications"],
          level: "advanced",
          bio: "Senior education partner specializing in UK university admissions.",
        },
      },
    },
  });
  console.log(`Partner: ${partner.email} (${partner.id})`);

  const inactivePartner = await prisma.user.upsert({
    where: { email: "inactive-partner@example.com" },
    update: {},
    create: {
      email: "inactive-partner@example.com",
      name: "Inactive Partner",
      passwordHash,
      role: "partner",
      status: "inactive",
      partnerProfile: {
        create: {
          level: "beginner",
        },
      },
    },
  });
  console.log(`Inactive Partner: ${inactivePartner.email} (${inactivePartner.id})`);

  const now = new Date();
  const applications = await Promise.all([
    prisma.application.create({
      data: {
        applicationCode: `APP-${now.toISOString().slice(0, 10).replace(/-/g, "")}-001`,
        userId: student.id,
        programName: "MSc Computer Science",
        universityName: "University of Oxford",
        degree: "Master",
        language: "English",
        fundType: "scholarship",
        status: "approved",
        applicationFee: 150,
        applicationFeePaid: 150,
        serviceCharge: 50,
        serviceChargePaid: 50,
      },
    }),
    prisma.application.create({
      data: {
        applicationCode: `APP-${now.toISOString().slice(0, 10).replace(/-/g, "")}-002`,
        userId: student.id,
        programName: "MSc Data Science",
        universityName: "Imperial College London",
        degree: "Master",
        language: "English",
        fundType: "self_funded",
        status: "pending",
        applicationFee: 200,
        applicationFeePaid: 0,
        serviceCharge: 75,
        serviceChargePaid: 0,
      },
    }),
    prisma.application.create({
      data: {
        applicationCode: `APP-${now.toISOString().slice(0, 10).replace(/-/g, "")}-003`,
        userId: student.id,
        programName: "BSc Software Engineering",
        universityName: "University of Manchester",
        degree: "Bachelor",
        language: "English",
        fundType: "self_funded",
        status: "rejected",
        applicationFee: 100,
        applicationFeePaid: 100,
        serviceCharge: 50,
        serviceChargePaid: 50,
      },
    }),
  ]);
  console.log(`Created ${applications.length} applications`);

  const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const pastDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const events = await Promise.all([
    prisma.event.create({
      data: {
        name: "UK University Fair 2026",
        startDate: futureDate,
        endDate: new Date(futureDate.getTime() + 2 * 24 * 60 * 60 * 1000),
        price: 25,
        category: "Fair",
        location: "Dhaka Convention Center",
        description: "Meet representatives from top UK universities.",
        status: "upcoming",
      },
    }),
    prisma.event.create({
      data: {
        name: "Scholarship Workshop",
        startDate: pastDate,
        endDate: new Date(pastDate.getTime() + 1 * 24 * 60 * 60 * 1000),
        price: 0,
        category: "Workshop",
        location: "Online",
        description: "Learn how to apply for international scholarships.",
        status: "past",
      },
    }),
  ]);
  console.log(`Created ${events.length} events`);

  await Promise.all([
    prisma.eventRegistration.create({
      data: {
        userId: student.id,
        eventId: events[0].id,
        paymentStatus: "paid",
      },
    }),
    prisma.eventRegistration.create({
      data: {
        userId: student.id,
        eventId: events[1].id,
        paymentStatus: "paid",
      },
    }),
  ]);
  console.log("Created 2 event registrations");

  await Promise.all([
    prisma.notification.create({
      data: {
        userId: student.id,
        title: "Application Approved",
        message: "Your application to University of Oxford MSc Computer Science has been approved!",
        isRead: true,
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.notification.create({
      data: {
        userId: student.id,
        title: "Application Rejected",
        message: "Unfortunately, your application to University of Manchester has been rejected.",
        isRead: true,
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.notification.create({
      data: {
        userId: student.id,
        title: "Event Reminder",
        message: "UK University Fair 2026 is coming up in 30 days. Don't forget to attend!",
        isRead: false,
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.notification.create({
      data: {
        userId: student.id,
        title: "Profile Incomplete",
        message: "Please complete your profile to improve your application chances.",
        isRead: false,
      },
    }),
    prisma.notification.create({
      data: {
        userId: partner.id,
        title: "Welcome Partner",
        message: "Welcome to the Education Consultancy platform. Your partner account has been activated.",
        isRead: false,
      },
    }),
  ]);
  console.log("Created 5 notifications");

  console.log("\nSeed complete! Login credentials:");
  console.log("  Admin:   admin@educonsultancy.com / admin1234");
  console.log("  Student: student@example.com / password123");
  console.log("  Partner: partner@example.com / password123");
  console.log("  Inactive Partner: inactive-partner@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
