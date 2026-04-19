import { prisma } from "@/server/db";
import { hashPassword } from "@/server/auth/password";

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phone?: string | null;
  gender?: "male" | "female" | "other" | null;
  country?: string | null;
}

export async function createUser(
  input: CreateUserInput,
  role: "student" | "partner" = "student",
) {
  const passwordHash = await hashPassword(input.password);

  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
      phone: input.phone ?? null,
      gender: input.gender ?? null,
      country: input.country ?? null,
      role,
      status: role === "partner" ? "inactive" : "active",
    },
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}
