import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/server/validators/auth";
import { createUser, findUserByEmail } from "@/server/services/user.service";
import { setAuthCookies } from "@/server/auth/session";
import { jsonError } from "@/server/http";
import { withRateLimit } from "@/server/middleware/with-rate-limit";
import { sendEmail } from "@/server/email/mailer";
import { welcomeEmailHtml } from "@/server/email/templates/welcome";
import type { TokenPayload } from "@/types/auth";

async function handler(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request", 400);
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request", 400, parsed.error.flatten());
  }

  const existing = await findUserByEmail(parsed.data.email);
  if (existing) {
    return jsonError("Email already registered", 409);
  }

  const user = await createUser(parsed.data, "student");

  const payload: TokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  const res = NextResponse.json(
    {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
    },
    { status: 201 },
  );

  setAuthCookies(res, payload);

  sendEmail({
    to: user.email,
    subject: "Welcome to Education Consultancy",
    html: welcomeEmailHtml(user.name),
  }).catch((err) => {
    console.error("Failed to send welcome email:", err);
  });

  return res;
}

export const POST = withRateLimit(
  "auth:register",
  { limit: 5, windowSec: 900 },
  handler,
);
