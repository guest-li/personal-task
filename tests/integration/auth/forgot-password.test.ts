import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as forgotPost } from "@/app/api/v1/auth/forgot-password/route";
import { POST as resetPost } from "@/app/api/v1/auth/reset-password/route";
import { cleanDatabase, testPrisma } from "../../helpers/db";
import { createTestUser } from "../../helpers/auth";
import { hashPassword, comparePassword } from "@/server/auth/password";

vi.mock("@/server/email/mailer", () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

describe("Forgot/Reset Password flow", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it("returns 200 for forgot-password even if email not found (no leak)", async () => {
    const req = new NextRequest("http://localhost/api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: "nobody@test.com" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await forgotPost(req);
    expect(res.status).toBe(200);
  });

  it("returns 200 for forgot-password with valid email", async () => {
    const hash = await hashPassword("oldpass123");
    await createTestUser({ email: "user@test.com", passwordHash: hash });

    const req = new NextRequest("http://localhost/api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: "user@test.com" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await forgotPost(req);
    expect(res.status).toBe(200);
  });

  it("resets password with valid token", async () => {
    const hash = await hashPassword("oldpass123");
    const user = await createTestUser({ email: "reset@test.com", passwordHash: hash });

    // Generate token directly for testing
    const jwt = await import("jsonwebtoken");
    const token = jwt.default.sign(
      { sub: user.id, purpose: "password-reset" },
      process.env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-me-32chars!",
      { expiresIn: "1h" },
    );

    const req = new NextRequest("http://localhost/api/v1/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        token,
        password: "newpass456",
        confirmPassword: "newpass456",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await resetPost(req);
    expect(res.status).toBe(200);

    const updated = await testPrisma.user.findUnique({ where: { id: user.id } });
    const valid = await comparePassword("newpass456", updated!.passwordHash!);
    expect(valid).toBe(true);
  });

  it("returns 400 for invalid/expired token", async () => {
    const req = new NextRequest("http://localhost/api/v1/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        token: "invalid-token",
        password: "newpass456",
        confirmPassword: "newpass456",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await resetPost(req);
    expect(res.status).toBe(400);
  });
});
