import { NextRequest, NextResponse } from "next/server";
import { partnerRegisterSchema } from "@/server/validators/auth";
import { createUser, findUserByEmail } from "@/server/services/user.service";
import { jsonError } from "@/server/http";
import { withRateLimit } from "@/server/middleware/with-rate-limit";
import { sendEmail } from "@/server/email/mailer";
import { welcomeEmailHtml } from "@/server/email/templates/welcome";

async function handler(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request", 400);
  }

  const parsed = partnerRegisterSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request", 400, parsed.error.flatten());
  }

  const existing = await findUserByEmail(parsed.data.email);
  if (existing) {
    return jsonError("Email already registered", 409);
  }

  const user = await createUser(parsed.data, "partner");

  // No auth cookies — account is inactive until admin activates

  sendEmail({
    to: user.email,
    subject: "Partner Registration Received",
    html: welcomeEmailHtml(user.name),
  }).catch((err) => {
    console.error("Failed to send welcome email:", err);
  });

  return NextResponse.json(
    {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
      message: "Registration successful. Your account is inactive — please contact the administrator to activate your account.",
    },
    { status: 201 },
  );
}

export const POST = withRateLimit(
  "auth:partner-register",
  { limit: 5, windowSec: 900 },
  handler,
);
