import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/server/middleware/with-role";
import { listApplicationsAdmin } from "@/server/services/admin.service";
import { listApplicationsSchema } from "@/server/validators/admin";
import { jsonError } from "@/server/http";

export const GET = withRole(["admin"], async (req) => {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const parsed = listApplicationsSchema.safeParse(params);
  if (!parsed.success) return jsonError("Invalid params", 400, parsed.error.flatten());

  const result = await listApplicationsAdmin(parsed.data.page, parsed.data.limit, {
    status: parsed.data.status,
    search: parsed.data.search,
  });

  return NextResponse.json(result);
});
