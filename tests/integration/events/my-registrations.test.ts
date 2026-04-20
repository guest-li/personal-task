import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/v1/events/my-registrations/route";
import { signAccessToken } from "@/server/auth/jwt";
import { AUTH_COOKIE } from "@/server/auth/constants";
import { cleanDatabase, testPrisma } from "../../helpers/db";
import { createTestUser } from "../../helpers/auth";

describe("GET /api/v1/events/my-registrations", () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    await cleanDatabase();
    const user = await createTestUser({ email: "events@test.com" });
    userId = user.id;
    token = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  });

  it("lists event registrations with event details", async () => {
    const event = await testPrisma.event.create({
      data: {
        name: "Tech Conference",
        startDate: new Date("2026-06-01"),
        endDate: new Date("2026-06-03"),
        price: 50,
        category: "conference",
      },
    });
    await testPrisma.eventRegistration.create({
      data: { userId, eventId: event.id, paymentStatus: "paid" },
    });

    const req = new NextRequest("http://localhost/api/v1/events/my-registrations?page=1&limit=10");
    req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);

    const res = await GET(req, { params: {} });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.registrations.length).toBe(1);
    expect(body.registrations[0].event.name).toBe("Tech Conference");
    expect(body.registrations[0].paymentStatus).toBe("paid");
    expect(body.pagination.total).toBe(1);
  });

  it("returns empty list for no registrations", async () => {
    const req = new NextRequest("http://localhost/api/v1/events/my-registrations");
    req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);

    const res = await GET(req, { params: {} });
    const body = await res.json();
    expect(body.registrations.length).toBe(0);
    expect(body.pagination.total).toBe(0);
  });

  it("returns 401 without auth", async () => {
    const req = new NextRequest("http://localhost/api/v1/events/my-registrations");
    const res = await GET(req, { params: {} });
    expect(res.status).toBe(401);
  });
});
