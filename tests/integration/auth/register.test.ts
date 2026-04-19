import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/v1/auth/register/route";
import { cleanDatabase, testPrisma } from "../../helpers/db";

function makeRegisterRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/v1/auth/register", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it("registers a new student and returns user data", async () => {
    const res = await POST(makeRegisterRequest({
      name: "Alice",
      email: "alice@example.com",
      password: "securepass123",
      confirmPassword: "securepass123",
      gender: "female",
      country: "China",
    }));

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.user.email).toBe("alice@example.com");
    expect(body.user.role).toBe("student");
    expect(body.user.status).toBe("active");
    expect(body.user.passwordHash).toBeUndefined();

    const dbUser = await testPrisma.user.findUnique({
      where: { email: "alice@example.com" },
    });
    expect(dbUser).not.toBeNull();
    expect(dbUser!.gender).toBe("female");
    expect(dbUser!.country).toBe("China");
  });

  it("sets auth cookies on successful registration", async () => {
    const res = await POST(makeRegisterRequest({
      name: "Bob",
      email: "bob@example.com",
      password: "securepass123",
      confirmPassword: "securepass123",
    }));

    expect(res.status).toBe(201);
    const cookies = res.headers.getSetCookie();
    const cookieStr = cookies.join("; ");
    expect(cookieStr).toContain("access_token=");
    expect(cookieStr).toContain("refresh_token=");
  });

  it("returns 400 for invalid input", async () => {
    const res = await POST(makeRegisterRequest({
      email: "not-an-email",
    }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when passwords do not match", async () => {
    const res = await POST(makeRegisterRequest({
      name: "Mismatch",
      email: "mismatch@example.com",
      password: "securepass123",
      confirmPassword: "differentpass",
    }));
    expect(res.status).toBe(400);
  });

  it("returns 409 for duplicate email", async () => {
    await POST(makeRegisterRequest({
      name: "First",
      email: "dup@example.com",
      password: "securepass123",
      confirmPassword: "securepass123",
    }));

    const res = await POST(makeRegisterRequest({
      name: "Second",
      email: "dup@example.com",
      password: "securepass456",
      confirmPassword: "securepass456",
    }));

    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toContain("already registered");
  });
});
