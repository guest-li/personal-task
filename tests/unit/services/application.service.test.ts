import { describe, it, expect, beforeEach } from "vitest";
import {
  createApplication,
  listApplications,
  cancelApplication,
  getDashboardStats,
} from "@/server/services/application.service";
import { cleanDatabase, testPrisma } from "../../helpers/db";
import { createTestUser } from "../../helpers/auth";

describe("application.service", () => {
  let userId: string;

  beforeEach(async () => {
    await cleanDatabase();
    const user = await createTestUser({ email: "app@test.com" });
    userId = user.id;
  });

  it("creates an application with auto-generated code", async () => {
    const app = await createApplication({
      userId,
      programName: "CS Masters",
      universityName: "Beijing University",
      degree: "Master",
      language: "English",
      fundType: "self_funded",
    });

    expect(app.id).toBeDefined();
    expect(app.applicationCode).toMatch(/^APP-\d{8}-\d{3}$/);
    expect(app.status).toBe("pending");
    expect(app.programName).toBe("CS Masters");
  });

  it("generates sequential codes on the same day", async () => {
    const app1 = await createApplication({
      userId,
      programName: "Program A",
      universityName: "Uni A",
    });
    const app2 = await createApplication({
      userId,
      programName: "Program B",
      universityName: "Uni B",
    });

    const code1Num = parseInt(app1.applicationCode.split("-")[2]);
    const code2Num = parseInt(app2.applicationCode.split("-")[2]);
    expect(code2Num).toBe(code1Num + 1);
  });

  it("lists applications with pagination", async () => {
    for (let i = 0; i < 15; i++) {
      await createApplication({
        userId,
        programName: `Program ${i}`,
        universityName: `Uni ${i}`,
      });
    }

    const result = await listApplications(userId, { page: 1, limit: 10 });
    expect(result.applications.length).toBe(10);
    expect(result.pagination.total).toBe(15);
    expect(result.pagination.totalPages).toBe(2);

    const page2 = await listApplications(userId, { page: 2, limit: 10 });
    expect(page2.applications.length).toBe(5);
  });

  it("filters applications by status", async () => {
    const app = await createApplication({
      userId,
      programName: "Approved One",
      universityName: "Uni",
    });
    await testPrisma.application.update({
      where: { id: app.id },
      data: { status: "approved" },
    });
    await createApplication({
      userId,
      programName: "Pending One",
      universityName: "Uni",
    });

    const result = await listApplications(userId, {
      page: 1,
      limit: 10,
      status: "approved",
    });
    expect(result.applications.length).toBe(1);
    expect(result.applications[0].programName).toBe("Approved One");
  });

  it("cancels a pending application", async () => {
    const app = await createApplication({
      userId,
      programName: "To Cancel",
      universityName: "Uni",
    });

    const cancelled = await cancelApplication(app.id, userId);
    expect(cancelled.status).toBe("cancelled");
  });

  it("throws when cancelling non-pending application", async () => {
    const app = await createApplication({
      userId,
      programName: "Approved",
      universityName: "Uni",
    });
    await testPrisma.application.update({
      where: { id: app.id },
      data: { status: "approved" },
    });

    await expect(cancelApplication(app.id, userId)).rejects.toThrow();
  });

  it("returns dashboard stats", async () => {
    await createApplication({
      userId,
      programName: "P1",
      universityName: "U1",
    });
    await testPrisma.application.updateMany({
      data: {
        applicationFee: 1000,
        applicationFeePaid: 500,
        serviceCharge: 800,
        serviceChargePaid: 300,
      },
    });

    const stats = await getDashboardStats(userId);
    expect(stats.totalApplications).toBe(1);
    expect(Number(stats.applicationFeesPaid)).toBe(500);
    expect(Number(stats.serviceCharge)).toBe(800);
    expect(Number(stats.serviceChargePaid)).toBe(300);
  });
});
