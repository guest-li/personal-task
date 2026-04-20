import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as logoutHandler } from "@/app/api/v1/auth/logout/route";
import { POST as refreshHandler } from "@/app/api/v1/auth/refresh/route";
import { signAccessToken, signRefreshToken } from "@/server/auth/jwt";
import { AUTH_COOKIE } from "@/server/auth/constants";
import { redis } from "@/server/redis";
import { cleanDatabase } from "../../helpers/db";
import { createTestUser } from "../../helpers/auth";
import type { TokenPayload } from "@/types/auth";

describe("logout + refresh", () => {
  let payload: TokenPayload;
  let refreshToken: string;

  beforeEach(async () => {
    await cleanDatabase();
    // Flush rate limit keys
    const keys = await redis.keys("ratelimit:*");
    if (keys.length > 0) await redis.del(...keys);
    // Flush blacklist keys
    const blKeys = await redis.keys("blacklist:*");
    if (blKeys.length > 0) await redis.del(...blKeys);

    const user = await createTestUser({ email: "auth@test.com" });
    payload = { sub: user.id, email: user.email, role: user.role };
    refreshToken = signRefreshToken(payload);
  });

  describe("POST /api/v1/auth/refresh", () => {
    it("issues new access token from valid refresh token", async () => {
      const req = new NextRequest("http://localhost/api/v1/auth/refresh", {
        method: "POST",
      });
      req.cookies.set(AUTH_COOKIE.REFRESH_TOKEN, refreshToken);

      const res = await refreshHandler(req);
      expect(res.status).toBe(200);

      const cookies = res.headers.getSetCookie().join("; ");
      expect(cookies).toContain("access_token=");
    });

    it("returns 401 without refresh token", async () => {
      const req = new NextRequest("http://localhost/api/v1/auth/refresh", {
        method: "POST",
      });
      const res = await refreshHandler(req);
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    it("clears cookies and blacklists refresh token", async () => {
      const req = new NextRequest("http://localhost/api/v1/auth/logout", {
        method: "POST",
      });
      req.cookies.set(AUTH_COOKIE.REFRESH_TOKEN, refreshToken);

      const res = await logoutHandler(req);
      expect(res.status).toBe(200);

      // Cookies should be cleared (maxAge=0)
      const cookies = res.headers.getSetCookie().join("; ");
      expect(cookies).toContain("access_token=;");

      // Refresh token should now be blacklisted — using it should fail
      const refreshReq = new NextRequest("http://localhost/api/v1/auth/refresh", {
        method: "POST",
      });
      refreshReq.cookies.set(AUTH_COOKIE.REFRESH_TOKEN, refreshToken);
      const refreshRes = await refreshHandler(refreshReq);
      expect(refreshRes.status).toBe(401);
    });
  });
});
