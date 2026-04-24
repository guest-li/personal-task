// tests/helpers/db.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function cleanDatabase() {
  await prisma.notification.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.application.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.partnerProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.scholarship.deleteMany();
  await prisma.course.deleteMany();
  await prisma.university.deleteMany();
}

export { prisma as testPrisma };
