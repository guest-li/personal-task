import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/server/middleware/with-role";
import { listUniversitiesAdmin, createUniversityAdmin } from "@/server/services/admin.service";
import { listUniversitiesSchema, createUniversitySchema } from "@/server/validators/admin";
import { jsonError } from "@/server/http";

export const GET = withRole(["admin"], async (req) => {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const parsed = listUniversitiesSchema.safeParse(params);
  if (!parsed.success) return jsonError("Invalid params", 400, parsed.error.flatten());

  const result = await listUniversitiesAdmin(parsed.data.page, parsed.data.limit, {
    search: parsed.data.search,
    province: parsed.data.province,
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

  const parsed = createUniversitySchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  try {
    const university = await createUniversityAdmin(parsed.data);
    return NextResponse.json({ university }, { status: 201 });
  } catch (e: any) {
    if (e.message === "Slug already exists") return jsonError("Slug already exists", 400);
    return jsonError("Failed to create university", 500);
  }
});
