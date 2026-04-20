import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthContext } from "@/server/middleware/with-auth";
import { listNotificationsSchema } from "@/server/validators/notification";
import { listNotifications, getUnreadCount } from "@/server/services/notification.service";
import { jsonError } from "@/server/http";

export const GET = withAuth(async (req: NextRequest, { user }: AuthContext) => {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const parsed = listNotificationsSchema.safeParse(params);
  if (!parsed.success) {
    return jsonError("Invalid query parameters", 400, parsed.error.flatten());
  }

  const result = await listNotifications(user.sub, parsed.data);
  const unreadCount = await getUnreadCount(user.sub);

  return NextResponse.json({ ...result, unreadCount });
});
