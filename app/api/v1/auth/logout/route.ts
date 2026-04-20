import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/server/auth/constants";
import { redis } from "@/server/redis";
import { clearAuthCookies } from "@/server/auth/session";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(AUTH_COOKIE.REFRESH_TOKEN)?.value;

  // Blacklist the refresh token for 7 days (its max lifespan)
  if (refreshToken) {
    await redis.set(`blacklist:${refreshToken}`, "1", "EX", 7 * 24 * 60 * 60);
  }

  const res = NextResponse.json({ success: true });
  clearAuthCookies(res);

  return res;
}
