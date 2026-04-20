import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken, signAccessToken } from "@/server/auth/jwt";
import { AUTH_COOKIE, COOKIE_OPTIONS } from "@/server/auth/constants";
import { redis } from "@/server/redis";
import { jsonError } from "@/server/http";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE.REFRESH_TOKEN)?.value;
  if (!token) {
    return jsonError("Unauthorized", 401);
  }

  // Check if token is blacklisted
  const blacklisted = await redis.get(`blacklist:${token}`);
  if (blacklisted) {
    return jsonError("Unauthorized", 401);
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    return jsonError("Unauthorized", 401);
  }

  const newAccessToken = signAccessToken({
    sub: payload.sub,
    email: payload.email,
    role: payload.role,
  });

  const res = NextResponse.json({ success: true });
  res.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, newAccessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60,
  });

  return res;
}
