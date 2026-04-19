import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  phone: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  country: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const partnerRegisterSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  gender: z.enum(["male", "female", "other"]),
  country: z.string().min(1, "Country is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  confirmPassword: z.string().min(1),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type PartnerRegisterInput = z.infer<typeof partnerRegisterSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
