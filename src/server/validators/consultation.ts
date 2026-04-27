import { z } from "zod";

export const createConsultationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  duration: z.number().int().min(15).max(180).optional(),
  price: z.number().min(0),
});

export const updateConsultationSchema = createConsultationSchema.partial();

export const bookConsultationSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  scheduledAt: z.string().datetime(),
  duration: z.number().int().min(15).max(180),
  price: z.number().min(0),
  consultantId: z.string().optional(),
});

export const listConsultationsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
});

export type CreateConsultationInput = z.infer<typeof createConsultationSchema>;
export type UpdateConsultationInput = z.infer<typeof updateConsultationSchema>;
export type BookConsultationInput = z.infer<typeof bookConsultationSchema>;
