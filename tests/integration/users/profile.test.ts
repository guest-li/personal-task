import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { PUT as putProfile } from "@/app/api/v1/users/profile/route";
import { PUT as putPassword } from "@/app/api/v1/users/password/route";
import { DELETE as deleteCert } from "@/app/api/v1/users/certificates/[id]/route";
import { signAccessToken } from "@/server/auth/jwt";
import { AUTH_COOKIE } from "@/server/auth/constants";
import { cleanDatabase, testPrisma } from "../../helpers/db";
import { createTestUser } from "../../helpers/auth";
import { hashPassword, comparePassword } from "@/server/auth/password";

describe("Profile APIs", () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    await cleanDatabase();
    const hash = await hashPassword("oldpass123");
    const user = await createTestUser({
      email: "prof@test.com",
      passwordHash: hash,
    });
    userId = user.id;
    token = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  });

  describe("PUT /api/v1/users/profile", () => {
    it("updates profile fields", async () => {
      const req = new NextRequest("http://localhost/api/v1/users/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: "New Name",
          phone: "+1234567890",
          gender: "male",
          bio: "My bio",
          qualification: "bachelor",
        }),
        headers: { "Content-Type": "application/json" },
      });
      req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);

      const res = await putProfile(req, { params: {} });
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.user.name).toBe("New Name");

      const sp = await testPrisma.studentProfile.findUnique({
        where: { userId },
      });
      expect(sp!.bio).toBe("My bio");
    });

    it("returns 401 without auth", async () => {
      const req = new NextRequest("http://localhost/api/v1/users/profile", {
        method: "PUT",
        body: JSON.stringify({ name: "X" }),
        headers: { "Content-Type": "application/json" },
      });
      const res = await putProfile(req, { params: {} });
      expect(res.status).toBe(401);
    });
  });

  describe("PUT /api/v1/users/password", () => {
    it("changes password with correct current password", async () => {
      const req = new NextRequest("http://localhost/api/v1/users/password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: "oldpass123",
          newPassword: "newpass456",
          confirmPassword: "newpass456",
        }),
        headers: { "Content-Type": "application/json" },
      });
      req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);

      const res = await putPassword(req, { params: {} });
      expect(res.status).toBe(200);

      const user = await testPrisma.user.findUnique({ where: { id: userId } });
      const valid = await comparePassword("newpass456", user!.passwordHash!);
      expect(valid).toBe(true);
    });

    it("rejects with wrong current password", async () => {
      const req = new NextRequest("http://localhost/api/v1/users/password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: "wrongpass",
          newPassword: "newpass456",
          confirmPassword: "newpass456",
        }),
        headers: { "Content-Type": "application/json" },
      });
      req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);

      const res = await putPassword(req, { params: {} });
      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/v1/users/certificates/:id", () => {
    it("deletes own certificate", async () => {
      const cert = await testPrisma.certificate.create({
        data: {
          userId,
          name: "Test Cert",
          fileUrl: "/uploads/certificates/test.pdf",
        },
      });

      const req = new NextRequest(`http://localhost/api/v1/users/certificates/${cert.id}`, {
        method: "DELETE",
      });
      req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);

      const res = await deleteCert(req, { params: { id: cert.id } });
      expect(res.status).toBe(200);

      const deleted = await testPrisma.certificate.findUnique({ where: { id: cert.id } });
      expect(deleted).toBeNull();
    });
  });
});
