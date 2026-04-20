import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthContext } from "@/server/middleware/with-auth";
import { uploadFile } from "@/server/services/upload.service";
import { updateProfile } from "@/server/services/profile.service";
import { jsonError } from "@/server/http";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const POST = withAuth(async (req: NextRequest, { user }: AuthContext) => {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return jsonError("Invalid form data", 400);
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return jsonError("No file provided", 400);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return jsonError("File must be JPEG, PNG, or WebP", 400);
  }

  if (file.size > MAX_SIZE) {
    return jsonError("File must be under 5MB", 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadFile(buffer, file.name, "avatars");

  await updateProfile(user.sub, { avatar: result.url });

  return NextResponse.json({ avatar: result.url });
});
