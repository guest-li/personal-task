import { describe, it, expect, beforeEach } from "vitest";
import { createUser, findUserByEmail, findUserById } from "@/server/services/user.service";
import { testPrisma, cleanDatabase } from "../../helpers/db";

describe("user.service", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it("creates a student user with hashed password", async () => {
    const user = await createUser({
      name: "Alice",
      email: "alice@example.com",
      password: "securepass123",
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe("alice@example.com");
    expect(user.name).toBe("Alice");
    expect(user.role).toBe("student");
    expect(user.passwordHash).not.toBe("securepass123");
    expect(user.passwordHash!.startsWith("$2b$")).toBe(true);
  });

  it("rejects duplicate email", async () => {
    await createUser({ name: "A", email: "dup@test.com", password: "pass1234" });
    await expect(
      createUser({ name: "B", email: "dup@test.com", password: "pass5678" }),
    ).rejects.toThrow();
  });

  it("finds user by email", async () => {
    await createUser({ name: "Bob", email: "bob@test.com", password: "pass1234" });
    const found = await findUserByEmail("bob@test.com");
    expect(found).not.toBeNull();
    expect(found!.name).toBe("Bob");
  });

  it("returns null for unknown email", async () => {
    const found = await findUserByEmail("nobody@test.com");
    expect(found).toBeNull();
  });

  it("finds user by ID", async () => {
    const user = await createUser({ name: "Carol", email: "carol@test.com", password: "pass1234" });
    const found = await findUserById(user.id);
    expect(found).not.toBeNull();
    expect(found!.email).toBe("carol@test.com");
  });
});
