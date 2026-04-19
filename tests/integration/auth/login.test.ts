import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/v1/auth/login/route";
import { cleanDatabase } from "../../helpers/db";
import { createTestUser } from "../../helpers/auth";
import { hashPassword } from "@/server/auth/password";

function makeLoginRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/v1/auth/login", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it("logs in with correct credentials and returns cookies", async () => {
    const hash = await hashPassword("correctpass");
    await createTestUser({ email: "login@test.com", passwordHash: hash });

    const res = await POST(makeLoginRequest({
      email: "login@test.com",
      password: "correctpass",
    }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.email).toBe("login@test.com");

    const cookies = res.headers.getSetCookie();
    expect(cookies.join("; ")).toContain("access_token=");
  });

  it("returns 401 for wrong password", async () => {
    const hash = await hashPassword("correctpass");
    await createTestUser({ email: "wrong@test.com", passwordHash: hash });

    const res = await POST(makeLoginRequest({
      email: "wrong@test.com",
      password: "wrongpass",
    }));

    expect(res.status).toBe(401);
  });

  it("returns 401 for non-existent email", async () => {
    const res = await POST(makeLoginRequest({
      email: "noone@test.com",
      password: "anything",
    }));

    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid body", async () => {
    const res = await POST(makeLoginRequest({ email: "bad" }));
    expect(res.status).toBe(400);
  });

  it("returns 403 for suspended user", async () => {
    const hash = await hashPassword("pass1234");
    await createTestUser({
      email: "suspended@test.com",
      passwordHash: hash,
      status: "suspended",
    });

    const res = await POST(makeLoginRequest({
      email: "suspended@test.com",
      password: "pass1234",
    }));

    expect(res.status).toBe(403);
  });

  it("returns 403 for inactive partner", async () => {
    const hash = await hashPassword("pass1234");
    await createTestUser({
      email: "inactive-partner@test.com",
      passwordHash: hash,
      role: "partner",
      status: "inactive",
    });

    const res = await POST(makeLoginRequest({
      email: "inactive-partner@test.com",
      password: "pass1234",
    }));

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("inactive");
  });

  it("sets extended cookie when rememberMe is true", async () => {
    const hash = await hashPassword("pass1234");
    await createTestUser({ email: "remember@test.com", passwordHash: hash });

    const res = await POST(makeLoginRequest({
      email: "remember@test.com",
      password: "pass1234",
      rememberMe: true,
    }));

    expect(res.status).toBe(200);
    const cookies = res.headers.getSetCookie();
    const refreshCookie = cookies.find((c) => c.includes("refresh_token="));
    expect(refreshCookie).toContain("Max-Age=2592000"); // 30 days
  });
});
