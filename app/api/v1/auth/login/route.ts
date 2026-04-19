import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/server/validators/auth";
import { findUserByEmail } from "@/server/services/user.service";
import { comparePassword } from "@/server/auth/password";
import { setAuthCookies } from "@/server/auth/session";
import { jsonError } from "@/server/http";
import { withRateLimit } from "@/server/middleware/with-rate-limit";
import type { TokenPayload } from "@/types/auth";

async function handler(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request", 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request", 400, parsed.error.flatten());
  }

  const user = await findUserByEmail(parsed.data.email);
  if (!user || !user.passwordHash) {
    return jsonError("Invalid email or password", 401);
  }

  if (user.status === "suspended") {
    return jsonError("Account suspended", 403);
  }

  if (user.status === "inactive") {
    return jsonError("Account is inactive — please contact the administrator to activate your account", 403);
  }

  const valid = await comparePassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return jsonError("Invalid email or password", 401);
  }

  const payload: TokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  const res = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });

  setAuthCookies(res, payload, { rememberMe: parsed.data.rememberMe });

  return res;
}

export const POST = withRateLimit(
  "auth:login",
  { limit: 5, windowSec: 900 },
  handler,
);
