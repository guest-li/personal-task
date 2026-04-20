// tests/unit/middleware/with-auth.test.ts
import { describe, it, expect } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/server/middleware/with-auth";
import { signAccessToken } from "@/server/auth/jwt";
import { AUTH_COOKIE } from "@/server/auth/constants";
import type { TokenPayload } from "@/types/auth";

function makeRequest(cookie?: string): NextRequest {
  const req = new NextRequest("http://localhost/api/test", {
    method: "GET",
  });
  if (cookie) {
    req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, cookie);
  }
  return req;
}

describe("withAuth", () => {
  const payload: TokenPayload = {
    sub: "user-1",
    email: "test@example.com",
    role: "student",
  };

  it("returns 401 when no auth cookie present", async () => {
    const handler = withAuth(async (_req, { user }) => {
      return NextResponse.json({ user });
    });

    const res = await handler(makeRequest(), { params: {} });
    expect(res.status).toBe(401);
  });

  it("passes user to handler when valid token present", async () => {
    const token = signAccessToken(payload);
    const handler = withAuth(async (_req, { user }) => {
      return NextResponse.json({ userId: user.sub });
    });

    const res = await handler(makeRequest(token), { params: {} });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.userId).toBe("user-1");
  });

  it("returns 401 when token is invalid", async () => {
    const handler = withAuth(async () => NextResponse.json({}));
    const res = await handler(makeRequest("bad-token"), { params: {} });
    expect(res.status).toBe(401);
  });
});
