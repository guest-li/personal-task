import fs from "fs";
import path from "path";

export interface UploadResult {
  url: string;
  key: string;
}

function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.\-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  folder: string,
): Promise<UploadResult> {
  const sanitized = sanitizeFilename(filename);
  const timestamp = Date.now();
  const finalName = `${timestamp}-${sanitized}`;
  const relativePath = `/uploads/${folder}/${finalName}`;
  const fullDir = path.join(process.cwd(), "public", "uploads", folder);
  const fullPath = path.join(fullDir, finalName);

  fs.mkdirSync(fullDir, { recursive: true });
  fs.writeFileSync(fullPath, buffer);

  return {
    url: relativePath,
    key: relativePath,
  };
}

export async function deleteFile(key: string): Promise<void> {
  const fullPath = path.join(process.cwd(), "public", key);
  try {
    fs.unlinkSync(fullPath);
  } catch {
    // File already deleted or doesn't exist
  }
}
