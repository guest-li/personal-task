import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { jsonError } from "@/server/http";
import type { TokenPayload } from "@/types/auth";

export type AuthContext<P = Record<string, string>> = {
  params: P;
  user: TokenPayload;
};

type AuthHandler<P = Record<string, string>> = (
  req: NextRequest,
  ctx: AuthContext<P>,
) => Promise<NextResponse>;

export function withAuth<P = Record<string, string>>(
  handler: AuthHandler<P>,
) {
  return async (
    req: NextRequest,
    ctx: { params: P },
  ): Promise<NextResponse> => {
    const user = getCurrentUser(req);
    if (!user) {
      return jsonError("Unauthorized", 401);
    }
    return handler(req, { ...ctx, user });
  };
}
