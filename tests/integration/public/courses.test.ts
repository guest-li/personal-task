import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as GET_LIST } from "@/app/api/v1/public/courses/route";
import { GET as GET_DETAIL } from "@/app/api/v1/public/courses/[id]/route";
import { cleanDatabase, testPrisma } from "../../helpers/db";

function makePublicRequest(
  method: "GET" = "GET",
  url: string,
) {
  return new NextRequest(url, { method });
}

describe("Public Courses API", () => {
  let universityId: string;

  beforeEach(async () => {
    await cleanDatabase();
    // Create a test university for courses
    const university = await testPrisma.university.create({
      data: {
        name: "Test University",
        slug: "test-univ",
        tags: [],
      },
    });
    universityId = university.id;
  });

  describe("GET /api/v1/public/courses", () => {
    it("should return empty list when no courses exist", async () => {
      const req = makePublicRequest("GET", "http://localhost/api/v1/public/courses");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.courses)).toBe(true);
      expect(body.courses.length).toBe(0);
      expect(body.pagination).toBeDefined();
      expect(body.pagination.page).toBe(1);
      expect(body.pagination.total).toBe(0);
    });

    it("should list courses with default pagination", async () => {
      for (let i = 0; i < 25; i++) {
        await testPrisma.course.create({
          data: {
            name: `Course ${i}`,
            slug: `course-${i}`,
            degree: "Master",
            language: "English",
            major: "Engineering",
            universityId,
            intake: "Fall 2024",
            tuition: 50000,
            accommodation: 5000,
            serviceCharge: 1000,
          },
        });
      }

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/courses");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.courses)).toBe(true);
      expect(body.courses.length).toBeLessThanOrEqual(20);
      expect(body.pagination.total).toBe(25);
      expect(body.pagination.totalPages).toBe(2);
    });

    it("should respect custom pagination parameters", async () => {
      for (let i = 0; i < 30; i++) {
        await testPrisma.course.create({
          data: {
            name: `Course ${i}`,
            slug: `course-${i}`,
            degree: "Bachelor",
            language: "English",
            major: "Business",
            universityId,
            intake: "Spring 2025",
            tuition: 40000,
            accommodation: 4000,
            serviceCharge: 800,
          },
        });
      }

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/courses?page=2&limit=15");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.courses.length).toBeLessThanOrEqual(15);
      expect(body.pagination.page).toBe(2);
      expect(body.pagination.limit).toBe(15);
      expect(body.pagination.total).toBe(30);
    });

    it("should filter courses by degree", async () => {
      await testPrisma.course.create({
        data: {
          name: "Bachelor Course",
          slug: "bach-course",
          degree: "Bachelor",
          language: "English",
          major: "Engineering",
          universityId,
          tuition: 30000,
          accommodation: 3000,
          serviceCharge: 600,
        },
      });
      await testPrisma.course.create({
        data: {
          name: "Master Course",
          slug: "master-course",
          degree: "Master",
          language: "English",
          major: "Engineering",
          universityId,
          tuition: 50000,
          accommodation: 5000,
          serviceCharge: 1000,
        },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/courses?degree=Master");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      const allMaster = body.courses.every((c: any) => c.degree === "Master");
      expect(allMaster).toBe(true);
      expect(body.courses.length).toBe(1);
    });

    it("should filter courses by language", async () => {
      await testPrisma.course.create({
        data: {
          name: "English Course",
          slug: "eng-course",
          degree: "Bachelor",
          language: "English",
          major: "Business",
          universityId,
          tuition: 30000,
          accommodation: 3000,
          serviceCharge: 600,
        },
      });
      await testPrisma.course.create({
        data: {
          name: "Chinese Course",
          slug: "chi-course",
          degree: "Bachelor",
          language: "Chinese",
          major: "Business",
          universityId,
          tuition: 25000,
          accommodation: 3000,
          serviceCharge: 600,
        },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/courses?language=Chinese");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.courses.length).toBe(1);
      expect(body.courses[0].language).toBe("Chinese");
    });

    it("should filter courses by major", async () => {
      await testPrisma.course.create({
        data: {
          name: "Engineering Course",
          slug: "eng-major",
          degree: "Master",
          language: "English",
          major: "Software Engineering",
          universityId,
          tuition: 50000,
          accommodation: 5000,
          serviceCharge: 1000,
        },
      });
      await testPrisma.course.create({
        data: {
          name: "Business Course",
          slug: "bus-major",
          degree: "Master",
          language: "English",
          major: "Business Administration",
          universityId,
          tuition: 45000,
          accommodation: 5000,
          serviceCharge: 1000,
        },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/courses?major=Software");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.courses.length).toBe(1);
      expect(body.courses[0].major).toContain("Software");
    });

    it("should filter courses by universityId", async () => {
      const otherUniversity = await testPrisma.university.create({
        data: { name: "Other Univ", slug: "other-univ", tags: [] },
      });

      await testPrisma.course.create({
        data: {
          name: "Course 1",
          slug: "course-1",
          degree: "Bachelor",
          language: "English",
          major: "Engineering",
          universityId,
          tuition: 30000,
          accommodation: 3000,
          serviceCharge: 600,
        },
      });
      await testPrisma.course.create({
        data: {
          name: "Course 2",
          slug: "course-2",
          degree: "Bachelor",
          language: "English",
          major: "Engineering",
          universityId: otherUniversity.id,
          tuition: 35000,
          accommodation: 3500,
          serviceCharge: 700,
        },
      });

      const req = makePublicRequest("GET", `http://localhost/api/v1/public/courses?universityId=${universityId}`);
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.courses.length).toBe(1);
      expect(body.courses[0].universityId).toBe(universityId);
    });

    it("should filter courses by intake", async () => {
      await testPrisma.course.create({
        data: {
          name: "Fall Course",
          slug: "fall-course",
          degree: "Bachelor",
          language: "English",
          major: "Engineering",
          intake: "Fall 2024",
          universityId,
          tuition: 30000,
          accommodation: 3000,
          serviceCharge: 600,
        },
      });
      await testPrisma.course.create({
        data: {
          name: "Spring Course",
          slug: "spring-course",
          degree: "Bachelor",
          language: "English",
          major: "Engineering",
          intake: "Spring 2025",
          universityId,
          tuition: 30000,
          accommodation: 3000,
          serviceCharge: 600,
        },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/courses?intake=Fall%202024");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.courses.length).toBe(1);
      expect(body.courses[0].intake).toBe("Fall 2024");
    });

    it("should filter courses by province", async () => {
      await testPrisma.course.create({
        data: {
          name: "Beijing Course",
          slug: "beijing-course",
          degree: "Bachelor",
          language: "English",
          major: "Engineering",
          province: "Beijing",
          universityId,
          tuition: 30000,
          accommodation: 3000,
          serviceCharge: 600,
        },
      });
      await testPrisma.course.create({
        data: {
          name: "Shanghai Course",
          slug: "shanghai-course",
          degree: "Bachelor",
          language: "English",
          major: "Engineering",
          province: "Shanghai",
          universityId,
          tuition: 32000,
          accommodation: 3200,
          serviceCharge: 600,
        },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/courses?province=Beijing");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.courses.length).toBe(1);
      expect(body.courses[0].province).toBe("Beijing");
    });

    it("should filter courses by city", async () => {
      await testPrisma.course.create({
        data: {
          name: "Beijing City Course",
          slug: "beijing-city",
          degree: "Bachelor",
          language: "English",
          major: "Engineering",
          city: "Beijing",
          universityId,
          tuition: 30000,
          accommodation: 3000,
          serviceCharge: 600,
        },
      });
      await testPrisma.course.create({
        data: {
          name: "Chaoyang Course",
          slug: "chaoyang-course",
          degree: "Bachelor",
          language: "English",
          major: "Engineering",
          city: "Chaoyang",
          universityId,
          tuition: 30000,
          accommodation: 3000,
          serviceCharge: 600,
        },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/courses?city=Chaoyang");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.courses.length).toBe(1);
      expect(body.courses[0].city).toBe("Chaoyang");
    });

    it("should search courses by name or major", async () => {
      await testPrisma.course.create({
        data: {
          name: "Advanced Data Science",
          slug: "adv-data-science",
          degree: "Master",
          language: "English",
          major: "Data Science",
          universityId,
          tuition: 60000,
          accommodation: 6000,
          serviceCharge: 1200,
        },
      });
      await testPrisma.course.create({
        data: {
          name: "Basic Programming",
          slug: "basic-prog",
          degree: "Bachelor",
          language: "English",
          major: "Computer Science",
          universityId,
          tuition: 30000,
          accommodation: 3000,
          serviceCharge: 600,
        },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/courses?search=Data");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.courses.length).toBe(1);
      expect(body.courses[0].major).toContain("Data");
    });

    it("should combine multiple filters", async () => {
      await testPrisma.course.create({
        data: {
          name: "Beijing Master Engineering",
          slug: "beijing-master-eng",
          degree: "Master",
          language: "English",
          major: "Software Engineering",
          province: "Beijing",
          universityId,
          tuition: 50000,
          accommodation: 5000,
          serviceCharge: 1000,
        },
      });
      await testPrisma.course.create({
        data: {
          name: "Shanghai Master Engineering",
          slug: "shanghai-master-eng",
          degree: "Master",
          language: "English",
          major: "Software Engineering",
          province: "Shanghai",
          universityId,
          tuition: 52000,
          accommodation: 5200,
          serviceCharge: 1000,
        },
      });

      const req = makePublicRequest(
        "GET",
        "http://localhost/api/v1/public/courses?degree=Master&province=Beijing&language=English",
      );
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.courses.length).toBe(1);
      expect(body.courses[0].province).toBe("Beijing");
      expect(body.courses[0].degree).toBe("Master");
    });
  });

  describe("GET /api/v1/public/courses/:id", () => {
    it("should return course detail with university info", async () => {
      const course = await testPrisma.course.create({
        data: {
          name: "Detailed Course",
          slug: "detailed-course",
          degree: "Master",
          language: "English",
          major: "Engineering",
          universityId,
          tuition: 55000,
          accommodation: 5500,
          serviceCharge: 1100,
          rating: 4.5,
          popularity: 100,
          intake: "Fall 2024",
          province: "Beijing",
          city: "Beijing",
        },
      });

      const req = makePublicRequest("GET", `http://localhost/api/v1/public/courses/${course.id}`);
      const res = await GET_DETAIL(req, { params: { id: course.id } });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.course).toBeDefined();
      expect(body.course.id).toBe(course.id);
      expect(body.course.name).toBe("Detailed Course");
      expect(body.course.tuition).toBeDefined();
      expect(body.course.accommodation).toBeDefined();
      expect(body.course.rating).toBe(4.5);
      expect(body.course.university).toBeDefined();
      expect(body.course.university.name).toBe("Test University");
    });

    it("should return 404 for non-existent course", async () => {
      const req = makePublicRequest("GET", "http://localhost/api/v1/public/courses/non-existent-id");
      const res = await GET_DETAIL(req, { params: { id: "non-existent-id" } });
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    it("should include all course fields", async () => {
      const course = await testPrisma.course.create({
        data: {
          name: "Full Detail Course",
          slug: "full-detail",
          degree: "PhD",
          language: "Chinese",
          major: "Research Engineering",
          universityId,
          intake: "Spring 2025",
          tuition: 70000,
          accommodation: 7000,
          serviceCharge: 1400,
          rating: 4.8,
          popularity: 150,
          tags: ["research", "advanced"],
          province: "Shanghai",
          city: "Pudong",
        },
      });

      const req = makePublicRequest("GET", `http://localhost/api/v1/public/courses/${course.id}`);
      const res = await GET_DETAIL(req, { params: { id: course.id } });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.course.slug).toBe("full-detail");
      expect(body.course.language).toBe("Chinese");
      expect(body.course.major).toBe("Research Engineering");
      expect(body.course.rating).toBe(4.8);
      expect(body.course.popularity).toBe(150);
      expect(body.course.province).toBe("Shanghai");
      expect(body.course.city).toBe("Pudong");
    });
  });
});
