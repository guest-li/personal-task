import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthContext } from "./with-auth";
import { jsonError } from "@/server/http";
import type { Role } from "@/types/auth";

type RoleHandler<P = Record<string, string>> = (
  req: NextRequest,
  ctx: AuthContext<P>,
) => Promise<NextResponse>;

export function withRole<P = Record<string, string>>(
  allowedRoles: Role[],
  handler: RoleHandler<P>,
) {
  return withAuth<P>(async (req, ctx) => {
    if (!allowedRoles.includes(ctx.user.role)) {
      return jsonError("Forbidden", 403);
    }
    return handler(req, ctx);
  });
}
