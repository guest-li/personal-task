import { describe, it, expect, beforeEach } from "vitest";
import {
  getFullProfile,
  updateProfile,
  changePassword,
} from "@/server/services/profile.service";
import { cleanDatabase, testPrisma } from "../../helpers/db";
import { createTestUser } from "../../helpers/auth";
import { hashPassword, comparePassword } from "@/server/auth/password";

describe("profile.service", () => {
  let userId: string;

  beforeEach(async () => {
    await cleanDatabase();
    const hash = await hashPassword("oldpass123");
    const user = await createTestUser({
      email: "profile@test.com",
      passwordHash: hash,
    });
    userId = user.id;
  });

  it("gets full profile with student profile data", async () => {
    const profile = await getFullProfile(userId);
    expect(profile).not.toBeNull();
    expect(profile!.email).toBe("profile@test.com");
  });

  it("updates user and student profile fields", async () => {
    const updated = await updateProfile(userId, {
      name: "Updated Name",
      phone: "+1234567890",
      gender: "male",
      bio: "Hello world",
      passportNid: "AB123456",
      qualification: "bachelor",
      interestedMajor: "Computer Science",
      language: "English",
      address: "123 Main St",
    });

    expect(updated.name).toBe("Updated Name");
    expect(updated.phone).toBe("+1234567890");

    const sp = await testPrisma.studentProfile.findUnique({
      where: { userId },
    });
    expect(sp).not.toBeNull();
    expect(sp!.bio).toBe("Hello world");
    expect(sp!.passportNid).toBe("AB123456");
  });

  it("changes password successfully", async () => {
    await changePassword(userId, "oldpass123", "newpass456");

    const user = await testPrisma.user.findUnique({ where: { id: userId } });
    const valid = await comparePassword("newpass456", user!.passwordHash!);
    expect(valid).toBe(true);
  });

  it("rejects password change with wrong current password", async () => {
    await expect(
      changePassword(userId, "wrongpass", "newpass456"),
    ).rejects.toThrow("Current password is incorrect");
  });
});
