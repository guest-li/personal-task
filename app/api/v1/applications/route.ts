import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthContext } from "@/server/middleware/with-auth";
import { createApplicationSchema, listApplicationsSchema } from "@/server/validators/application";
import { createApplication, listApplications } from "@/server/services/application.service";
import { jsonError } from "@/server/http";

export const GET = withAuth(async (req: NextRequest, { user }: AuthContext) => {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const parsed = listApplicationsSchema.safeParse(params);
  if (!parsed.success) {
    return jsonError("Invalid query parameters", 400, parsed.error.flatten());
  }

  const result = await listApplications(user.sub, parsed.data);
  return NextResponse.json(result);
});

export const POST = withAuth(async (req: NextRequest, { user }: AuthContext) => {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request", 400);
  }

  const parsed = createApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request", 400, parsed.error.flatten());
  }

  const application = await createApplication({
    userId: user.sub,
    ...parsed.data,
  });

  return NextResponse.json({ application }, { status: 201 });
});
