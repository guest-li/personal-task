import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/v1/notifications/route";
import { PATCH } from "@/app/api/v1/notifications/read/route";
import { signAccessToken } from "@/server/auth/jwt";
import { AUTH_COOKIE } from "@/server/auth/constants";
import { cleanDatabase, testPrisma } from "../../helpers/db";
import { createTestUser } from "../../helpers/auth";

describe("Notifications API", () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    await cleanDatabase();
    const user = await createTestUser({ email: "notif@test.com" });
    userId = user.id;
    token = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  });

  describe("GET /api/v1/notifications", () => {
    it("lists notifications with pagination", async () => {
      for (let i = 0; i < 5; i++) {
        await testPrisma.notification.create({
          data: { userId, title: `N${i}`, message: `M${i}` },
        });
      }

      const req = new NextRequest("http://localhost/api/v1/notifications?page=1&limit=3");
      req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);

      const res = await GET(req, { params: {} });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.notifications.length).toBe(3);
      expect(body.pagination.total).toBe(5);
      expect(body.unreadCount).toBe(5);
    });
  });

  describe("PATCH /api/v1/notifications/read", () => {
    it("marks a single notification as read", async () => {
      const n = await testPrisma.notification.create({
        data: { userId, title: "Read me", message: "msg" },
      });

      const req = new NextRequest("http://localhost/api/v1/notifications/read", {
        method: "PATCH",
        body: JSON.stringify({ notificationId: n.id }),
        headers: { "Content-Type": "application/json" },
      });
      req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);

      const res = await PATCH(req, { params: {} });
      expect(res.status).toBe(200);

      const updated = await testPrisma.notification.findUnique({ where: { id: n.id } });
      expect(updated!.isRead).toBe(true);
    });

    it("marks all notifications as read", async () => {
      await testPrisma.notification.create({ data: { userId, title: "N1", message: "m1" } });
      await testPrisma.notification.create({ data: { userId, title: "N2", message: "m2" } });

      const req = new NextRequest("http://localhost/api/v1/notifications/read", {
        method: "PATCH",
        body: JSON.stringify({ all: true }),
        headers: { "Content-Type": "application/json" },
      });
      req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);

      const res = await PATCH(req, { params: {} });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.markedCount).toBe(2);
    });
  });

  it("returns 401 without auth", async () => {
    const req = new NextRequest("http://localhost/api/v1/notifications");
    const res = await GET(req, { params: {} });
    expect(res.status).toBe(401);
  });
});
