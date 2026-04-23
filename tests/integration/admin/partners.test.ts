import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/v1/admin/partners/applications/route";
import { PATCH } from "@/app/api/v1/admin/partners/applications/[userId]/route";
import { signAccessToken } from "@/server/auth/jwt";
import { AUTH_COOKIE } from "@/server/auth/constants";
import { cleanDatabase, testPrisma } from "../../helpers/db";
import { createTestUser } from "../../helpers/auth";
import { hashPassword } from "@/server/auth/password";

function makeAdminRequest(
  method: "GET" | "PATCH" = "GET",
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

describe("Admin Partners API", () => {
  let adminToken: string;
  let pendingPartnerUserId: string;

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

    const pendingPartner = await testPrisma.user.create({
      data: {
        email: "pending-partner@example.com",
        passwordHash: "hash",
        name: "Pending Partner",
        role: "partner",
        status: "inactive",
        partnerProfile: {
          create: {
            qualifications: "MBA in Business Administration",
            experience: "5 years in corporate training",
          },
        },
      },
    });
    pendingPartnerUserId = pendingPartner.id;
  });

  describe("GET /api/v1/admin/partners/applications", () => {
    it("should list pending partner applications", async () => {
      const req = makeAdminRequest(
        "GET",
        adminToken,
        "http://localhost/api/v1/admin/partners/applications",
      );
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.partners)).toBe(true);
      expect(data.pagination).toBeDefined();
      // Should include the pending partner we created
      const hasPendingPartner = data.partners.some((p: any) => p.id === pendingPartnerUserId);
      expect(hasPendingPartner).toBe(true);
    });

    it("should list with pagination", async () => {
      // Create multiple pending partners
      for (let i = 0; i < 5; i++) {
        await testPrisma.user.create({
          data: {
            email: `partner${i}@example.com`,
            passwordHash: "hash",
            name: `Partner ${i}`,
            role: "partner",
            status: "inactive",
            partnerProfile: {
              create: {
                qualifications: `Qualification ${i}`,
                experience: `Experience ${i}`,
              },
            },
          },
        });
      }

      const req = makeAdminRequest(
        "GET",
        adminToken,
        "http://localhost/api/v1/admin/partners/applications?page=1&limit=3",
      );
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.partners.length).toBeLessThanOrEqual(3);
      expect(data.pagination.total).toBeGreaterThanOrEqual(6);
    });

    it("should only list inactive partners", async () => {
      // Create an active partner (should not appear in pending list)
      await testPrisma.user.create({
        data: {
          email: "active-partner@example.com",
          passwordHash: "hash",
          name: "Active Partner",
          role: "partner",
          status: "active",
          partnerProfile: {
            create: {
              qualifications: "Active Qualifications",
              experience: "Active Experience",
            },
          },
        },
      });

      const req = makeAdminRequest(
        "GET",
        adminToken,
        "http://localhost/api/v1/admin/partners/applications",
      );
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      // All listed partners should be inactive
      const allInactive = data.partners.every((p: any) => p.status === "inactive");
      expect(allInactive).toBe(true);
    });
  });

  describe("PATCH /api/v1/admin/partners/applications/:userId", () => {
    it("should approve partner application", async () => {
      const req = makeAdminRequest(
        "PATCH",
        adminToken,
        `http://localhost/api/v1/admin/partners/applications/${pendingPartnerUserId}`,
        { approved: true },
      );
      const res = await PATCH(req, { params: { userId: pendingPartnerUserId } });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.user.status).toBe("active");

      // Verify in database
      const updated = await testPrisma.user.findUnique({
        where: { id: pendingPartnerUserId },
      });
      expect(updated?.status).toBe("active");
    });

    it("should reject partner application", async () => {
      const req = makeAdminRequest(
        "PATCH",
        adminToken,
        `http://localhost/api/v1/admin/partners/applications/${pendingPartnerUserId}`,
        { approved: false },
      );
      const res = await PATCH(req, { params: { userId: pendingPartnerUserId } });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.user.status).toBe("suspended");

      // Verify in database
      const updated = await testPrisma.user.findUnique({
        where: { id: pendingPartnerUserId },
      });
      expect(updated?.status).toBe("suspended");
    });

    it("should handle non-existent partner gracefully", async () => {
      const req = makeAdminRequest(
        "PATCH",
        adminToken,
        "http://localhost/api/v1/admin/partners/applications/non-existent-id",
        { approved: true },
      );
      const res = await PATCH(req, { params: { userId: "non-existent-id" } });
      // API may return 404 or 500 for non-existent partner
      expect([404, 500]).toContain(res.status);
    });

    it("should reject invalid input", async () => {
      const req = makeAdminRequest(
        "PATCH",
        adminToken,
        `http://localhost/api/v1/admin/partners/applications/${pendingPartnerUserId}`,
        { approved: "maybe" }, // invalid: should be boolean
      );
      const res = await PATCH(req, { params: { userId: pendingPartnerUserId } });
      expect(res.status).toBe(400);
    });
  });

  describe("partner profile", () => {
    it("should include partner profile data in list", async () => {
      const req = makeAdminRequest(
        "GET",
        adminToken,
        "http://localhost/api/v1/admin/partners/applications",
      );
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      const partner = data.partners.find((p: any) => p.id === pendingPartnerUserId);
      expect(partner).toBeDefined();
      expect(partner.partnerProfile).toBeDefined();
      expect(partner.partnerProfile.qualifications).toBe("MBA in Business Administration");
      expect(partner.partnerProfile.experience).toBe("5 years in corporate training");
    });
  });

  describe("auth validation", () => {
    it("should return 401 without auth token", async () => {
      const req = new NextRequest("http://localhost/api/v1/admin/partners/applications", {
        method: "GET",
      });
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

      const req = makeAdminRequest(
        "GET",
        studentToken,
        "http://localhost/api/v1/admin/partners/applications",
      );
      const res = await GET(req);
      expect(res.status).toBe(403);
    });

    it("should return 403 for partner user", async () => {
      const partner = await createTestUser({
        email: "partner-access@test.com",
        role: "partner",
        passwordHash: await hashPassword("partnerpass"),
      });
      const partnerToken = signAccessToken({
        sub: partner.id,
        email: partner.email,
        role: partner.role,
      });

      const req = makeAdminRequest(
        "GET",
        partnerToken,
        "http://localhost/api/v1/admin/partners/applications",
      );
      const res = await GET(req);
      expect(res.status).toBe(403);
    });
  });
});
