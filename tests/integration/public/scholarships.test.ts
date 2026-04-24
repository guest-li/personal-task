import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as GET_LIST } from "@/app/api/v1/public/scholarships/route";
import { cleanDatabase, testPrisma } from "../../helpers/db";

function makePublicRequest(
  method: "GET" = "GET",
  url: string,
) {
  return new NextRequest(url, { method });
}

describe("Public Scholarships API", () => {
  let universityId: string;

  beforeEach(async () => {
    await cleanDatabase();
    // Create a test university for scholarships
    const university = await testPrisma.university.create({
      data: {
        name: "Test University",
        slug: "test-univ",
        tags: [],
      },
    });
    universityId = university.id;
  });

  describe("GET /api/v1/public/scholarships", () => {
    it("should return empty list when no scholarships exist", async () => {
      const req = makePublicRequest("GET", "http://localhost/api/v1/public/scholarships");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.scholarships)).toBe(true);
      expect(body.scholarships.length).toBe(0);
      expect(body.pagination).toBeDefined();
      expect(body.pagination.page).toBe(1);
      expect(body.pagination.total).toBe(0);
    });

    it("should list scholarships with default pagination", async () => {
      for (let i = 0; i < 25; i++) {
        await testPrisma.scholarship.create({
          data: {
            name: `Scholarship ${i}`,
            slug: `scholarship-${i}`,
            type: "Full Tuition",
            degree: "Master",
            major: "Engineering",
            language: "English",
            universityId,
            intake: "Fall 2024",
            province: "Beijing",
            city: "Beijing",
            tuition: 50000,
            accommodation: 5000,
          },
        });
      }

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/scholarships");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.scholarships)).toBe(true);
      expect(body.scholarships.length).toBeLessThanOrEqual(20);
      expect(body.pagination.total).toBe(25);
      expect(body.pagination.totalPages).toBe(2);
    });

    it("should respect custom pagination parameters", async () => {
      for (let i = 0; i < 30; i++) {
        await testPrisma.scholarship.create({
          data: {
            name: `Scholarship ${i}`,
            slug: `scholarship-${i}`,
            type: "Partial",
            degree: "Bachelor",
            major: "Business",
            language: "English",
            universityId,
            intake: "Spring 2025",
            province: "Shanghai",
            city: "Shanghai",
            tuition: 30000,
            accommodation: 3000,
          },
        });
      }

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/scholarships?page=2&limit=12");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.scholarships.length).toBeLessThanOrEqual(12);
      expect(body.pagination.page).toBe(2);
      expect(body.pagination.limit).toBe(12);
      expect(body.pagination.total).toBe(30);
    });

    it("should filter scholarships by type", async () => {
      await testPrisma.scholarship.create({
        data: {
          name: "Full Scholarship",
          slug: "full-scholarship",
          type: "Full Tuition",
          degree: "Master",
          major: "Engineering",
          language: "English",
          universityId,
          intake: "Fall 2024",
          province: "Beijing",
          city: "Beijing",
          tuition: 50000,
          accommodation: 5000,
        },
      });
      await testPrisma.scholarship.create({
        data: {
          name: "Partial Scholarship",
          slug: "partial-scholarship",
          type: "Partial",
          degree: "Master",
          major: "Engineering",
          language: "English",
          universityId,
          intake: "Fall 2024",
          province: "Beijing",
          city: "Beijing",
          tuition: 25000,
          accommodation: 2500,
        },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/scholarships?type=Full%20Tuition");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.scholarships.length).toBe(1);
      expect(body.scholarships[0].type).toBe("Full Tuition");
    });

    it("should filter scholarships by degree", async () => {
      await testPrisma.scholarship.create({
        data: {
          name: "Bachelor Scholarship",
          slug: "bach-scholarship",
          type: "Full Tuition",
          degree: "Bachelor",
          major: "Engineering",
          language: "English",
          universityId,
          intake: "Fall 2024",
          province: "Beijing",
          city: "Beijing",
          tuition: 30000,
          accommodation: 3000,
        },
      });
      await testPrisma.scholarship.create({
        data: {
          name: "Master Scholarship",
          slug: "master-scholarship",
          type: "Full Tuition",
          degree: "Master",
          major: "Engineering",
          language: "English",
          universityId,
          intake: "Fall 2024",
          province: "Beijing",
          city: "Beijing",
          tuition: 50000,
          accommodation: 5000,
        },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/scholarships?degree=Master");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.scholarships.length).toBe(1);
      expect(body.scholarships[0].degree).toBe("Master");
    });

    it("should filter scholarships by language", async () => {
      await testPrisma.scholarship.create({
        data: {
          name: "English Scholarship",
          slug: "eng-scholarship",
          type: "Full Tuition",
          degree: "Master",
          major: "Engineering",
          language: "English",
          universityId,
          intake: "Fall 2024",
          province: "Beijing",
          city: "Beijing",
          tuition: 50000,
          accommodation: 5000,
        },
      });
      await testPrisma.scholarship.create({
        data: {
          name: "Chinese Scholarship",
          slug: "chi-scholarship",
          type: "Full Tuition",
          degree: "Master",
          major: "Engineering",
          language: "Chinese",
          universityId,
          intake: "Fall 2024",
          province: "Beijing",
          city: "Beijing",
          tuition: 45000,
          accommodation: 4500,
        },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/scholarships?language=Chinese");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.scholarships.length).toBe(1);
      expect(body.scholarships[0].language).toBe("Chinese");
    });

    it("should filter scholarships by major", async () => {
      await testPrisma.scholarship.create({
        data: {
          name: "Engineering Scholarship",
          slug: "eng-major",
          type: "Full Tuition",
          degree: "Master",
          major: "Software Engineering",
          language: "English",
          universityId,
          intake: "Fall 2024",
          province: "Beijing",
          city: "Beijing",
          tuition: 50000,
          accommodation: 5000,
        },
      });
      await testPrisma.scholarship.create({
        data: {
          name: "Business Scholarship",
          slug: "bus-major",
          type: "Full Tuition",
          degree: "Master",
          major: "Business Administration",
          language: "English",
          universityId,
          intake: "Fall 2024",
          province: "Beijing",
          city: "Beijing",
          tuition: 45000,
          accommodation: 4500,
        },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/scholarships?major=Software");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.scholarships.length).toBe(1);
      expect(body.scholarships[0].major).toContain("Software");
    });

    it("should filter scholarships by province", async () => {
      await testPrisma.scholarship.create({
        data: {
          name: "Beijing Scholarship",
          slug: "beijing-scholarship",
          type: "Full Tuition",
          degree: "Master",
          major: "Engineering",
          language: "English",
          universityId,
          intake: "Fall 2024",
          province: "Beijing",
          city: "Beijing",
          tuition: 50000,
          accommodation: 5000,
        },
      });
      await testPrisma.scholarship.create({
        data: {
          name: "Shanghai Scholarship",
          slug: "shanghai-scholarship",
          type: "Full Tuition",
          degree: "Master",
          major: "Engineering",
          language: "English",
          universityId,
          intake: "Fall 2024",
          province: "Shanghai",
          city: "Shanghai",
          tuition: 52000,
          accommodation: 5200,
        },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/scholarships?province=Beijing");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.scholarships.length).toBe(1);
      expect(body.scholarships[0].province).toBe("Beijing");
    });

    it("should filter scholarships by city", async () => {
      await testPrisma.scholarship.create({
        data: {
          name: "Beijing City Scholarship",
          slug: "beijing-city",
          type: "Full Tuition",
          degree: "Master",
          major: "Engineering",
          language: "English",
          universityId,
          intake: "Fall 2024",
          province: "Beijing",
          city: "Beijing",
          tuition: 50000,
          accommodation: 5000,
        },
      });
      await testPrisma.scholarship.create({
        data: {
          name: "Chaoyang Scholarship",
          slug: "chaoyang-scholarship",
          type: "Full Tuition",
          degree: "Master",
          major: "Engineering",
          language: "English",
          universityId,
          intake: "Fall 2024",
          province: "Beijing",
          city: "Chaoyang",
          tuition: 50000,
          accommodation: 5000,
        },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/scholarships?city=Chaoyang");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.scholarships.length).toBe(1);
      expect(body.scholarships[0].city).toBe("Chaoyang");
    });

    it("should search scholarships by name", async () => {
      await testPrisma.scholarship.create({
        data: {
          name: "Excellence Award Scholarship",
          slug: "excellence-award",
          type: "Full Tuition",
          degree: "Master",
          major: "Engineering",
          language: "English",
          universityId,
          intake: "Fall 2024",
          province: "Beijing",
          city: "Beijing",
          tuition: 60000,
          accommodation: 6000,
        },
      });
      await testPrisma.scholarship.create({
        data: {
          name: "Merit Scholarship",
          slug: "merit-scholarship",
          type: "Partial",
          degree: "Master",
          major: "Engineering",
          language: "English",
          universityId,
          intake: "Fall 2024",
          province: "Beijing",
          city: "Beijing",
          tuition: 30000,
          accommodation: 3000,
        },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/scholarships?search=Excellence");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.scholarships.length).toBe(1);
      expect(body.scholarships[0].name).toContain("Excellence");
    });

    it("should search case-insensitively", async () => {
      await testPrisma.scholarship.create({
        data: {
          name: "International Scholarship",
          slug: "intl-scholarship",
          type: "Full Tuition",
          degree: "Master",
          major: "Engineering",
          language: "English",
          universityId,
          intake: "Fall 2024",
          province: "Beijing",
          city: "Beijing",
          tuition: 55000,
          accommodation: 5500,
        },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/scholarships?search=international");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.scholarships.length).toBe(1);
      expect(body.scholarships[0].name.toLowerCase()).toContain("international");
    });

    it("should combine multiple filters", async () => {
      await testPrisma.scholarship.create({
        data: {
          name: "Beijing Master Full Engineering",
          slug: "beijing-master-full-eng",
          type: "Full Tuition",
          degree: "Master",
          major: "Software Engineering",
          language: "English",
          universityId,
          intake: "Fall 2024",
          province: "Beijing",
          city: "Beijing",
          tuition: 50000,
          accommodation: 5000,
        },
      });
      await testPrisma.scholarship.create({
        data: {
          name: "Shanghai Master Full Engineering",
          slug: "shanghai-master-full-eng",
          type: "Full Tuition",
          degree: "Master",
          major: "Software Engineering",
          language: "English",
          universityId,
          intake: "Fall 2024",
          province: "Shanghai",
          city: "Shanghai",
          tuition: 52000,
          accommodation: 5200,
        },
      });

      const req = makePublicRequest(
        "GET",
        "http://localhost/api/v1/public/scholarships?type=Full%20Tuition&degree=Master&province=Beijing&language=English",
      );
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.scholarships.length).toBe(1);
      expect(body.scholarships[0].province).toBe("Beijing");
      expect(body.scholarships[0].type).toBe("Full Tuition");
    });

    it("should return empty result when no matches found", async () => {
      await testPrisma.scholarship.create({
        data: {
          name: "Test Scholarship",
          slug: "test-scholarship",
          type: "Full Tuition",
          degree: "Master",
          major: "Engineering",
          language: "English",
          universityId,
          intake: "Fall 2024",
          province: "Beijing",
          city: "Beijing",
          tuition: 50000,
          accommodation: 5000,
        },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/scholarships?search=NonExistent");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.scholarships.length).toBe(0);
      expect(body.pagination.total).toBe(0);
    });

    it("should include university information in response", async () => {
      await testPrisma.scholarship.create({
        data: {
          name: "University Linked Scholarship",
          slug: "univ-linked",
          type: "Full Tuition",
          degree: "Master",
          major: "Engineering",
          language: "English",
          universityId,
          intake: "Fall 2024",
          province: "Beijing",
          city: "Beijing",
          tuition: 50000,
          accommodation: 5000,
        },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/scholarships");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.scholarships[0].university).toBeDefined();
      expect(body.scholarships[0].university.name).toBe("Test University");
      expect(body.scholarships[0].university.id).toBe(universityId);
    });
  });
});
