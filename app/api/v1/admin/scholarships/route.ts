import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/server/middleware/with-role";
import { listScholarshipsAdmin, createScholarshipAdmin } from "@/server/services/admin.service";
import { listScholarshipsAdminSchema, createScholarshipSchema } from "@/server/validators/admin";
import { jsonError } from "@/server/http";

export const GET = withRole(["admin"], async (req) => {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const parsed = listScholarshipsAdminSchema.safeParse(params);
  if (!parsed.success) return jsonError("Invalid params", 400, parsed.error.flatten());

  const result = await listScholarshipsAdmin(parsed.data.page, parsed.data.limit, {
    search: parsed.data.search,
    type: parsed.data.type,
    degree: parsed.data.degree,
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

  const parsed = createScholarshipSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  try {
    const scholarship = await createScholarshipAdmin(parsed.data);
    return NextResponse.json({ scholarship }, { status: 201 });
  } catch (e: any) {
    if (e.message === "Slug already exists") return jsonError("Slug already exists", 400);
    return jsonError("Failed to create scholarship", 500);
  }
});
