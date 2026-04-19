// tests/helpers/db.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function cleanDatabase() {
  await prisma.certificate.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.partnerProfile.deleteMany();
  await prisma.user.deleteMany();
}

export { prisma as testPrisma };
