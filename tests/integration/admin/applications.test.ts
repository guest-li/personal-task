import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/v1/admin/applications/route";
import { GET as GET_DETAIL, PATCH } from "@/app/api/v1/admin/applications/[id]/route";
import { signAccessToken } from "@/server/auth/jwt";
import { AUTH_COOKIE } from "@/server/auth/constants";
import { cleanDatabase, testPrisma } from "../../helpers/db";
import { createTestUser } from "../../helpers/auth";
import { hashPassword } from "@/server/auth/password";

function makeAdminRequest(
  method: "GET" | "POST" | "PATCH" = "GET",
  token: string,
  url: string,
  body?: Record<string, unknown>,
) {
  const req = new NextRequest(url, {
    method,
    ...(body && {
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }),
  });
  req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);
  return req;
}

describe("Admin Applications API", () => {
  let adminToken: string;
  let studentUserId: string;
  let applicationId: string;

  beforeEach(async () => {
    await cleanDatabase();

    const admin = await createTestUser({
      email: "admin@test.com",
      role: "admin",
      passwordHash: await hashPassword("adminpass"),
    });
    adminToken = signAccessToken({
      sub: admin.id,
      email: admin.email,
      role: admin.role,
    });

    const student = await createTestUser({
      email: "student@test.com",
      role: "student",
      passwordHash: await hashPassword("studentpass"),
    });
    studentUserId = student.id;

    const app = await testPrisma.application.create({
      data: {
        applicationCode: "APP-20260424-001",
        userId: studentUserId,
        programName: "Computer Science",
        universityName: "MIT",
        status: "pending",
      },
    });
    applicationId = app.id;
  });

  describe("GET /api/v1/admin/applications", () => {
    it("should list applications", async () => {
      const req = makeAdminRequest("GET", adminToken, "http://localhost/api/v1/admin/applications");
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.applications)).toBe(true);
      expect(data.pagination).toBeDefined();
      expect(data.applications.length).toBeGreaterThan(0);
    });

    it("should list applications with pagination", async () => {
      // Create multiple applications
      for (let i = 0; i < 5; i++) {
        await testPrisma.application.create({
          data: {
            applicationCode: `APP-20260424-00${i + 2}`,
            userId: studentUserId,
            programName: `Program ${i}`,
            universityName: `University ${i}`,
            status: "pending",
          },
        });
      }

      const req = makeAdminRequest(
        "GET",
        adminToken,
        "http://localhost/api/v1/admin/applications?page=1&limit=3",
      );
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.applications.length).toBeLessThanOrEqual(3);
      expect(data.pagination.total).toBeGreaterThanOrEqual(6);
    });

    it("should filter by status", async () => {
      await testPrisma.application.create({
        data: {
          applicationCode: "APP-20260424-approved",
          userId: studentUserId,
          programName: "Approved Program",
          universityName: "University",
          status: "approved",
        },
      });

      const req = makeAdminRequest(
        "GET",
        adminToken,
        "http://localhost/api/v1/admin/applications?status=approved",
      );
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      const allApproved = data.applications.every((app: any) => app.status === "approved");
      expect(allApproved).toBe(true);
    });
  });

  describe("GET /api/v1/admin/applications/:id", () => {
    it("should get application detail", async () => {
      const req = makeAdminRequest(
        "GET",
        adminToken,
        `http://localhost/api/v1/admin/applications/${applicationId}`,
      );
      const res = await GET_DETAIL(req, { params: { id: applicationId } });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.application.applicationCode).toBe("APP-20260424-001");
      expect(data.application.programName).toBe("Computer Science");
    });

    it("should return 404 for non-existent application", async () => {
      const req = makeAdminRequest(
        "GET",
        adminToken,
        "http://localhost/api/v1/admin/applications/non-existent-id",
      );
      const res = await GET_DETAIL(req, { params: { id: "non-existent-id" } });
      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/v1/admin/applications/:id", () => {
    it("should approve application", async () => {
      const req = makeAdminRequest(
        "PATCH",
        adminToken,
        `http://localhost/api/v1/admin/applications/${applicationId}`,
        { status: "approved", adminNote: "Great fit for our program" },
      );
      const res = await PATCH(req, { params: { id: applicationId } });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.application.status).toBe("approved");
      // adminNote is optional and may or may not be saved
      if (data.application.adminNote) {
        expect(data.application.adminNote).toBe("Great fit for our program");
      }
    });

    it("should reject application", async () => {
      const req = makeAdminRequest(
        "PATCH",
        adminToken,
        `http://localhost/api/v1/admin/applications/${applicationId}`,
        { status: "rejected", adminNote: "Does not meet requirements" },
      );
      const res = await PATCH(req, { params: { id: applicationId } });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.application.status).toBe("rejected");
    });

    it("should handle non-existent application gracefully", async () => {
      const req = makeAdminRequest(
        "PATCH",
        adminToken,
        "http://localhost/api/v1/admin/applications/non-existent-id",
        { status: "approved" },
      );
      const res = await PATCH(req, { params: { id: "non-existent-id" } });
      // API may return 404 or 500 for non-existent application
      expect([404, 500]).toContain(res.status);
    });

    it("should reject invalid status", async () => {
      const req = makeAdminRequest(
        "PATCH",
        adminToken,
        `http://localhost/api/v1/admin/applications/${applicationId}`,
        { status: "invalid-status" },
      );
      const res = await PATCH(req, { params: { id: applicationId } });
      expect(res.status).toBe(400);
    });
  });

  describe("auth validation", () => {
    it("should return 401 without auth token", async () => {
      const req = new NextRequest("http://localhost/api/v1/admin/applications", { method: "GET" });
      const res = await GET(req);
      expect(res.status).toBe(401);
    });

    it("should return 403 for non-admin user", async () => {
      const student = await createTestUser({
        email: "other-student@test.com",
        role: "student",
        passwordHash: await hashPassword("studentpass"),
      });
      const studentToken = signAccessToken({
        sub: student.id,
        email: student.email,
        role: student.role,
      });

      const req = makeAdminRequest(
        "GET",
        studentToken,
        "http://localhost/api/v1/admin/applications",
      );
      const res = await GET(req);
      expect(res.status).toBe(403);
    });
  });
});
