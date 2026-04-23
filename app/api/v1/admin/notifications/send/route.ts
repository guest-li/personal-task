import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/server/middleware/with-role";
import { sendNotificationAdmin } from "@/server/services/admin.service";
import { sendNotificationSchema } from "@/server/validators/admin";
import { jsonError } from "@/server/http";

export const POST = withRole(["admin"], async (req) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = sendNotificationSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  try {
    const result = await sendNotificationAdmin(
      parsed.data.title,
      parsed.data.message,
      parsed.data.targetRole,
      parsed.data.targetUserIds,
    );
    return NextResponse.json(result, { status: 201 });
  } catch (e: any) {
    return jsonError("Failed to send notifications", 500);
  }
});
