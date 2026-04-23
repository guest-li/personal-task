import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/server/middleware/with-role";
import { listPendingPartnersAdmin } from "@/server/services/admin.service";
import { jsonError } from "@/server/http";

export const GET = withRole(["admin"], async (req) => {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "10", 10);

  if (page < 1 || limit < 1 || limit > 100) {
    return jsonError("Invalid pagination parameters", 400);
  }

  const result = await listPendingPartnersAdmin(page, limit);
  return NextResponse.json(result);
});
