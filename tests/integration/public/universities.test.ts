import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, GET as GET_LIST } from "@/app/api/v1/public/universities/route";
import { GET as GET_DETAIL } from "@/app/api/v1/public/universities/[id]/route";
import { cleanDatabase, testPrisma } from "../../helpers/db";

function makePublicRequest(
  method: "GET" = "GET",
  url: string,
) {
  return new NextRequest(url, { method });
}

describe("Public Universities API", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe("GET /api/v1/public/universities", () => {
    it("should return empty list when no universities exist", async () => {
      const req = makePublicRequest("GET", "http://localhost/api/v1/public/universities");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.universities)).toBe(true);
      expect(body.universities.length).toBe(0);
      expect(body.pagination).toBeDefined();
      expect(body.pagination.page).toBe(1);
      expect(body.pagination.total).toBe(0);
      expect(body.pagination.totalPages).toBe(0);
    });

    it("should list universities with default pagination", async () => {
      for (let i = 0; i < 15; i++) {
        await testPrisma.university.create({
          data: {
            name: `University ${i}`,
            slug: `university-${i}`,
            province: "Province A",
            tags: ["engineering", "business"],
          },
        });
      }

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/universities");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.universities)).toBe(true);
      expect(body.universities.length).toBeLessThanOrEqual(12);
      expect(body.pagination.total).toBe(15);
      expect(body.pagination.totalPages).toBe(2);
    });

    it("should respect custom pagination parameters", async () => {
      for (let i = 0; i < 25; i++) {
        await testPrisma.university.create({
          data: {
            name: `University ${i}`,
            slug: `university-${i}`,
            tags: [],
          },
        });
      }

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/universities?page=2&limit=10");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.universities.length).toBeLessThanOrEqual(10);
      expect(body.pagination.page).toBe(2);
      expect(body.pagination.limit).toBe(10);
      expect(body.pagination.total).toBe(25);
      expect(body.pagination.totalPages).toBe(3);
    });

    it("should reject invalid pagination (page < 1)", async () => {
      const req = makePublicRequest("GET", "http://localhost/api/v1/public/universities?page=0&limit=10");
      const res = await GET_LIST(req);
      expect(res.status).toBe(400);
    });

    it("should reject invalid pagination (limit > 100)", async () => {
      const req = makePublicRequest("GET", "http://localhost/api/v1/public/universities?page=1&limit=101");
      const res = await GET_LIST(req);
      expect(res.status).toBe(400);
    });

    it("should reject invalid pagination (limit < 1)", async () => {
      const req = makePublicRequest("GET", "http://localhost/api/v1/public/universities?page=1&limit=0");
      const res = await GET_LIST(req);
      expect(res.status).toBe(400);
    });

    it("should filter universities by province", async () => {
      await testPrisma.university.create({
        data: { name: "Beijing University", slug: "beijing-univ", province: "Beijing", tags: [] },
      });
      await testPrisma.university.create({
        data: { name: "Shanghai University", slug: "shanghai-univ", province: "Shanghai", tags: [] },
      });
      await testPrisma.university.create({
        data: { name: "Another Beijing Univ", slug: "another-beijing", province: "Beijing", tags: [] },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/universities?province=Beijing");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      const allBeijing = body.universities.every((u: any) => u.province === "Beijing");
      expect(allBeijing).toBe(true);
      expect(body.universities.length).toBe(2);
    });

    it("should filter universities by tags", async () => {
      await testPrisma.university.create({
        data: {
          name: "Tech University",
          slug: "tech-univ",
          tags: ["engineering", "tech"],
        },
      });
      await testPrisma.university.create({
        data: {
          name: "Business University",
          slug: "biz-univ",
          tags: ["business", "finance"],
        },
      });
      await testPrisma.university.create({
        data: {
          name: "Engineering Plus",
          slug: "eng-plus",
          tags: ["engineering", "research"],
        },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/universities?tags=engineering");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      const hasEngineering = body.universities.every((u: any) =>
        u.tags && u.tags.includes("engineering"),
      );
      expect(hasEngineering).toBe(true);
      expect(body.universities.length).toBe(2);
    });

    it("should filter universities by search term", async () => {
      await testPrisma.university.create({
        data: { name: "Tsinghua University", slug: "tsinghua", tags: [] },
      });
      await testPrisma.university.create({
        data: { name: "Beijing Normal University", slug: "beijing-normal", tags: [] },
      });
      await testPrisma.university.create({
        data: { name: "Harvard University", slug: "harvard", tags: [] },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/universities?search=Beijing");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.universities.length).toBe(1);
      expect(body.universities[0].name).toContain("Beijing");
    });

    it("should search case-insensitively", async () => {
      await testPrisma.university.create({
        data: { name: "Oxford University", slug: "oxford", tags: [] },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/universities?search=oxford");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.universities.length).toBe(1);
      expect(body.universities[0].name.toLowerCase()).toContain("oxford");
    });

    it("should combine multiple filters", async () => {
      await testPrisma.university.create({
        data: {
          name: "Tech Beijing University",
          slug: "tech-beijing",
          province: "Beijing",
          tags: ["engineering"],
        },
      });
      await testPrisma.university.create({
        data: {
          name: "Business Beijing University",
          slug: "biz-beijing",
          province: "Beijing",
          tags: ["business"],
        },
      });
      await testPrisma.university.create({
        data: {
          name: "Tech Shanghai University",
          slug: "tech-shanghai",
          province: "Shanghai",
          tags: ["engineering"],
        },
      });

      const req = makePublicRequest(
        "GET",
        "http://localhost/api/v1/public/universities?province=Beijing&tags=engineering",
      );
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.universities.length).toBe(1);
      expect(body.universities[0].name).toContain("Tech");
    });

    it("should return empty result when no matches found", async () => {
      await testPrisma.university.create({
        data: { name: "Test University", slug: "test-univ", tags: [] },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/universities?search=NonExistent");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.universities.length).toBe(0);
      expect(body.pagination.total).toBe(0);
    });
  });

  describe("GET /api/v1/public/universities/:id", () => {
    it("should return university detail", async () => {
      const university = await testPrisma.university.create({
        data: {
          name: "Detail Test University",
          slug: "detail-test",
          worldRank: 50,
          location: "Beijing",
          studentCount: 10000,
          tags: ["research"],
        },
      });

      const req = makePublicRequest("GET", `http://localhost/api/v1/public/universities/${university.id}`);
      const res = await GET_DETAIL(req, { params: { id: university.id } });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.university).toBeDefined();
      expect(body.university.id).toBe(university.id);
      expect(body.university.name).toBe("Detail Test University");
      expect(body.university.worldRank).toBe(50);
      expect(body.university.studentCount).toBe(10000);
    });

    it("should return 404 for non-existent university", async () => {
      const req = makePublicRequest("GET", "http://localhost/api/v1/public/universities/non-existent-id");
      const res = await GET_DETAIL(req, { params: { id: "non-existent-id" } });
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    it("should include all university fields", async () => {
      const university = await testPrisma.university.create({
        data: {
          name: "Full Detail University",
          slug: "full-detail",
          logo: "https://example.com/logo.png",
          banner: "https://example.com/banner.jpg",
          worldRank: 100,
          location: "Shanghai",
          studentCount: 5000,
          tags: ["business", "engineering"],
          intake: "Fall 2024",
          deadline: new Date("2024-05-31"),
          province: "Shanghai",
        },
      });

      const req = makePublicRequest("GET", `http://localhost/api/v1/public/universities/${university.id}`);
      const res = await GET_DETAIL(req, { params: { id: university.id } });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.university.slug).toBe("full-detail");
      expect(body.university.logo).toBe("https://example.com/logo.png");
      expect(body.university.banner).toBe("https://example.com/banner.jpg");
      expect(body.university.location).toBe("Shanghai");
      expect(body.university.tags).toContain("business");
      expect(body.university.intake).toBe("Fall 2024");
      expect(body.university.province).toBe("Shanghai");
    });
  });
});
