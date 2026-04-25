import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/v1/admin/universities/route";
import { GET as GET_UNIV_DETAIL, PUT as PUT_UNIV, DELETE as DELETE_UNIV } from "@/app/api/v1/admin/universities/[id]/route";
import { GET as GET_COURSES, POST as POST_COURSES } from "@/app/api/v1/admin/courses/route";
import { GET as GET_COURSE_DETAIL, PUT as PUT_COURSE, DELETE as DELETE_COURSE } from "@/app/api/v1/admin/courses/[id]/route";
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

describe("Admin Universities & Courses API", () => {
  let adminToken: string;
  let universityId: string;
  let courseId: string;

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

  describe("POST /api/v1/admin/universities", () => {
    it("should create a university", async () => {
      const req = makeAdminRequest(
        "POST",
        adminToken,
        "http://localhost/api/v1/admin/universities",
        {
          name: "Test University",
          slug: "test-university",
          logo: "https://example.com/logo.png",
          banner: "https://example.com/banner.png",
          worldRank: 50,
          location: "USA",
          studentCount: 5000,
          tags: ["top-tier", "research"],
          intake: "fall",
          province: "CA",
        },
      );

      const res = await POST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.university).toBeDefined();
      expect(data.university.name).toBe("Test University");
      expect(data.university.slug).toBe("test-university");
      universityId = data.university.id;
    });

    it("should reject duplicate slug", async () => {
      await testPrisma.university.create({
        data: {
          name: "Existing University",
          slug: "existing-slug",
        },
      });

      const req = makeAdminRequest(
        "POST",
        adminToken,
        "http://localhost/api/v1/admin/universities",
        {
          name: "Another University",
          slug: "existing-slug",
        },
      );

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Slug already exists");
    });
  });

  describe("GET /api/v1/admin/universities", () => {
    it("should list universities with pagination", async () => {
      await testPrisma.university.create({
        data: { name: "Uni 1", slug: "uni-1" },
      });
      await testPrisma.university.create({
        data: { name: "Uni 2", slug: "uni-2", province: "CA" },
      });

      const req = makeAdminRequest("GET", adminToken, "http://localhost/api/v1/admin/universities?page=1&limit=10");

      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.universities).toHaveLength(2);
      expect(data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });

    it("should filter universities by province", async () => {
      await testPrisma.university.create({
        data: { name: "Uni CA", slug: "uni-ca", province: "CA" },
      });
      await testPrisma.university.create({
        data: { name: "Uni TX", slug: "uni-tx", province: "TX" },
      });

      const req = makeAdminRequest("GET", adminToken, "http://localhost/api/v1/admin/universities?page=1&limit=10&province=CA");

      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.universities).toHaveLength(1);
      expect(data.universities[0].province).toBe("CA");
    });
  });

  describe("GET /api/v1/admin/universities/[id]", () => {
    it("should get university detail", async () => {
      const uni = await testPrisma.university.create({
        data: { name: "Detail University", slug: "detail-uni" },
      });

      const req = makeAdminRequest("GET", adminToken, `http://localhost/api/v1/admin/universities/${uni.id}`);

      const res = await GET_UNIV_DETAIL(req, { params: { id: uni.id } });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.university).toBeDefined();
      expect(data.university.id).toBe(uni.id);
    });

    it("should return 404 for non-existent university", async () => {
      const req = makeAdminRequest("GET", adminToken, "http://localhost/api/v1/admin/universities/fake-id");

      const res = await GET_UNIV_DETAIL(req, { params: { id: "fake-id" } });
      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/v1/admin/universities/[id]", () => {
    it("should update a university", async () => {
      const uni = await testPrisma.university.create({
        data: { name: "Original Name", slug: "original" },
      });

      const req = makeAdminRequest("PUT", adminToken, `http://localhost/api/v1/admin/universities/${uni.id}`, {
        name: "Updated Name",
      });

      const res = await PUT_UNIV(req, { params: { id: uni.id } });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.university.name).toBe("Updated Name");
    });
  });

  describe("DELETE /api/v1/admin/universities/[id]", () => {
    it("should delete a university", async () => {
      const uni = await testPrisma.university.create({
        data: { name: "To Delete", slug: "to-delete" },
      });

      const req = makeAdminRequest("DELETE", adminToken, `http://localhost/api/v1/admin/universities/${uni.id}`);

      const res = await DELETE_UNIV(req, { params: { id: uni.id } });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      const deleted = await testPrisma.university.findUnique({ where: { id: uni.id } });
      expect(deleted).toBeNull();
    });
  });

  describe("POST /api/v1/admin/courses", () => {
    it("should create a course", async () => {
      const uni = await testPrisma.university.create({
        data: { name: "Test University", slug: "test-uni" },
      });

      const req = makeAdminRequest(
        "POST",
        adminToken,
        "http://localhost/api/v1/admin/courses",
        {
          name: "Test Course",
          slug: "test-course",
          degree: "Bachelor",
          language: "English",
          major: "Computer Science",
          universityId: uni.id,
          intake: "fall",
          tuition: 50000,
          accommodation: 10000,
          serviceCharge: 5000,
          tags: ["popular"],
          province: "CA",
        },
      );

      const res = await POST_COURSES(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.course).toBeDefined();
      expect(data.course.name).toBe("Test Course");
      expect(data.course.universityId).toBe(uni.id);
      courseId = data.course.id;
    });
  });

  describe("GET /api/v1/admin/courses", () => {
    it("should list courses with pagination", async () => {
      const uni = await testPrisma.university.create({
        data: { name: "Test University", slug: "test-uni" },
      });
      await testPrisma.course.create({
        data: {
          name: "Course 1",
          slug: "course-1",
          degree: "Bachelor",
          language: "English",
          major: "CS",
          universityId: uni.id,
          intake: "fall",
          tuition: 50000,
          accommodation: 10000,
          serviceCharge: 5000,
        },
      });

      const req = makeAdminRequest("GET", adminToken, "http://localhost/api/v1/admin/courses?page=1&limit=10");

      const res = await GET_COURSES(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.courses).toBeDefined();
      expect(data.pagination).toBeDefined();
    });

    it("should filter courses by degree", async () => {
      const uni = await testPrisma.university.create({
        data: { name: "Test University", slug: "test-uni" },
      });
      await testPrisma.course.create({
        data: {
          name: "Bachelor Course",
          slug: "bachelor-course",
          degree: "Bachelor",
          language: "English",
          major: "CS",
          universityId: uni.id,
          intake: "fall",
          tuition: 50000,
          accommodation: 10000,
          serviceCharge: 5000,
        },
      });
      await testPrisma.course.create({
        data: {
          name: "Master Course",
          slug: "master-course",
          degree: "Master",
          language: "English",
          major: "CS",
          universityId: uni.id,
          intake: "spring",
          tuition: 70000,
          accommodation: 12000,
          serviceCharge: 7000,
        },
      });

      const req = makeAdminRequest("GET", adminToken, "http://localhost/api/v1/admin/courses?page=1&limit=10&degree=Bachelor");

      const res = await GET_COURSES(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.courses).toHaveLength(1);
      expect(data.courses[0].degree).toBe("Bachelor");
    });
  });

  describe("GET /api/v1/admin/courses/[id]", () => {
    it("should get course detail with university info", async () => {
      const uni = await testPrisma.university.create({
        data: { name: "Test University", slug: "test-uni" },
      });
      const course = await testPrisma.course.create({
        data: {
          name: "Detail Course",
          slug: "detail-course",
          degree: "Bachelor",
          language: "English",
          major: "CS",
          universityId: uni.id,
          intake: "fall",
          tuition: 50000,
          accommodation: 10000,
          serviceCharge: 5000,
        },
      });

      const req = makeAdminRequest("GET", adminToken, `http://localhost/api/v1/admin/courses/${course.id}`);

      const res = await GET_COURSE_DETAIL(req, { params: { id: course.id } });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.course).toBeDefined();
      expect(data.course.university).toBeDefined();
      expect(data.course.university.id).toBe(uni.id);
    });
  });

  describe("PUT /api/v1/admin/courses/[id]", () => {
    it("should update a course", async () => {
      const uni = await testPrisma.university.create({
        data: { name: "Test University", slug: "test-uni" },
      });
      const course = await testPrisma.course.create({
        data: {
          name: "Original Course",
          slug: "original-course",
          degree: "Bachelor",
          language: "English",
          major: "CS",
          universityId: uni.id,
          intake: "fall",
          tuition: 50000,
          accommodation: 10000,
          serviceCharge: 5000,
        },
      });

      const req = makeAdminRequest("PUT", adminToken, `http://localhost/api/v1/admin/courses/${course.id}`, {
        tuition: 60000,
      });

      const res = await PUT_COURSE(req, { params: { id: course.id } });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Number(data.course.tuition)).toBe(60000);
    });
  });

  describe("DELETE /api/v1/admin/courses/[id]", () => {
    it("should delete a course", async () => {
      const uni = await testPrisma.university.create({
        data: { name: "Test University", slug: "test-uni" },
      });
      const course = await testPrisma.course.create({
        data: {
          name: "To Delete",
          slug: "to-delete-course",
          degree: "Bachelor",
          language: "English",
          major: "CS",
          universityId: uni.id,
          intake: "fall",
          tuition: 50000,
          accommodation: 10000,
          serviceCharge: 5000,
        },
      });

      const req = makeAdminRequest("DELETE", adminToken, `http://localhost/api/v1/admin/courses/${course.id}`);

      const res = await DELETE_COURSE(req, { params: { id: course.id } });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      const deleted = await testPrisma.course.findUnique({ where: { id: course.id } });
      expect(deleted).toBeNull();
    });
  });
});
