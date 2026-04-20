import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/v1/applications/route";
import { PATCH } from "@/app/api/v1/applications/[id]/route";
import { signAccessToken } from "@/server/auth/jwt";
import { AUTH_COOKIE } from "@/server/auth/constants";
import { cleanDatabase, testPrisma } from "../../helpers/db";
import { createTestUser } from "../../helpers/auth";

function makeAuthGet(token: string, query = "") {
  const req = new NextRequest(`http://localhost/api/v1/applications${query}`);
  req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);
  return req;
}

function makeAuthPost(token: string, body: Record<string, unknown>) {
  const req = new NextRequest("http://localhost/api/v1/applications", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
  req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);
  return req;
}

describe("Applications API", () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    await cleanDatabase();
    const user = await createTestUser({ email: "apps@test.com" });
    userId = user.id;
    token = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  });

  describe("POST /api/v1/applications", () => {
    it("creates an application", async () => {
      const res = await POST(makeAuthPost(token, {
        programName: "Computer Science",
        universityName: "Beijing University",
        degree: "Master",
        language: "English",
      }));

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.application.applicationCode).toMatch(/^APP-/);
      expect(body.application.status).toBe("pending");
    });

    it("returns 400 for missing required fields", async () => {
      const res = await POST(makeAuthPost(token, { programName: "Test" }));
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/v1/applications", () => {
    it("lists applications with pagination", async () => {
      for (let i = 0; i < 3; i++) {
        await testPrisma.application.create({
          data: {
            applicationCode: `APP-20260420-00${i + 1}`,
            userId,
            programName: `Program ${i}`,
            universityName: `Uni ${i}`,
          },
        });
      }

      const res = await GET(makeAuthGet(token, "?page=1&limit=2"));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.applications.length).toBe(2);
      expect(body.pagination.total).toBe(3);
    });

    it("filters by status", async () => {
      await testPrisma.application.create({
        data: {
          applicationCode: "APP-20260420-010",
          userId,
          programName: "Approved",
          universityName: "Uni",
          status: "approved",
        },
      });
      await testPrisma.application.create({
        data: {
          applicationCode: "APP-20260420-011",
          userId,
          programName: "Pending",
          universityName: "Uni",
        },
      });

      const res = await GET(makeAuthGet(token, "?status=approved"));
      const body = await res.json();
      expect(body.applications.length).toBe(1);
      expect(body.applications[0].programName).toBe("Approved");
    });
  });

  describe("PATCH /api/v1/applications/:id", () => {
    it("cancels a pending application", async () => {
      const app = await testPrisma.application.create({
        data: {
          applicationCode: "APP-20260420-020",
          userId,
          programName: "Cancel Me",
          universityName: "Uni",
        },
      });

      const req = new NextRequest(`http://localhost/api/v1/applications/${app.id}`, {
        method: "PATCH",
      });
      req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);

      const res = await PATCH(req, { params: { id: app.id } });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.application.status).toBe("cancelled");
    });

    it("returns 400 when cancelling non-pending application", async () => {
      const app = await testPrisma.application.create({
        data: {
          applicationCode: "APP-20260420-021",
          userId,
          programName: "Already Approved",
          universityName: "Uni",
          status: "approved",
        },
      });

      const req = new NextRequest(`http://localhost/api/v1/applications/${app.id}`, {
        method: "PATCH",
      });
      req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);

      const res = await PATCH(req, { params: { id: app.id } });
      expect(res.status).toBe(400);
    });
  });

  it("returns 401 without auth", async () => {
    const req = new NextRequest("http://localhost/api/v1/applications");
    const res = await GET(req, { params: {} });
    expect(res.status).toBe(401);
  });
});
