import { NextRequest, NextResponse } from "next/server";
import { newsletterSchema } from "@/server/validators/public";
import { jsonError } from "@/server/http";

export const POST = async (req: NextRequest) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid input", 400, parsed.error.flatten());
  }

  try {
    // TODO: Add to newsletter list (store in database or external service)
    return NextResponse.json({ success: true, message: "Subscribed to newsletter" }, { status: 201 });
  } catch (e) {
    return jsonError("Failed to subscribe", 500);
  }
};
