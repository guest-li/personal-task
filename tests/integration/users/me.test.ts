import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/v1/users/me/route";
import { signAccessToken } from "@/server/auth/jwt";
import { AUTH_COOKIE } from "@/server/auth/constants";
import { cleanDatabase } from "../../helpers/db";
import { createTestUser } from "../../helpers/auth";
import type { TokenPayload } from "@/types/auth";

describe("GET /api/v1/users/me", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it("returns current user when authenticated", async () => {
    const user = await createTestUser({ email: "me@test.com", name: "Me" });
    const token = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const req = new NextRequest("http://localhost/api/v1/users/me");
    req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);

    const res = await GET(req, { params: {} });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.user.email).toBe("me@test.com");
    expect(body.user.name).toBe("Me");
    expect(body.user.passwordHash).toBeUndefined();
  });

  it("returns 401 when not authenticated", async () => {
    const req = new NextRequest("http://localhost/api/v1/users/me");
    const res = await GET(req, { params: {} });
    expect(res.status).toBe(401);
  });
});
