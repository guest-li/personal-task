import { describe, it, expect, afterEach } from "vitest";
import { uploadFile, deleteFile } from "@/server/services/upload.service";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

describe("upload.service", () => {
  const createdFiles: string[] = [];

  afterEach(() => {
    for (const f of createdFiles) {
      try { fs.unlinkSync(f); } catch {}
    }
    createdFiles.length = 0;
  });

  it("uploads a file and returns url + key", async () => {
    const buffer = Buffer.from("fake image data");
    const result = await uploadFile(buffer, "test-photo.png", "avatars");

    expect(result.url).toMatch(/^\/uploads\/avatars\//);
    expect(result.url).toContain("test-photo.png");
    expect(result.key).toBeDefined();

    const fullPath = path.join(process.cwd(), "public", result.url);
    expect(fs.existsSync(fullPath)).toBe(true);
    createdFiles.push(fullPath);
  });

  it("sanitizes filenames", async () => {
    const buffer = Buffer.from("data");
    const result = await uploadFile(buffer, "My File (1).PNG", "certificates");

    expect(result.url).toMatch(/my-file-1-\.png/);
    createdFiles.push(path.join(process.cwd(), "public", result.url));
  });

  it("deletes a file by key", async () => {
    const buffer = Buffer.from("delete me");
    const result = await uploadFile(buffer, "todelete.png", "avatars");
    const fullPath = path.join(process.cwd(), "public", result.url);
    createdFiles.push(fullPath);

    expect(fs.existsSync(fullPath)).toBe(true);
    await deleteFile(result.key);
    expect(fs.existsSync(fullPath)).toBe(false);
  });
});
