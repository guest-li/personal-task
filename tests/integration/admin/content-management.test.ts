import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as GET_UNI, POST as POST_UNI } from "@/app/api/v1/admin/universities/route";
import { GET as GET_UNI_DETAIL, PUT as PUT_UNI, DELETE as DELETE_UNI } from "@/app/api/v1/admin/universities/[id]/route";
import { GET as GET_COURSE, POST as POST_COURSE } from "@/app/api/v1/admin/courses/route";
import { GET as GET_COURSE_DETAIL, PUT as PUT_COURSE, DELETE as DELETE_COURSE } from "@/app/api/v1/admin/courses/[id]/route";
import { GET as GET_SCHOLARSHIP, POST as POST_SCHOLARSHIP } from "@/app/api/v1/admin/scholarships/route";
import { GET as GET_SCHOLARSHIP_DETAIL, PUT as PUT_SCHOLARSHIP, DELETE as DELETE_SCHOLARSHIP } from "@/app/api/v1/admin/scholarships/[id]/route";
import { GET as GET_BLOG, POST as POST_BLOG } from "@/app/api/v1/admin/blog-posts/route";
import { GET as GET_BLOG_DETAIL, PUT as PUT_BLOG, DELETE as DELETE_BLOG } from "@/app/api/v1/admin/blog-posts/[id]/route";
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

describe("Admin Content Management API", () => {
  let adminToken: string;
  let nonAdminToken: string;
  let universityId: string;
  let scholarshipId: string;
  let blogPostId: string;

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
    nonAdminToken = signAccessToken({
      sub: student.id,
      email: student.email,
      role: student.role,
    });

    // Create a university for course/scholarship tests
    const uni = await testPrisma.university.create({
      data: { name: "Test University", slug: "test-uni" },
    });
    universityId = uni.id;
  });

  describe("Universities", () => {
    describe("POST /api/v1/admin/universities", () => {
      it("should return 401 for unauthenticated requests", async () => {
        const req = new NextRequest("http://localhost/api/v1/admin/universities", {
          method: "POST",
          body: JSON.stringify({
            name: "Test University",
            slug: "test-university",
            location: "Test Location",
          }),
          headers: { "Content-Type": "application/json" },
        });

        const res = await POST_UNI(req);
        expect(res.status).toBe(401);
      });

      it("should return 403 for non-admin users", async () => {
        const req = makeAdminRequest(
          "POST",
          nonAdminToken,
          "http://localhost/api/v1/admin/universities",
          {
            name: "Test University",
            slug: "test-university",
            location: "Test Location",
          },
        );

        const res = await POST_UNI(req);
        expect(res.status).toBe(403);
      });

      it("should create a university for admin users", async () => {
        const req = makeAdminRequest(
          "POST",
          adminToken,
          "http://localhost/api/v1/admin/universities",
          {
            name: "Stanford University",
            slug: "stanford-university",
            location: "Stanford, CA",
            worldRank: 3,
            studentCount: 17000,
            tags: ["engineering", "research"],
            province: "CA",
          },
        );

        const res = await POST_UNI(req);
        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.university).toBeDefined();
        expect(data.university.name).toBe("Stanford University");
        expect(data.university.slug).toBe("stanford-university");
        expect(data.university.worldRank).toBe(3);
        expect(data.university.studentCount).toBe(17000);
      });

      it("should return 400 for duplicate slug", async () => {
        await testPrisma.university.create({
          data: {
            name: "Existing University",
            slug: "existing-slug",
            location: "Somewhere",
          },
        });

        const req = makeAdminRequest(
          "POST",
          adminToken,
          "http://localhost/api/v1/admin/universities",
          {
            name: "Another University",
            slug: "existing-slug",
            location: "Somewhere Else",
          },
        );

        const res = await POST_UNI(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Slug already exists");
      });
    });

    describe("GET /api/v1/admin/universities", () => {
      it("should list universities with pagination", async () => {
        await testPrisma.university.create({
          data: { name: "University 1", slug: "university-1", location: "Location 1" },
        });
        await testPrisma.university.create({
          data: { name: "University 2", slug: "university-2", location: "Location 2" },
        });

        const req = makeAdminRequest("GET", adminToken, "http://localhost/api/v1/admin/universities?page=1&limit=10");

        const res = await GET_UNI(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.universities).toBeDefined();
        expect(Array.isArray(data.universities)).toBe(true);
        expect(data.pagination).toBeDefined();
      });

      it("should filter universities by province", async () => {
        await testPrisma.university.create({
          data: { name: "Ontario Uni", slug: "ontario-uni", location: "Toronto", province: "Ontario" },
        });
        await testPrisma.university.create({
          data: { name: "BC Uni", slug: "bc-uni", location: "Vancouver", province: "BC" },
        });

        const req = makeAdminRequest("GET", adminToken, "http://localhost/api/v1/admin/universities?page=1&limit=10&province=Ontario");

        const res = await GET_UNI(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        const allOntario = data.universities.every((u: any) => u.province === "Ontario");
        expect(allOntario).toBe(true);
      });

      it("should search universities by name", async () => {
        await testPrisma.university.create({
          data: { name: "Harvard University", slug: "harvard", location: "Cambridge" },
        });
        await testPrisma.university.create({
          data: { name: "Yale University", slug: "yale", location: "New Haven" },
        });

        const req = makeAdminRequest("GET", adminToken, "http://localhost/api/v1/admin/universities?page=1&limit=10&search=Harvard");

        const res = await GET_UNI(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.universities.length).toBeGreaterThan(0);
      });
    });

    describe("GET /api/v1/admin/universities/:id", () => {
      it("should get university detail", async () => {
        const uni = await testPrisma.university.create({
          data: { name: "MIT", slug: "mit", location: "Cambridge, MA", worldRank: 1 },
        });

        const req = makeAdminRequest("GET", adminToken, `http://localhost/api/v1/admin/universities/${uni.id}`);

        const res = await GET_UNI_DETAIL(req, { params: { id: uni.id } });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.university).toBeDefined();
        expect(data.university.id).toBe(uni.id);
        expect(data.university.name).toBe("MIT");
      });

      it("should return 404 for non-existent university", async () => {
        const req = makeAdminRequest("GET", adminToken, "http://localhost/api/v1/admin/universities/fake-id");

        const res = await GET_UNI_DETAIL(req, { params: { id: "fake-id" } });
        expect(res.status).toBe(404);
      });
    });

    describe("PUT /api/v1/admin/universities/:id", () => {
      it("should update a university", async () => {
        const uni = await testPrisma.university.create({
          data: { name: "Original Name", slug: "original-name", location: "Original Location" },
        });

        const req = makeAdminRequest("PUT", adminToken, `http://localhost/api/v1/admin/universities/${uni.id}`, {
          name: "Updated Name",
          location: "Updated Location",
          worldRank: 10,
        });

        const res = await PUT_UNI(req, { params: { id: uni.id } });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.university.name).toBe("Updated Name");
        expect(data.university.location).toBe("Updated Location");
        expect(data.university.worldRank).toBe(10);
      });

      it("should reject duplicate slug on update", async () => {
        const uni1 = await testPrisma.university.create({
          data: { name: "University 1", slug: "university-1", location: "Location 1" },
        });
        await testPrisma.university.create({
          data: { name: "University 2", slug: "university-2", location: "Location 2" },
        });

        const req = makeAdminRequest("PUT", adminToken, `http://localhost/api/v1/admin/universities/${uni1.id}`, {
          slug: "university-2",
        });

        const res = await PUT_UNI(req, { params: { id: uni1.id } });
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Slug already exists");
      });

      it("should return 404 for non-existent university", async () => {
        const req = makeAdminRequest("PUT", adminToken, "http://localhost/api/v1/admin/universities/fake-id", {
          name: "Updated",
        });

        const res = await PUT_UNI(req, { params: { id: "fake-id" } });
        expect(res.status).toBe(404);
      });
    });

    describe("DELETE /api/v1/admin/universities/:id", () => {
      it("should delete a university", async () => {
        const uni = await testPrisma.university.create({
          data: { name: "To Delete", slug: "to-delete", location: "Somewhere" },
        });

        const req = makeAdminRequest("DELETE", adminToken, `http://localhost/api/v1/admin/universities/${uni.id}`);

        const res = await DELETE_UNI(req, { params: { id: uni.id } });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);

        const deleted = await testPrisma.university.findUnique({ where: { id: uni.id } });
        expect(deleted).toBeNull();
      });

      it("should return 404 when deleting non-existent university", async () => {
        const req = makeAdminRequest("DELETE", adminToken, "http://localhost/api/v1/admin/universities/fake-id");

        const res = await DELETE_UNI(req, { params: { id: "fake-id" } });
        expect(res.status).toBe(404);
      });

      it("should return 404 when getting deleted university", async () => {
        const uni = await testPrisma.university.create({
          data: { name: "Deleted Uni", slug: "deleted-uni", location: "Somewhere" },
        });

        await testPrisma.university.delete({ where: { id: uni.id } });

        const req = makeAdminRequest("GET", adminToken, `http://localhost/api/v1/admin/universities/${uni.id}`);

        const res = await GET_UNI_DETAIL(req, { params: { id: uni.id } });
        expect(res.status).toBe(404);
      });
    });
  });

  describe("Courses", () => {
    describe("POST /api/v1/admin/courses", () => {
      it("should return 401 for unauthenticated requests", async () => {
        const req = new NextRequest("http://localhost/api/v1/admin/courses", {
          method: "POST",
          body: JSON.stringify({
            name: "Test Course",
            slug: "test-course",
            degree: "Bachelor",
            language: "English",
            major: "CS",
            universityId,
            intake: "September",
            tuition: 20000,
            accommodation: 5000,
            serviceCharge: 1000,
          }),
          headers: { "Content-Type": "application/json" },
        });

        const res = await POST_COURSE(req);
        expect(res.status).toBe(401);
      });

      it("should return 403 for non-admin users", async () => {
        const req = makeAdminRequest(
          "POST",
          nonAdminToken,
          "http://localhost/api/v1/admin/courses",
          {
            name: "Test Course",
            slug: "test-course",
            degree: "Bachelor",
            language: "English",
            major: "CS",
            universityId,
            intake: "September",
            tuition: 20000,
            accommodation: 5000,
            serviceCharge: 1000,
          },
        );

        const res = await POST_COURSE(req);
        expect(res.status).toBe(403);
      });

      it("should create a course for admin users", async () => {
        const req = makeAdminRequest(
          "POST",
          adminToken,
          "http://localhost/api/v1/admin/courses",
          {
            name: "Computer Science",
            slug: "computer-science",
            degree: "Bachelor",
            language: "English",
            major: "CS",
            universityId,
            intake: "September",
            tuition: 25000,
            accommodation: 8000,
            serviceCharge: 2000,
            rating: 4.5,
            tags: ["programming", "engineering"],
            province: "Ontario",
            city: "Toronto",
          },
        );

        const res = await POST_COURSE(req);
        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.course).toBeDefined();
        expect(data.course.name).toBe("Computer Science");
        expect(data.course.slug).toBe("computer-science");
        expect(data.course.degree).toBe("Bachelor");
        expect(Number(data.course.tuition)).toBe(25000);
      });

      it("should return 400 for duplicate slug", async () => {
        await testPrisma.course.create({
          data: {
            name: "Existing Course",
            slug: "existing-slug",
            degree: "Bachelor",
            language: "English",
            major: "CS",
            universityId,
            intake: "September",
            tuition: 20000,
            accommodation: 5000,
            serviceCharge: 1000,
          },
        });

        const req = makeAdminRequest(
          "POST",
          adminToken,
          "http://localhost/api/v1/admin/courses",
          {
            name: "Another Course",
            slug: "existing-slug",
            degree: "Master",
            language: "English",
            major: "Math",
            universityId,
            intake: "September",
            tuition: 30000,
            accommodation: 8000,
            serviceCharge: 2000,
          },
        );

        const res = await POST_COURSE(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Slug already exists");
      });
    });

    describe("GET /api/v1/admin/courses", () => {
      it("should list courses with pagination", async () => {
        await testPrisma.course.create({
          data: {
            name: "Course 1",
            slug: "course-1",
            degree: "Bachelor",
            language: "English",
            major: "CS",
            universityId,
            intake: "September",
            tuition: 20000,
            accommodation: 5000,
            serviceCharge: 1000,
          },
        });
        await testPrisma.course.create({
          data: {
            name: "Course 2",
            slug: "course-2",
            degree: "Master",
            language: "English",
            major: "Data Science",
            universityId,
            intake: "September",
            tuition: 30000,
            accommodation: 8000,
            serviceCharge: 2000,
          },
        });

        const req = makeAdminRequest("GET", adminToken, "http://localhost/api/v1/admin/courses?page=1&limit=10");

        const res = await GET_COURSE(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.courses).toBeDefined();
        expect(Array.isArray(data.courses)).toBe(true);
        expect(data.pagination).toBeDefined();
      });

      it("should filter courses by degree", async () => {
        await testPrisma.course.create({
          data: {
            name: "Bachelor Course",
            slug: "bachelor-course",
            degree: "Bachelor",
            language: "English",
            major: "CS",
            universityId,
            intake: "September",
            tuition: 20000,
            accommodation: 5000,
            serviceCharge: 1000,
          },
        });
        await testPrisma.course.create({
          data: {
            name: "Master Course",
            slug: "master-course",
            degree: "Master",
            language: "English",
            major: "CS",
            universityId,
            intake: "September",
            tuition: 30000,
            accommodation: 8000,
            serviceCharge: 2000,
          },
        });

        const req = makeAdminRequest("GET", adminToken, "http://localhost/api/v1/admin/courses?page=1&limit=10&degree=Bachelor");

        const res = await GET_COURSE(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        const allBachelor = data.courses.every((c: any) => c.degree === "Bachelor");
        expect(allBachelor).toBe(true);
      });

      it("should filter courses by university", async () => {
        const uni2 = await testPrisma.university.create({
          data: { name: "University 2", slug: "university-2", location: "Location 2" },
        });

        await testPrisma.course.create({
          data: {
            name: "Course for Uni 1",
            slug: "course-uni-1",
            degree: "Bachelor",
            language: "English",
            major: "CS",
            universityId,
            intake: "September",
            tuition: 20000,
            accommodation: 5000,
            serviceCharge: 1000,
          },
        });
        await testPrisma.course.create({
          data: {
            name: "Course for Uni 2",
            slug: "course-uni-2",
            degree: "Bachelor",
            language: "English",
            major: "CS",
            universityId: uni2.id,
            intake: "September",
            tuition: 20000,
            accommodation: 5000,
            serviceCharge: 1000,
          },
        });

        const req = makeAdminRequest("GET", adminToken, `http://localhost/api/v1/admin/courses?page=1&limit=10&universityId=${universityId}`);

        const res = await GET_COURSE(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        const allCorrectUni = data.courses.every((c: any) => c.universityId === universityId);
        expect(allCorrectUni).toBe(true);
      });
    });

    describe("GET /api/v1/admin/courses/:id", () => {
      it("should get course detail", async () => {
        const course = await testPrisma.course.create({
          data: {
            name: "Detail Course",
            slug: "detail-course",
            degree: "Bachelor",
            language: "English",
            major: "CS",
            universityId,
            intake: "September",
            tuition: 20000,
            accommodation: 5000,
            serviceCharge: 1000,
          },
        });

        const req = makeAdminRequest("GET", adminToken, `http://localhost/api/v1/admin/courses/${course.id}`);

        const res = await GET_COURSE_DETAIL(req, { params: { id: course.id } });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.course).toBeDefined();
        expect(data.course.id).toBe(course.id);
        expect(data.course.name).toBe("Detail Course");
      });

      it("should return 404 for non-existent course", async () => {
        const req = makeAdminRequest("GET", adminToken, "http://localhost/api/v1/admin/courses/fake-id");

        const res = await GET_COURSE_DETAIL(req, { params: { id: "fake-id" } });
        expect(res.status).toBe(404);
      });
    });

    describe("PUT /api/v1/admin/courses/:id", () => {
      it("should update a course", async () => {
        const course = await testPrisma.course.create({
          data: {
            name: "Original Course",
            slug: "original-course",
            degree: "Bachelor",
            language: "English",
            major: "CS",
            universityId,
            intake: "September",
            tuition: 20000,
            accommodation: 5000,
            serviceCharge: 1000,
          },
        });

        const req = makeAdminRequest("PUT", adminToken, `http://localhost/api/v1/admin/courses/${course.id}`, {
          name: "Updated Course",
          tuition: 25000,
        });

        const res = await PUT_COURSE(req, { params: { id: course.id } });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.course.name).toBe("Updated Course");
        expect(Number(data.course.tuition)).toBe(25000);
      });

      it("should reject duplicate slug on update", async () => {
        const course1 = await testPrisma.course.create({
          data: {
            name: "Course 1",
            slug: "course-1",
            degree: "Bachelor",
            language: "English",
            major: "CS",
            universityId,
            intake: "September",
            tuition: 20000,
            accommodation: 5000,
            serviceCharge: 1000,
          },
        });
        await testPrisma.course.create({
          data: {
            name: "Course 2",
            slug: "course-2",
            degree: "Bachelor",
            language: "English",
            major: "CS",
            universityId,
            intake: "September",
            tuition: 20000,
            accommodation: 5000,
            serviceCharge: 1000,
          },
        });

        const req = makeAdminRequest("PUT", adminToken, `http://localhost/api/v1/admin/courses/${course1.id}`, {
          slug: "course-2",
        });

        const res = await PUT_COURSE(req, { params: { id: course1.id } });
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Slug already exists");
      });

      it("should return 404 for non-existent course", async () => {
        const req = makeAdminRequest("PUT", adminToken, "http://localhost/api/v1/admin/courses/fake-id", {
          name: "Updated",
        });

        const res = await PUT_COURSE(req, { params: { id: "fake-id" } });
        expect(res.status).toBe(404);
      });
    });

    describe("DELETE /api/v1/admin/courses/:id", () => {
      it("should delete a course", async () => {
        const course = await testPrisma.course.create({
          data: {
            name: "To Delete",
            slug: "to-delete",
            degree: "Bachelor",
            language: "English",
            major: "CS",
            universityId,
            intake: "September",
            tuition: 20000,
            accommodation: 5000,
            serviceCharge: 1000,
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

      it("should return 404 when deleting non-existent course", async () => {
        const req = makeAdminRequest("DELETE", adminToken, "http://localhost/api/v1/admin/courses/fake-id");

        const res = await DELETE_COURSE(req, { params: { id: "fake-id" } });
        expect(res.status).toBe(404);
      });

      it("should return 404 when getting deleted course", async () => {
        const course = await testPrisma.course.create({
          data: {
            name: "Deleted Course",
            slug: "deleted-course",
            degree: "Bachelor",
            language: "English",
            major: "CS",
            universityId,
            intake: "September",
            tuition: 20000,
            accommodation: 5000,
            serviceCharge: 1000,
          },
        });

        await testPrisma.course.delete({ where: { id: course.id } });

        const req = makeAdminRequest("GET", adminToken, `http://localhost/api/v1/admin/courses/${course.id}`);

        const res = await GET_COURSE_DETAIL(req, { params: { id: course.id } });
        expect(res.status).toBe(404);
      });
    });
  });

  describe("Scholarships", () => {
    describe("POST /api/v1/admin/scholarships", () => {
      it("should return 401 for unauthenticated requests", async () => {
        const req = new NextRequest("http://localhost/api/v1/admin/scholarships", {
          method: "POST",
          body: JSON.stringify({
            name: "Test Scholarship",
            slug: "test-scholarship",
            type: "Merit-Based",
            degree: "Bachelor",
            major: "Computer Science",
            universityId,
            intake: "fall",
            language: "English",
            province: "CA",
            city: "Toronto",
            tuition: 25000,
            accommodation: 5000,
          }),
          headers: { "Content-Type": "application/json" },
        });

        const res = await POST_SCHOLARSHIP(req);
        expect(res.status).toBe(401);
      });

      it("should return 403 for non-admin users", async () => {
        const req = makeAdminRequest(
          "POST",
          nonAdminToken,
          "http://localhost/api/v1/admin/scholarships",
          {
            name: "Test Scholarship",
            slug: "test-scholarship",
            type: "Merit-Based",
            degree: "Bachelor",
            major: "Computer Science",
            universityId,
            intake: "fall",
            language: "English",
            province: "CA",
            city: "Toronto",
            tuition: 25000,
            accommodation: 5000,
          },
        );

        const res = await POST_SCHOLARSHIP(req);
        expect(res.status).toBe(403);
      });

      it("should create a scholarship for admin users", async () => {
        const req = makeAdminRequest(
          "POST",
          adminToken,
          "http://localhost/api/v1/admin/scholarships",
          {
            name: "Test Scholarship",
            slug: "test-scholarship",
            type: "Merit-Based",
            degree: "Bachelor",
            major: "Computer Science",
            universityId,
            intake: "fall",
            language: "English",
            province: "CA",
            city: "Toronto",
            tuition: 25000,
            accommodation: 5000,
          },
        );

        const res = await POST_SCHOLARSHIP(req);
        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.scholarship).toBeDefined();
        expect(data.scholarship.name).toBe("Test Scholarship");
        expect(data.scholarship.slug).toBe("test-scholarship");
        expect(data.scholarship.type).toBe("Merit-Based");
        expect(Number(data.scholarship.tuition)).toBe(25000);
        expect(data.scholarship.university).toBeDefined();
        expect(data.scholarship.university.id).toBe(universityId);
        scholarshipId = data.scholarship.id;
      });

      it("should return 400 for duplicate slug", async () => {
        await testPrisma.scholarship.create({
          data: {
            name: "Existing Scholarship",
            slug: "existing-slug",
            type: "Merit-Based",
            degree: "Bachelor",
            major: "CS",
            universityId,
            intake: "fall",
            language: "English",
            province: "CA",
            city: "Toronto",
            tuition: 20000,
            accommodation: 4000,
          },
        });

        const req = makeAdminRequest(
          "POST",
          adminToken,
          "http://localhost/api/v1/admin/scholarships",
          {
            name: "Another Scholarship",
            slug: "existing-slug",
            type: "Need-Based",
            degree: "Master",
            major: "Data Science",
            universityId,
            intake: "spring",
            language: "English",
            province: "ON",
            city: "Ottawa",
            tuition: 30000,
            accommodation: 6000,
          },
        );

        const res = await POST_SCHOLARSHIP(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Slug already exists");
      });
    });

    describe("GET /api/v1/admin/scholarships", () => {
      it("should list scholarships with pagination", async () => {
        await testPrisma.scholarship.create({
          data: {
            name: "Scholarship 1",
            slug: "scholarship-1",
            type: "Merit-Based",
            degree: "Bachelor",
            major: "CS",
            universityId,
            intake: "fall",
            language: "English",
            province: "CA",
            city: "Toronto",
            tuition: 20000,
            accommodation: 4000,
          },
        });
        await testPrisma.scholarship.create({
          data: {
            name: "Scholarship 2",
            slug: "scholarship-2",
            type: "Need-Based",
            degree: "Master",
            major: "Data Science",
            universityId,
            intake: "spring",
            language: "English",
            province: "ON",
            city: "Ottawa",
            tuition: 30000,
            accommodation: 6000,
          },
        });

        const req = makeAdminRequest("GET", adminToken, "http://localhost/api/v1/admin/scholarships?page=1&limit=10");

        const res = await GET_SCHOLARSHIP(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.scholarships).toHaveLength(2);
        expect(data.pagination).toEqual({
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        });
      });

      it("should filter scholarships by search", async () => {
        await testPrisma.scholarship.create({
          data: {
            name: "Computer Science Scholarship",
            slug: "cs-scholarship",
            type: "Merit-Based",
            degree: "Bachelor",
            major: "CS",
            universityId,
            intake: "fall",
            language: "English",
            province: "CA",
            city: "Toronto",
            tuition: 20000,
            accommodation: 4000,
          },
        });
        await testPrisma.scholarship.create({
          data: {
            name: "Business Scholarship",
            slug: "business-scholarship",
            type: "Need-Based",
            degree: "Master",
            major: "Business",
            universityId,
            intake: "spring",
            language: "English",
            province: "ON",
            city: "Ottawa",
            tuition: 30000,
            accommodation: 6000,
          },
        });

        const req = makeAdminRequest("GET", adminToken, "http://localhost/api/v1/admin/scholarships?page=1&limit=10&search=Computer");

        const res = await GET_SCHOLARSHIP(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.scholarships).toHaveLength(1);
        expect(data.scholarships[0].name).toBe("Computer Science Scholarship");
      });

      it("should filter scholarships by type", async () => {
        await testPrisma.scholarship.create({
          data: {
            name: "Merit Scholarship",
            slug: "merit-scholarship",
            type: "Merit-Based",
            degree: "Bachelor",
            major: "CS",
            universityId,
            intake: "fall",
            language: "English",
            province: "CA",
            city: "Toronto",
            tuition: 20000,
            accommodation: 4000,
          },
        });
        await testPrisma.scholarship.create({
          data: {
            name: "Need Scholarship",
            slug: "need-scholarship",
            type: "Need-Based",
            degree: "Master",
            major: "Data Science",
            universityId,
            intake: "spring",
            language: "English",
            province: "ON",
            city: "Ottawa",
            tuition: 30000,
            accommodation: 6000,
          },
        });

        const req = makeAdminRequest("GET", adminToken, "http://localhost/api/v1/admin/scholarships?page=1&limit=10&type=Merit-Based");

        const res = await GET_SCHOLARSHIP(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.scholarships).toHaveLength(1);
        expect(data.scholarships[0].type).toBe("Merit-Based");
      });

      it("should filter scholarships by degree", async () => {
        await testPrisma.scholarship.create({
          data: {
            name: "Bachelor Scholarship",
            slug: "bachelor-scholarship",
            type: "Merit-Based",
            degree: "Bachelor",
            major: "CS",
            universityId,
            intake: "fall",
            language: "English",
            province: "CA",
            city: "Toronto",
            tuition: 20000,
            accommodation: 4000,
          },
        });
        await testPrisma.scholarship.create({
          data: {
            name: "Master Scholarship",
            slug: "master-scholarship",
            type: "Need-Based",
            degree: "Master",
            major: "Data Science",
            universityId,
            intake: "spring",
            language: "English",
            province: "ON",
            city: "Ottawa",
            tuition: 30000,
            accommodation: 6000,
          },
        });

        const req = makeAdminRequest("GET", adminToken, "http://localhost/api/v1/admin/scholarships?page=1&limit=10&degree=Bachelor");

        const res = await GET_SCHOLARSHIP(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.scholarships).toHaveLength(1);
        expect(data.scholarships[0].degree).toBe("Bachelor");
      });
    });

    describe("GET /api/v1/admin/scholarships/[id]", () => {
      it("should get scholarship detail", async () => {
        const scholarship = await testPrisma.scholarship.create({
          data: {
            name: "Detail Scholarship",
            slug: "detail-scholarship",
            type: "Merit-Based",
            degree: "Bachelor",
            major: "CS",
            universityId,
            intake: "fall",
            language: "English",
            province: "CA",
            city: "Toronto",
            tuition: 20000,
            accommodation: 4000,
          },
        });

        const req = makeAdminRequest("GET", adminToken, `http://localhost/api/v1/admin/scholarships/${scholarship.id}`);

        const res = await GET_SCHOLARSHIP_DETAIL(req, { params: { id: scholarship.id } });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.scholarship).toBeDefined();
        expect(data.scholarship.id).toBe(scholarship.id);
        expect(data.scholarship.name).toBe("Detail Scholarship");
      });

      it("should return 404 for non-existent scholarship", async () => {
        const req = makeAdminRequest("GET", adminToken, "http://localhost/api/v1/admin/scholarships/fake-id");

        const res = await GET_SCHOLARSHIP_DETAIL(req, { params: { id: "fake-id" } });
        expect(res.status).toBe(404);
      });
    });

    describe("PUT /api/v1/admin/scholarships/[id]", () => {
      it("should update a scholarship", async () => {
        const scholarship = await testPrisma.scholarship.create({
          data: {
            name: "Original Name",
            slug: "original-name",
            type: "Merit-Based",
            degree: "Bachelor",
            major: "CS",
            universityId,
            intake: "fall",
            language: "English",
            province: "CA",
            city: "Toronto",
            tuition: 20000,
            accommodation: 4000,
          },
        });

        const req = makeAdminRequest("PUT", adminToken, `http://localhost/api/v1/admin/scholarships/${scholarship.id}`, {
          name: "Updated Name",
          tuition: 25000,
        });

        const res = await PUT_SCHOLARSHIP(req, { params: { id: scholarship.id } });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.scholarship.name).toBe("Updated Name");
        expect(Number(data.scholarship.tuition)).toBe(25000);
      });

      it("should reject duplicate slug on update", async () => {
        const scholarship1 = await testPrisma.scholarship.create({
          data: {
            name: "Scholarship 1",
            slug: "scholarship-1",
            type: "Merit-Based",
            degree: "Bachelor",
            major: "CS",
            universityId,
            intake: "fall",
            language: "English",
            province: "CA",
            city: "Toronto",
            tuition: 20000,
            accommodation: 4000,
          },
        });
        await testPrisma.scholarship.create({
          data: {
            name: "Scholarship 2",
            slug: "scholarship-2",
            type: "Merit-Based",
            degree: "Bachelor",
            major: "CS",
            universityId,
            intake: "fall",
            language: "English",
            province: "CA",
            city: "Toronto",
            tuition: 20000,
            accommodation: 4000,
          },
        });

        const req = makeAdminRequest("PUT", adminToken, `http://localhost/api/v1/admin/scholarships/${scholarship1.id}`, {
          slug: "scholarship-2",
        });

        const res = await PUT_SCHOLARSHIP(req, { params: { id: scholarship1.id } });
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Slug already exists");
      });
    });

    describe("DELETE /api/v1/admin/scholarships/[id]", () => {
      it("should delete a scholarship", async () => {
        const scholarship = await testPrisma.scholarship.create({
          data: {
            name: "To Delete",
            slug: "to-delete",
            type: "Merit-Based",
            degree: "Bachelor",
            major: "CS",
            universityId,
            intake: "fall",
            language: "English",
            province: "CA",
            city: "Toronto",
            tuition: 20000,
            accommodation: 4000,
          },
        });

        const req = makeAdminRequest("DELETE", adminToken, `http://localhost/api/v1/admin/scholarships/${scholarship.id}`);

        const res = await DELETE_SCHOLARSHIP(req, { params: { id: scholarship.id } });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);

        const deleted = await testPrisma.scholarship.findUnique({ where: { id: scholarship.id } });
        expect(deleted).toBeNull();
      });

      it("should return 404 when deleting non-existent scholarship", async () => {
        const req = makeAdminRequest("DELETE", adminToken, "http://localhost/api/v1/admin/scholarships/fake-id");

        const res = await DELETE_SCHOLARSHIP(req, { params: { id: "fake-id" } });
        expect(res.status).toBe(404);
      });

      it("should return 404 when getting deleted scholarship", async () => {
        const scholarship = await testPrisma.scholarship.create({
          data: {
            name: "Deleted Scholarship",
            slug: "deleted-scholarship",
            type: "Merit-Based",
            degree: "Bachelor",
            major: "CS",
            universityId,
            intake: "fall",
            language: "English",
            province: "CA",
            city: "Toronto",
            tuition: 20000,
            accommodation: 4000,
          },
        });

        await testPrisma.scholarship.delete({ where: { id: scholarship.id } });

        const req = makeAdminRequest("GET", adminToken, `http://localhost/api/v1/admin/scholarships/${scholarship.id}`);

        const res = await GET_SCHOLARSHIP_DETAIL(req, { params: { id: scholarship.id } });
        expect(res.status).toBe(404);
      });
    });
  });

  describe("Blog Posts", () => {
    describe("POST /api/v1/admin/blog-posts", () => {
      it("should return 401 for unauthenticated requests", async () => {
        const req = new NextRequest("http://localhost/api/v1/admin/blog-posts", {
          method: "POST",
          body: JSON.stringify({
            title: "Test Post",
            slug: "test-post",
            content: "This is a test blog post",
            category: "Technology",
            topic: "AI",
            published: false,
          }),
          headers: { "Content-Type": "application/json" },
        });

        const res = await POST_BLOG(req);
        expect(res.status).toBe(401);
      });

      it("should return 403 for non-admin users", async () => {
        const req = makeAdminRequest(
          "POST",
          nonAdminToken,
          "http://localhost/api/v1/admin/blog-posts",
          {
            title: "Test Post",
            slug: "test-post",
            content: "This is a test blog post",
            category: "Technology",
            topic: "AI",
            published: false,
          },
        );

        const res = await POST_BLOG(req);
        expect(res.status).toBe(403);
      });

      it("should create a draft blog post", async () => {
        const req = makeAdminRequest(
          "POST",
          adminToken,
          "http://localhost/api/v1/admin/blog-posts",
          {
            title: "Draft Post",
            slug: "draft-post",
            content: "This is a draft blog post",
            category: "Technology",
            topic: "AI",
            published: false,
          },
        );

        const res = await POST_BLOG(req);
        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.blogPost).toBeDefined();
        expect(data.blogPost.title).toBe("Draft Post");
        expect(data.blogPost.published).toBe(false);
        expect(data.blogPost.publishedAt).toBeNull();
        blogPostId = data.blogPost.id;
      });

      it("should create a published blog post with publishedAt set", async () => {
        const req = makeAdminRequest(
          "POST",
          adminToken,
          "http://localhost/api/v1/admin/blog-posts",
          {
            title: "Published Post",
            slug: "published-post",
            content: "This is a published blog post",
            category: "Technology",
            topic: "AI",
            published: true,
          },
        );

        const res = await POST_BLOG(req);
        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.blogPost).toBeDefined();
        expect(data.blogPost.title).toBe("Published Post");
        expect(data.blogPost.published).toBe(true);
        expect(data.blogPost.publishedAt).toBeDefined();
        expect(data.blogPost.publishedAt).not.toBeNull();
      });

      it("should return 400 for duplicate slug", async () => {
        await testPrisma.blogPost.create({
          data: {
            title: "Existing Post",
            slug: "existing-slug",
            content: "Content",
            category: "Tech",
            topic: "AI",
            published: false,
          },
        });

        const req = makeAdminRequest(
          "POST",
          adminToken,
          "http://localhost/api/v1/admin/blog-posts",
          {
            title: "Another Post",
            slug: "existing-slug",
            content: "Different content",
            category: "Business",
            topic: "Startups",
            published: false,
          },
        );

        const res = await POST_BLOG(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Slug already exists");
      });
    });

    describe("GET /api/v1/admin/blog-posts", () => {
      it("should list blog posts with pagination", async () => {
        await testPrisma.blogPost.create({
          data: {
            title: "Post 1",
            slug: "post-1",
            content: "Content 1",
            category: "Tech",
            topic: "AI",
            published: true,
          },
        });
        await testPrisma.blogPost.create({
          data: {
            title: "Post 2",
            slug: "post-2",
            content: "Content 2",
            category: "Business",
            topic: "Startups",
            published: false,
          },
        });

        const req = makeAdminRequest("GET", adminToken, "http://localhost/api/v1/admin/blog-posts?page=1&limit=10");

        const res = await GET_BLOG(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.blogPosts).toHaveLength(2);
        expect(data.pagination).toEqual({
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        });
      });

      it("should filter blog posts by search", async () => {
        await testPrisma.blogPost.create({
          data: {
            title: "AI Revolution",
            slug: "ai-revolution",
            content: "Content about AI",
            category: "Tech",
            topic: "AI",
            published: true,
          },
        });
        await testPrisma.blogPost.create({
          data: {
            title: "Business Tips",
            slug: "business-tips",
            content: "Tips for business",
            category: "Business",
            topic: "Management",
            published: true,
          },
        });

        const req = makeAdminRequest("GET", adminToken, "http://localhost/api/v1/admin/blog-posts?page=1&limit=10&search=AI");

        const res = await GET_BLOG(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.blogPosts).toHaveLength(1);
        expect(data.blogPosts[0].title).toBe("AI Revolution");
      });

      it("should filter blog posts by published=true", async () => {
        await testPrisma.blogPost.create({
          data: {
            title: "Published Post",
            slug: "published-post",
            content: "Published content",
            category: "Tech",
            topic: "AI",
            published: true,
          },
        });
        await testPrisma.blogPost.create({
          data: {
            title: "Draft Post",
            slug: "draft-post",
            content: "Draft content",
            category: "Tech",
            topic: "AI",
            published: false,
          },
        });

        const req = makeAdminRequest("GET", adminToken, "http://localhost/api/v1/admin/blog-posts?page=1&limit=10&published=true");

        const res = await GET_BLOG(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.blogPosts).toHaveLength(1);
        expect(data.blogPosts[0].published).toBe(true);
      });

      it("should filter blog posts by published=false", async () => {
        await testPrisma.blogPost.create({
          data: {
            title: "Published Post",
            slug: "published-post",
            content: "Published content",
            category: "Tech",
            topic: "AI",
            published: true,
          },
        });
        await testPrisma.blogPost.create({
          data: {
            title: "Draft Post",
            slug: "draft-post",
            content: "Draft content",
            category: "Tech",
            topic: "AI",
            published: false,
          },
        });

        const req = makeAdminRequest("GET", adminToken, "http://localhost/api/v1/admin/blog-posts?page=1&limit=10&published=false");

        const res = await GET_BLOG(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.blogPosts).toHaveLength(1);
        expect(data.blogPosts[0].published).toBe(false);
      });

      it("should filter blog posts by category", async () => {
        await testPrisma.blogPost.create({
          data: {
            title: "Tech Post",
            slug: "tech-post",
            content: "Tech content",
            category: "Technology",
            topic: "AI",
            published: true,
          },
        });
        await testPrisma.blogPost.create({
          data: {
            title: "Business Post",
            slug: "business-post",
            content: "Business content",
            category: "Business",
            topic: "Management",
            published: true,
          },
        });

        const req = makeAdminRequest("GET", adminToken, "http://localhost/api/v1/admin/blog-posts?page=1&limit=10&category=Technology");

        const res = await GET_BLOG(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.blogPosts).toHaveLength(1);
        expect(data.blogPosts[0].category).toBe("Technology");
      });
    });

    describe("GET /api/v1/admin/blog-posts/[id]", () => {
      it("should get blog post detail", async () => {
        const blogPost = await testPrisma.blogPost.create({
          data: {
            title: "Detail Post",
            slug: "detail-post",
            content: "Post content",
            category: "Tech",
            topic: "AI",
            published: true,
          },
        });

        const req = makeAdminRequest("GET", adminToken, `http://localhost/api/v1/admin/blog-posts/${blogPost.id}`);

        const res = await GET_BLOG_DETAIL(req, { params: { id: blogPost.id } });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.blogPost).toBeDefined();
        expect(data.blogPost.id).toBe(blogPost.id);
        expect(data.blogPost.title).toBe("Detail Post");
      });

      it("should return 404 for non-existent blog post", async () => {
        const req = makeAdminRequest("GET", adminToken, "http://localhost/api/v1/admin/blog-posts/fake-id");

        const res = await GET_BLOG_DETAIL(req, { params: { id: "fake-id" } });
        expect(res.status).toBe(404);
      });
    });

    describe("PUT /api/v1/admin/blog-posts/[id]", () => {
      it("should update a blog post", async () => {
        const blogPost = await testPrisma.blogPost.create({
          data: {
            title: "Original Title",
            slug: "original-title",
            content: "Original content",
            category: "Tech",
            topic: "AI",
            published: false,
          },
        });

        const req = makeAdminRequest("PUT", adminToken, `http://localhost/api/v1/admin/blog-posts/${blogPost.id}`, {
          title: "Updated Title",
          content: "Updated content",
        });

        const res = await PUT_BLOG(req, { params: { id: blogPost.id } });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.blogPost.title).toBe("Updated Title");
        expect(data.blogPost.content).toBe("Updated content");
      });

      it("should set publishedAt when publishing a draft", async () => {
        const blogPost = await testPrisma.blogPost.create({
          data: {
            title: "Draft Post",
            slug: "draft-post",
            content: "Draft content",
            category: "Tech",
            topic: "AI",
            published: false,
            publishedAt: null,
          },
        });

        const req = makeAdminRequest("PUT", adminToken, `http://localhost/api/v1/admin/blog-posts/${blogPost.id}`, {
          published: true,
        });

        const res = await PUT_BLOG(req, { params: { id: blogPost.id } });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.blogPost.published).toBe(true);
        expect(data.blogPost.publishedAt).toBeDefined();
        expect(data.blogPost.publishedAt).not.toBeNull();
      });

      it("should keep existing publishedAt when updating published post", async () => {
        const originalPublishedAt = new Date("2026-01-01T10:00:00Z");
        const blogPost = await testPrisma.blogPost.create({
          data: {
            title: "Published Post",
            slug: "published-post",
            content: "Published content",
            category: "Tech",
            topic: "AI",
            published: true,
            publishedAt: originalPublishedAt,
          },
        });

        const req = makeAdminRequest("PUT", adminToken, `http://localhost/api/v1/admin/blog-posts/${blogPost.id}`, {
          content: "Updated published content",
        });

        const res = await PUT_BLOG(req, { params: { id: blogPost.id } });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.blogPost.content).toBe("Updated published content");
        expect(new Date(data.blogPost.publishedAt).getTime()).toBe(originalPublishedAt.getTime());
      });

      it("should reject duplicate slug on update", async () => {
        const blogPost1 = await testPrisma.blogPost.create({
          data: {
            title: "Post 1",
            slug: "post-1",
            content: "Content 1",
            category: "Tech",
            topic: "AI",
            published: false,
          },
        });
        await testPrisma.blogPost.create({
          data: {
            title: "Post 2",
            slug: "post-2",
            content: "Content 2",
            category: "Tech",
            topic: "AI",
            published: false,
          },
        });

        const req = makeAdminRequest("PUT", adminToken, `http://localhost/api/v1/admin/blog-posts/${blogPost1.id}`, {
          slug: "post-2",
        });

        const res = await PUT_BLOG(req, { params: { id: blogPost1.id } });
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Slug already exists");
      });
    });

    describe("DELETE /api/v1/admin/blog-posts/[id]", () => {
      it("should delete a blog post", async () => {
        const blogPost = await testPrisma.blogPost.create({
          data: {
            title: "To Delete",
            slug: "to-delete",
            content: "Content to delete",
            category: "Tech",
            topic: "AI",
            published: false,
          },
        });

        const req = makeAdminRequest("DELETE", adminToken, `http://localhost/api/v1/admin/blog-posts/${blogPost.id}`);

        const res = await DELETE_BLOG(req, { params: { id: blogPost.id } });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);

        const deleted = await testPrisma.blogPost.findUnique({ where: { id: blogPost.id } });
        expect(deleted).toBeNull();
      });

      it("should return 404 when deleting non-existent blog post", async () => {
        const req = makeAdminRequest("DELETE", adminToken, "http://localhost/api/v1/admin/blog-posts/fake-id");

        const res = await DELETE_BLOG(req, { params: { id: "fake-id" } });
        expect(res.status).toBe(404);
      });

      it("should return 404 when getting deleted blog post", async () => {
        const blogPost = await testPrisma.blogPost.create({
          data: {
            title: "Deleted Post",
            slug: "deleted-post",
            content: "Content",
            category: "Tech",
            topic: "AI",
            published: false,
          },
        });

        await testPrisma.blogPost.delete({ where: { id: blogPost.id } });

        const req = makeAdminRequest("GET", adminToken, `http://localhost/api/v1/admin/blog-posts/${blogPost.id}`);

        const res = await GET_BLOG_DETAIL(req, { params: { id: blogPost.id } });
        expect(res.status).toBe(404);
      });
    });
  });
});
