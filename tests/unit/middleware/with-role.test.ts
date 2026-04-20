// tests/unit/middleware/with-role.test.ts
import { describe, it, expect } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/server/middleware/with-role";
import { signAccessToken } from "@/server/auth/jwt";
import { AUTH_COOKIE } from "@/server/auth/constants";
import type { TokenPayload } from "@/types/auth";

function makeAuthRequest(role: TokenPayload["role"]): NextRequest {
  const payload: TokenPayload = { sub: "user-1", email: "t@e.com", role };
  const token = signAccessToken(payload);
  const req = new NextRequest("http://localhost/api/test");
  req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);
  return req;
}

describe("withRole", () => {
  it("allows matching role", async () => {
    const handler = withRole(["admin"], async (_req, { user }) => {
      return NextResponse.json({ role: user.role });
    });
    const res = await handler(makeAuthRequest("admin"), { params: {} });
    expect(res.status).toBe(200);
  });

  it("returns 403 for non-matching role", async () => {
    const handler = withRole(["admin"], async () => NextResponse.json({}));
    const res = await handler(makeAuthRequest("student"), { params: {} });
    expect(res.status).toBe(403);
  });

  it("returns 401 when not authenticated", async () => {
    const handler = withRole(["admin"], async () => NextResponse.json({}));
    const req = new NextRequest("http://localhost/api/test");
    const res = await handler(req, { params: {} });
    expect(res.status).toBe(401);
  });
});
