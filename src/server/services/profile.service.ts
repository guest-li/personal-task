import { prisma } from "@/server/db";
import { hashPassword, comparePassword } from "@/server/auth/password";
import type { Gender, Qualification } from "@prisma/client";

interface UpdateProfileInput {
  name?: string;
  phone?: string;
  gender?: Gender;
  country?: string;
  avatar?: string;
  bio?: string;
  passportNid?: string;
  qualification?: Qualification;
  interestedMajor?: string;
  lastAcademicResult?: string;
  experience?: string;
  language?: string;
  address?: string;
}

export async function getFullProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: true,
      partnerProfile: true,
      certificates: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const userFields: Record<string, unknown> = {};
  if (input.name !== undefined) userFields.name = input.name;
  if (input.phone !== undefined) userFields.phone = input.phone;
  if (input.gender !== undefined) userFields.gender = input.gender;
  if (input.country !== undefined) userFields.country = input.country;
  if (input.avatar !== undefined) userFields.avatar = input.avatar;

  const profileFields: Record<string, unknown> = {};
  if (input.bio !== undefined) profileFields.bio = input.bio;
  if (input.passportNid !== undefined) profileFields.passportNid = input.passportNid;
  if (input.qualification !== undefined) profileFields.qualification = input.qualification;
  if (input.interestedMajor !== undefined) profileFields.interestedMajor = input.interestedMajor;
  if (input.lastAcademicResult !== undefined) profileFields.lastAcademicResult = input.lastAcademicResult;
  if (input.experience !== undefined) profileFields.experience = input.experience;
  if (input.language !== undefined) profileFields.language = input.language;
  if (input.address !== undefined) profileFields.address = input.address;

  const user = await prisma.user.update({
    where: { id: userId },
    data: userFields,
  });

  if (Object.keys(profileFields).length > 0) {
    await prisma.studentProfile.upsert({
      where: { userId },
      create: { userId, ...profileFields },
      update: profileFields,
    });
  }

  return user;
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.passwordHash) {
    throw new Error("User not found");
  }

  const valid = await comparePassword(currentPassword, user.passwordHash);
  if (!valid) {
    throw new Error("Current password is incorrect");
  }

  const newHash = await hashPassword(newPassword);
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });
}
