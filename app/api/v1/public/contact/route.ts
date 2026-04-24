import { NextRequest, NextResponse } from "next/server";
import { contactFormSchema } from "@/server/validators/public";
import { jsonError } from "@/server/http";

export const POST = async (req: NextRequest) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid input", 400, parsed.error.flatten());
  }

  try {
    // TODO: Send email notification to admin
    return NextResponse.json({ success: true, message: "Contact form submitted" }, { status: 201 });
  } catch (e) {
    return jsonError("Failed to submit contact form", 500);
  }
};
