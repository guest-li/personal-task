import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/server/middleware/with-role";
import {
  getBlogPostDetailAdmin,
  updateBlogPostAdmin,
  deleteBlogPostAdmin,
} from "@/server/services/admin.service";
import { updateBlogPostSchema } from "@/server/validators/admin";
import { jsonError } from "@/server/http";

export const GET = withRole(["admin"], async (_req, { params }) => {
  const blogPost = await getBlogPostDetailAdmin(params.id);
  if (!blogPost) return jsonError("Blog post not found", 404);
  return NextResponse.json({ blogPost });
});

export const PUT = withRole(["admin"], async (req, { params }) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = updateBlogPostSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  try {
    const blogPost = await updateBlogPostAdmin(params.id, parsed.data);
    return NextResponse.json({ blogPost });
  } catch (e: any) {
    if (e.code === "P2025") return jsonError("Blog post not found", 404);
    if (e.message === "Slug already exists") return jsonError("Slug already exists", 400);
    return jsonError("Failed to update blog post", 500);
  }
});

export const DELETE = withRole(["admin"], async (_req, { params }) => {
  try {
    await deleteBlogPostAdmin(params.id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.code === "P2025") return jsonError("Blog post not found", 404);
    return jsonError("Failed to delete blog post", 500);
  }
});
