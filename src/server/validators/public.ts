import { z } from "zod";

export const consultationSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  interestedMajor: z.string().optional(),
  interestedDegree: z.string().optional(),
  academicResult: z.string().optional(),
});

export const contactFormSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(10),
  email: z.string().email(),
  userType: z.enum(["student", "instructor", "company"]),
  organization: z.string().optional(),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  reason: z.string().optional(),
});

export const newsletterSchema = z.object({
  email: z.string().email(),
});

export type ConsultationInput = z.infer<typeof consultationSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
