import { describe, it, expect, beforeEach } from "vitest";
import {
  createNotification,
  listNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from "@/server/services/notification.service";
import { cleanDatabase } from "../../helpers/db";
import { createTestUser } from "../../helpers/auth";

describe("notification.service", () => {
  let userId: string;

  beforeEach(async () => {
    await cleanDatabase();
    const user = await createTestUser({ email: "notif@test.com" });
    userId = user.id;
  });

  it("creates a notification", async () => {
    const n = await createNotification({
      userId,
      title: "Welcome",
      message: "Welcome to the platform!",
    });
    expect(n.id).toBeDefined();
    expect(n.title).toBe("Welcome");
    expect(n.isRead).toBe(false);
  });

  it("lists notifications with pagination", async () => {
    for (let i = 0; i < 5; i++) {
      await createNotification({ userId, title: `N${i}`, message: `Msg ${i}` });
    }
    const result = await listNotifications(userId, { page: 1, limit: 3 });
    expect(result.notifications.length).toBe(3);
    expect(result.pagination.total).toBe(5);
  });

  it("marks a single notification as read", async () => {
    const n = await createNotification({ userId, title: "Read me", message: "msg" });
    expect(n.isRead).toBe(false);
    const updated = await markAsRead(n.id, userId);
    expect(updated.isRead).toBe(true);
  });

  it("marks all notifications as read", async () => {
    await createNotification({ userId, title: "N1", message: "m1" });
    await createNotification({ userId, title: "N2", message: "m2" });
    const count = await markAllAsRead(userId);
    expect(count).toBe(2);
  });

  it("returns unread count", async () => {
    await createNotification({ userId, title: "N1", message: "m1" });
    await createNotification({ userId, title: "N2", message: "m2" });
    const n3 = await createNotification({ userId, title: "N3", message: "m3" });
    await markAsRead(n3.id, userId);
    const count = await getUnreadCount(userId);
    expect(count).toBe(2);
  });
});
