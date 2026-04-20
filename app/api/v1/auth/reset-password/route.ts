import { NextRequest, NextResponse } from "next/server";
import { resetPasswordSchema } from "@/server/validators/auth";
import { findUserById } from "@/server/services/user.service";
import { hashPassword } from "@/server/auth/password";
import { jsonError } from "@/server/http";
import { withRateLimit } from "@/server/middleware/with-rate-limit";
import { prisma } from "@/server/db";
import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-me-32chars!";

async function handler(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request", 400);
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request", 400, parsed.error.flatten());
  }

  let payload: { sub: string; purpose: string };
  try {
    payload = jwt.verify(parsed.data.token, ACCESS_SECRET) as typeof payload;
  } catch {
    return jsonError("Invalid or expired reset token", 400);
  }

  if (payload.purpose !== "password-reset") {
    return jsonError("Invalid token", 400);
  }

  const user = await findUserById(payload.sub);
  if (!user) {
    return jsonError("User not found", 404);
  }

  const newHash = await hashPassword(parsed.data.password);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  return NextResponse.json({
    message: "Password has been reset successfully. You can now sign in.",
  });
}

export const POST = withRateLimit(
  "auth:reset-password",
  { limit: 5, windowSec: 900 },
  handler,
);
