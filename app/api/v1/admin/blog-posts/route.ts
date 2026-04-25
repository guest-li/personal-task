import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/server/middleware/with-role";
import { listBlogPostsAdmin, createBlogPostAdmin } from "@/server/services/admin.service";
import { listBlogPostsAdminSchema, createBlogPostSchema } from "@/server/validators/admin";
import { jsonError } from "@/server/http";

export const GET = withRole(["admin"], async (req) => {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const parsed = listBlogPostsAdminSchema.safeParse(params);
  if (!parsed.success) return jsonError("Invalid params", 400, parsed.error.flatten());

  // Convert published string to boolean for service layer
  const published = parsed.data.published === "true" ? true : parsed.data.published === "false" ? false : undefined;

  const result = await listBlogPostsAdmin(parsed.data.page, parsed.data.limit, {
    search: parsed.data.search,
    published,
    category: parsed.data.category,
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

  const parsed = createBlogPostSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  try {
    const blogPost = await createBlogPostAdmin(parsed.data);
    return NextResponse.json({ blogPost }, { status: 201 });
  } catch (e: any) {
    if (e.message === "Slug already exists") return jsonError("Slug already exists", 400);
    return jsonError("Failed to create blog post", 500);
  }
});
