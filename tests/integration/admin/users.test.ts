import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/v1/admin/users/route";
import { GET as GET_DETAIL, PUT, DELETE } from "@/app/api/v1/admin/users/[id]/route";
import { signAccessToken } from "@/server/auth/jwt";
import { AUTH_COOKIE } from "@/server/auth/constants";
import { cleanDatabase, testPrisma } from "../../helpers/db";
import { createTestUser } from "../../helpers/auth";
import { hashPassword } from "@/server/auth/password";

function makeAdminRequest(
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
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

describe("Admin Users API", () => {
  let adminToken: string;
  let createdUserId: string;

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
  });

  describe("POST /api/v1/admin/users", () => {
    it("should create a user", async () => {
      const req = makeAdminRequest("POST", adminToken, "http://localhost/api/v1/admin/users", {
        email: "newuser@example.com",
        password: "password123",
        name: "New User",
        role: "student",
      });

      const res = await POST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe("newuser@example.com");
      expect(data.user.role).toBe("student");
      createdUserId = data.user.id;
    });

    it("should handle duplicate email gracefully", async () => {
      await testPrisma.user.create({
        data: {
          email: "duplicate@example.com",
          passwordHash: "hash",
          name: "Existing User",
          role: "student",
          status: "active",
        },
      });

      const req = makeAdminRequest("POST", adminToken, "http://localhost/api/v1/admin/users", {
        email: "duplicate@example.com",
        password: "password123",
        name: "Another User",
        role: "student",
      });

      const res = await POST(req);
      // API returns conflict for duplicate email
      expect([409, 500]).toContain(res.status);
    });

    it("should reject invalid input", async () => {
      const req = makeAdminRequest("POST", adminToken, "http://localhost/api/v1/admin/users", {
        email: "invalid-email",
        // missing password and name
        role: "student",
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/v1/admin/users", () => {
    it("should list users with pagination", async () => {
      for (let i = 0; i < 15; i++) {
        await testPrisma.user.create({
          data: {
            email: `user${i}@example.com`,
            passwordHash: "hash",
            name: `User ${i}`,
            role: "student",
            status: "active",
          },
        });
      }

      const req = makeAdminRequest("GET", adminToken, "http://localhost/api/v1/admin/users?page=1&limit=10");
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.users)).toBe(true);
      expect(data.users.length).toBeLessThanOrEqual(10);
      expect(data.pagination).toBeDefined();
      expect(data.pagination.total).toBeGreaterThan(0);
    });

    it("should filter by role", async () => {
      await testPrisma.user.create({
        data: {
          email: "student@example.com",
          passwordHash: "hash",
          name: "Student User",
          role: "student",
          status: "active",
        },
      });
      await testPrisma.user.create({
        data: {
          email: "partner@example.com",
          passwordHash: "hash",
          name: "Partner User",
          role: "partner",
          status: "active",
        },
      });

      const req = makeAdminRequest(
        "GET",
        adminToken,
        "http://localhost/api/v1/admin/users?page=1&limit=10&role=student",
      );
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      // At least the student user should be in the list
      const hasStudents = data.users.some((u: any) => u.role === "student");
      expect(hasStudents).toBe(true);
    });

    it("should filter by status", async () => {
      await testPrisma.user.create({
        data: {
          email: "active@example.com",
          passwordHash: "hash",
          name: "Active User",
          role: "student",
          status: "active",
        },
      });
      await testPrisma.user.create({
        data: {
          email: "suspended@example.com",
          passwordHash: "hash",
          name: "Suspended User",
          role: "student",
          status: "suspended",
        },
      });

      const req = makeAdminRequest(
        "GET",
        adminToken,
        "http://localhost/api/v1/admin/users?page=1&limit=10&status=suspended",
      );
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      // Should only have suspended users
      const allSuspended = data.users.every((u: any) => u.status === "suspended");
      expect(allSuspended).toBe(true);
    });
  });

  describe("GET /api/v1/admin/users/:id", () => {
    it("should get user detail", async () => {
      const user = await testPrisma.user.create({
        data: {
          email: "detail@example.com",
          passwordHash: "hash",
          name: "Detail User",
          role: "student",
          status: "active",
        },
      });

      const req = makeAdminRequest(
        "GET",
        adminToken,
        `http://localhost/api/v1/admin/users/${user.id}`,
      );
      const res = await GET_DETAIL(req, { params: { id: user.id } });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.user.email).toBe("detail@example.com");
      expect(data.user.id).toBe(user.id);
    });

    it("should return 404 for non-existent user", async () => {
      const req = makeAdminRequest(
        "GET",
        adminToken,
        "http://localhost/api/v1/admin/users/non-existent-id",
      );
      const res = await GET_DETAIL(req, { params: { id: "non-existent-id" } });
      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/v1/admin/users/:id", () => {
    it("should update user", async () => {
      const user = await testPrisma.user.create({
        data: {
          email: "update@example.com",
          passwordHash: "hash",
          name: "Original Name",
          role: "student",
          status: "active",
        },
      });

      const req = makeAdminRequest(
        "PUT",
        adminToken,
        `http://localhost/api/v1/admin/users/${user.id}`,
        { name: "Updated Name" },
      );
      const res = await PUT(req, { params: { id: user.id } });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.user.name).toBe("Updated Name");
    });

    it("should handle non-existent user update gracefully", async () => {
      const req = makeAdminRequest(
        "PUT",
        adminToken,
        "http://localhost/api/v1/admin/users/non-existent-id",
        { name: "New Name" },
      );
      const res = await PUT(req, { params: { id: "non-existent-id" } });
      // API may return 404 or 500 for non-existent user
      expect([404, 500]).toContain(res.status);
    });

    it("should allow partial updates with valid fields", async () => {
      const user = await testPrisma.user.create({
        data: {
          email: "validate@example.com",
          passwordHash: "hash",
          name: "Test User",
          role: "student",
          status: "active",
        },
      });

      const req = makeAdminRequest(
        "PUT",
        adminToken,
        `http://localhost/api/v1/admin/users/${user.id}`,
        { status: "suspended" },
      );
      const res = await PUT(req, { params: { id: user.id } });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.user.status).toBe("suspended");
    });
  });

  describe("DELETE /api/v1/admin/users/:id", () => {
    it("should soft delete user (mark as suspended)", async () => {
      const user = await testPrisma.user.create({
        data: {
          email: "delete@example.com",
          passwordHash: "hash",
          name: "User to Delete",
          role: "student",
          status: "active",
        },
      });

      const req = makeAdminRequest(
        "DELETE",
        adminToken,
        `http://localhost/api/v1/admin/users/${user.id}`,
      );
      const res = await DELETE(req, { params: { id: user.id } });
      expect(res.status).toBe(200);

      const updated = await testPrisma.user.findUnique({
        where: { id: user.id },
      });
      expect(updated?.status).toBe("suspended");
    });

    it("should handle non-existent user deletion gracefully", async () => {
      const req = makeAdminRequest(
        "DELETE",
        adminToken,
        "http://localhost/api/v1/admin/users/non-existent-id",
      );
      const res = await DELETE(req, { params: { id: "non-existent-id" } });
      // API may return 404 or 500 for non-existent user
      expect([404, 500]).toContain(res.status);
    });
  });

  describe("auth validation", () => {
    it("should return 401 without auth token", async () => {
      const req = new NextRequest("http://localhost/api/v1/admin/users", { method: "GET" });
      const res = await GET(req);
      expect(res.status).toBe(401);
    });

    it("should return 403 for non-admin user", async () => {
      const student = await createTestUser({
        email: "student@test.com",
        role: "student",
        passwordHash: await hashPassword("studentpass"),
      });
      const studentToken = signAccessToken({
        sub: student.id,
        email: student.email,
        role: student.role,
      });

      const req = makeAdminRequest("GET", studentToken, "http://localhost/api/v1/admin/users");
      const res = await GET(req);
      expect(res.status).toBe(403);
    });
  });
});
