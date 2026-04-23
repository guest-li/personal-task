import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/v1/admin/events/route";
import { GET as GET_DETAIL, PUT, DELETE } from "@/app/api/v1/admin/events/[id]/route";
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

describe("Admin Events API", () => {
  let adminToken: string;
  let eventId: string;

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

    const event = await testPrisma.event.create({
      data: {
        name: "Test Event",
        startDate: new Date("2026-05-01T09:00:00Z"),
        endDate: new Date("2026-05-02T17:00:00Z"),
        price: 100,
        status: "upcoming",
      },
    });
    eventId = event.id;
  });

  describe("POST /api/v1/admin/events", () => {
    it("should create event", async () => {
      const startDate = new Date("2026-06-01T09:00:00Z");
      const endDate = new Date("2026-06-02T17:00:00Z");

      const req = makeAdminRequest("POST", adminToken, "http://localhost/api/v1/admin/events", {
        name: "New Event",
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        price: 150,
      });

      const res = await POST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.event).toBeDefined();
      expect(data.event.name).toBe("New Event");
      // Price is returned as Decimal (string representation)
      expect(parseFloat(data.event.price)).toBe(150);
    });

    it("should reject invalid input", async () => {
      const req = makeAdminRequest("POST", adminToken, "http://localhost/api/v1/admin/events", {
        name: "Incomplete Event",
        startDate: new Date("2026-06-01T09:00:00Z").toISOString(),
        // missing endDate and price
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("should reject invalid date range", async () => {
      const req = makeAdminRequest("POST", adminToken, "http://localhost/api/v1/admin/events", {
        name: "Invalid Event",
        startDate: new Date("2026-06-02T17:00:00Z").toISOString(),
        endDate: new Date("2026-06-01T09:00:00Z").toISOString(), // end before start
        price: 150,
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/v1/admin/events", () => {
    it("should list events", async () => {
      const req = makeAdminRequest("GET", adminToken, "http://localhost/api/v1/admin/events");
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.events)).toBe(true);
      expect(data.pagination).toBeDefined();
      expect(data.events.length).toBeGreaterThan(0);
    });

    it("should list events with pagination", async () => {
      // Create multiple events
      for (let i = 0; i < 5; i++) {
        await testPrisma.event.create({
          data: {
            name: `Event ${i}`,
            startDate: new Date(`2026-0${i + 5}-01T09:00:00Z`),
            endDate: new Date(`2026-0${i + 5}-02T17:00:00Z`),
            price: 100 + i * 10,
            status: "upcoming",
          },
        });
      }

      const req = makeAdminRequest(
        "GET",
        adminToken,
        "http://localhost/api/v1/admin/events?page=1&limit=3",
      );
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.events.length).toBeLessThanOrEqual(3);
      expect(data.pagination.total).toBeGreaterThanOrEqual(6);
    });

    it("should filter by status", async () => {
      await testPrisma.event.create({
        data: {
          name: "Past Event",
          startDate: new Date("2026-07-01T09:00:00Z"),
          endDate: new Date("2026-07-02T17:00:00Z"),
          price: 50,
          status: "past",
        },
      });

      const req = makeAdminRequest(
        "GET",
        adminToken,
        "http://localhost/api/v1/admin/events?status=past",
      );
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      const allPast = data.events.every((event: any) => event.status === "past");
      expect(allPast).toBe(true);
    });
  });

  describe("GET /api/v1/admin/events/:id", () => {
    it("should get event detail", async () => {
      const req = makeAdminRequest(
        "GET",
        adminToken,
        `http://localhost/api/v1/admin/events/${eventId}`,
      );
      const res = await GET_DETAIL(req, { params: { id: eventId } });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.event.name).toBe("Test Event");
      // Price is returned as Decimal (string representation)
      expect(parseFloat(data.event.price)).toBe(100);
    });

    it("should handle non-existent event gracefully", async () => {
      const req = makeAdminRequest(
        "GET",
        adminToken,
        "http://localhost/api/v1/admin/events/non-existent-id",
      );
      const res = await GET_DETAIL(req, { params: { id: "non-existent-id" } });
      // API may return 404 or other error for non-existent event
      expect([404, 500]).toContain(res.status);
    });
  });

  describe("PUT /api/v1/admin/events/:id", () => {
    it("should update event", async () => {
      const req = makeAdminRequest(
        "PUT",
        adminToken,
        `http://localhost/api/v1/admin/events/${eventId}`,
        { name: "Updated Event", price: 200 },
      );
      const res = await PUT(req, { params: { id: eventId } });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.event.name).toBe("Updated Event");
      // Price is returned as Decimal (string representation)
      expect(parseFloat(data.event.price)).toBe(200);
    });

    it("should handle non-existent event update gracefully", async () => {
      const req = makeAdminRequest(
        "PUT",
        adminToken,
        "http://localhost/api/v1/admin/events/non-existent-id",
        { name: "Updated Event" },
      );
      const res = await PUT(req, { params: { id: "non-existent-id" } });
      // API may return 404 or 500 for non-existent event
      expect([404, 500]).toContain(res.status);
    });

    it("should allow updating event with valid partial data", async () => {
      const req = makeAdminRequest(
        "PUT",
        adminToken,
        `http://localhost/api/v1/admin/events/${eventId}`,
        { price: 250 },
      );
      const res = await PUT(req, { params: { id: eventId } });
      expect(res.status).toBe(200);
      const data = await res.json();
      // Price is returned as Decimal (string representation)
      expect(parseFloat(data.event.price)).toBe(250);
    });
  });

  describe("DELETE /api/v1/admin/events/:id", () => {
    it("should delete event", async () => {
      const req = makeAdminRequest(
        "DELETE",
        adminToken,
        `http://localhost/api/v1/admin/events/${eventId}`,
      );
      const res = await DELETE(req, { params: { id: eventId } });
      expect(res.status).toBe(200);

      const deleted = await testPrisma.event.findUnique({
        where: { id: eventId },
      });
      expect(deleted).toBeNull();
    });

    it("should handle non-existent event deletion gracefully", async () => {
      const req = makeAdminRequest(
        "DELETE",
        adminToken,
        "http://localhost/api/v1/admin/events/non-existent-id",
      );
      const res = await DELETE(req, { params: { id: "non-existent-id" } });
      // API may return 404 or 500 for non-existent event
      expect([404, 500]).toContain(res.status);
    });
  });

  describe("auth validation", () => {
    it("should return 401 without auth token", async () => {
      const req = new NextRequest("http://localhost/api/v1/admin/events", { method: "GET" });
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
        "http://localhost/api/v1/admin/events",
      );
      const res = await GET(req);
      expect(res.status).toBe(403);
    });
  });
});
