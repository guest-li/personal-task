import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/v1/users/dashboard-stats/route";
import { signAccessToken } from "@/server/auth/jwt";
import { AUTH_COOKIE } from "@/server/auth/constants";
import { cleanDatabase, testPrisma } from "../../helpers/db";
import { createTestUser } from "../../helpers/auth";

function makeAuthRequest(token: string) {
  const req = new NextRequest("http://localhost/api/v1/users/dashboard-stats");
  req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);
  return req;
}

describe("GET /api/v1/users/dashboard-stats", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it("returns stats for student with no applications", async () => {
    const user = await createTestUser({ email: "stat@test.com" });
    const token = signAccessToken({ sub: user.id, email: user.email, role: user.role });

    const res = await GET(makeAuthRequest(token), { params: {} });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.stats.totalApplications).toBe(0);
    expect(body.stats.applicationFeesPaid).toBe(0);
    expect(body.charts.applicationHistory).toBeDefined();
  });

  it("returns stats with application data", async () => {
    const user = await createTestUser({ email: "stat2@test.com" });
    await testPrisma.application.create({
      data: {
        applicationCode: "APP-20260420-001",
        userId: user.id,
        programName: "CS",
        universityName: "MIT",
        applicationFee: 1000,
        applicationFeePaid: 500,
        serviceCharge: 800,
        serviceChargePaid: 300,
      },
    });

    const token = signAccessToken({ sub: user.id, email: user.email, role: user.role });
    const res = await GET(makeAuthRequest(token), { params: {} });
    const body = await res.json();

    expect(body.stats.totalApplications).toBe(1);
    expect(body.stats.applicationFeesPaid).toBe(500);
    expect(body.stats.serviceCharge).toBe(800);
  });

  it("includes partnerLevel for partner users", async () => {
    const user = await createTestUser({ email: "partner@test.com", role: "partner" });
    await testPrisma.partnerProfile.create({
      data: { userId: user.id, level: "beginner" },
    });

    const token = signAccessToken({ sub: user.id, email: user.email, role: "partner" });
    const res = await GET(makeAuthRequest(token), { params: {} });
    const body = await res.json();

    expect(body.stats.partnerLevel).toBe("beginner");
  });

  it("returns 401 without auth", async () => {
    const req = new NextRequest("http://localhost/api/v1/users/dashboard-stats");
    const res = await GET(req, { params: {} });
    expect(res.status).toBe(401);
  });
});
