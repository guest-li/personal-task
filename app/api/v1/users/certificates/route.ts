import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthContext } from "@/server/middleware/with-auth";
import { uploadFile } from "@/server/services/upload.service";
import { prisma } from "@/server/db";
import { jsonError } from "@/server/http";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export const POST = withAuth(async (req: NextRequest, { user }: AuthContext) => {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return jsonError("Invalid form data", 400);
  }

  const name = formData.get("name") as string | null;
  const file = formData.get("file") as File | null;

  if (!name || !file) {
    return jsonError("Name and file are required", 400);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return jsonError("File must be JPEG, PNG, WebP, or PDF", 400);
  }

  if (file.size > MAX_SIZE) {
    return jsonError("File must be under 10MB", 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadFile(buffer, file.name, "certificates");

  const certificate = await prisma.certificate.create({
    data: {
      userId: user.sub,
      name,
      fileUrl: result.url,
    },
  });

  return NextResponse.json({ certificate }, { status: 201 });
});
