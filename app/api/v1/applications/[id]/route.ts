import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthContext } from "@/server/middleware/with-auth";
import { cancelApplication } from "@/server/services/application.service";
import { jsonError } from "@/server/http";

export const PATCH = withAuth<{ id: string }>(
  async (_req: NextRequest, { user, params }: AuthContext<{ id: string }>) => {
    try {
      const application = await cancelApplication(params.id, user.sub);
      return NextResponse.json({ application });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to cancel";
      return jsonError(message, 400);
    }
  },
);
