import { describe, it, expect } from "vitest";
import { hashPassword, comparePassword } from "@/server/auth/password";

describe("password", () => {
  it("hashes a password and verifies it", async () => {
    const hash = await hashPassword("my-secret-123");
    expect(hash).not.toBe("my-secret-123");
    expect(hash.startsWith("$2b$")).toBe(true);

    const match = await comparePassword("my-secret-123", hash);
    expect(match).toBe(true);
  });

  it("rejects wrong password", async () => {
    const hash = await hashPassword("correct-password");
    const match = await comparePassword("wrong-password", hash);
    expect(match).toBe(false);
  });
});
