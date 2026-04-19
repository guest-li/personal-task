import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "./jwt";
import { signAccessToken, signRefreshToken } from "./jwt";
import { AUTH_COOKIE, COOKIE_OPTIONS } from "./constants";
import type { TokenPayload, SessionUser } from "@/types/auth";

export function getCurrentUser(req: NextRequest): TokenPayload | null {
  const token = req.cookies.get(AUTH_COOKIE.ACCESS_TOKEN)?.value;
  if (!token) return null;
  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

export function setAuthCookies(
  res: NextResponse,
  payload: TokenPayload,
  options?: { rememberMe?: boolean },
): NextResponse {
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload, options?.rememberMe);

  res.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60, // 15 minutes in seconds
  });

  const refreshMaxAge = options?.rememberMe
    ? 30 * 24 * 60 * 60 // 30 days
    : 7 * 24 * 60 * 60; // 7 days

  res.cookies.set(AUTH_COOKIE.REFRESH_TOKEN, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: refreshMaxAge,
  });

  return res;
}

export function clearAuthCookies(res: NextResponse): NextResponse {
  res.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, "", {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
  res.cookies.set(AUTH_COOKIE.REFRESH_TOKEN, "", {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
  return res;
}
