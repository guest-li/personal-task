import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/server/validators/auth";
import { findUserByEmail } from "@/server/services/user.service";
import { jsonError } from "@/server/http";
import { withRateLimit } from "@/server/middleware/with-rate-limit";
import { sendEmail } from "@/server/email/mailer";
import { resetPasswordEmailHtml } from "@/server/email/templates/reset-password";
import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-me-32chars!";

async function handler(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request", 400);
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request", 400, parsed.error.flatten());
  }

  // Always return 200 to prevent email enumeration
  const user = await findUserByEmail(parsed.data.email);
  if (user) {
    const token = jwt.sign(
      { sub: user.id, purpose: "password-reset" },
      ACCESS_SECRET,
      { expiresIn: "1h" },
    );

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      html: resetPasswordEmailHtml(user.name, resetUrl),
    }).catch((err) => {
      console.error("Failed to send reset email:", err);
    });
  }

  return NextResponse.json({
    message: "If an account with that email exists, a password reset link has been sent.",
  });
}

export const POST = withRateLimit(
  "auth:forgot-password",
  { limit: 3, windowSec: 900 },
  handler,
);
