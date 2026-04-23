import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/server/middleware/with-role";
import { listUsersAdmin, createUserAdmin } from "@/server/services/admin.service";
import { listUsersSchema, createUserSchema } from "@/server/validators/admin";
import { jsonError } from "@/server/http";

export const GET = withRole(["admin"], async (req) => {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const parsed = listUsersSchema.safeParse(params);
  if (!parsed.success) return jsonError("Invalid params", 400, parsed.error.flatten());

  const result = await listUsersAdmin(parsed.data.page, parsed.data.limit, {
    role: parsed.data.role,
    status: parsed.data.status,
    search: parsed.data.search,
  });

  return NextResponse.json(result);
});

export const POST = withRole(["admin"], async (req) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  try {
    const user = await createUserAdmin(parsed.data.email, parsed.data.password, parsed.data.name, parsed.data.role);
    return NextResponse.json({ user }, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") return jsonError("Email already exists", 409);
    return jsonError("Failed to create user", 500);
  }
});
