import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  country: z.string().optional(),
  bio: z.string().optional(),
  passportNid: z.string().optional(),
  qualification: z.enum(["high_school", "bachelor", "master"]).optional(),
  interestedMajor: z.string().optional(),
  lastAcademicResult: z.string().optional(),
  experience: z.string().optional(),
  language: z.string().optional(),
  address: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
