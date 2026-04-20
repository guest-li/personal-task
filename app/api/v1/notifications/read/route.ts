import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthContext } from "@/server/middleware/with-auth";
import { markReadSchema } from "@/server/validators/notification";
import { markAsRead, markAllAsRead } from "@/server/services/notification.service";
import { jsonError } from "@/server/http";

export const PATCH = withAuth(async (req: NextRequest, { user }: AuthContext) => {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request", 400);
  }

  const parsed = markReadSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request", 400, parsed.error.flatten());
  }

  if (parsed.data.all) {
    const markedCount = await markAllAsRead(user.sub);
    return NextResponse.json({ markedCount });
  }

  if (parsed.data.notificationId) {
    const notification = await markAsRead(parsed.data.notificationId, user.sub);
    return NextResponse.json({ notification });
  }

  return jsonError("Provide notificationId or set all: true", 400);
});
