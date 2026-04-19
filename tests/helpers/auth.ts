// tests/helpers/auth.ts
import { testPrisma } from "./db";

export async function createTestUser(overrides: {
  email?: string;
  name?: string;
  role?: "student" | "partner" | "admin";
  passwordHash?: string;
  status?: "active" | "inactive" | "suspended";
} = {}) {
  return testPrisma.user.create({
    data: {
      email: overrides.email ?? `test-${Date.now()}@example.com`,
      name: overrides.name ?? "Test User",
      role: overrides.role ?? "student",
      passwordHash: overrides.passwordHash ?? "not-a-real-hash",
      status: overrides.status ?? "active",
    },
  });
}
