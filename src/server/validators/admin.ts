import { z } from "zod";

// Users
export const createUserSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
  role: z.enum(["student", "counselor", "admin", "partner"], {
    errorMap: () => ({ message: "Invalid role" }),
  }),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  country: z.string().optional(),
  role: z.enum(["student", "counselor", "admin", "partner"], {
    errorMap: () => ({ message: "Invalid role" }),
  }).optional(),
  status: z.enum(["active", "inactive", "suspended"], {
    errorMap: () => ({ message: "Invalid status" }),
  }).optional(),
});

export const listUsersSchema = z.object({
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").default(10),
  role: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

// Applications
export const approveApplicationSchema = z.object({
  status: z.enum(["approved", "rejected"], {
    errorMap: () => ({ message: "Status must be 'approved' or 'rejected'" }),
  }),
  adminNote: z.string().optional(),
});

export const listApplicationsSchema = z.object({
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").default(10),
  status: z.string().optional(),
  search: z.string().optional(),
});

// Events
const eventBaseSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  category: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
});

export const createEventSchema = eventBaseSchema.refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export const updateEventSchema = eventBaseSchema.partial().refine((data) => {
  // Only validate if both dates are provided
  if (data.startDate && data.endDate) {
    return data.endDate > data.startDate;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export const listEventsSchema = z.object({
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").default(10),
  status: z.string().optional(),
  search: z.string().optional(),
});

// Partners
export const approvePartnerSchema = z.object({
  approved: z.boolean(),
  adminNote: z.string().optional(),
});

// Notifications
export const sendNotificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  targetRole: z.enum(["student", "partner"], {
    errorMap: () => ({ message: "Invalid target role" }),
  }).optional(),
  targetUserIds: z.array(z.string()).optional(),
}).refine((data) => !(data.targetRole && data.targetUserIds), {
  message: "Cannot specify both targetRole and targetUserIds",
});

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUsersInput = z.infer<typeof listUsersSchema>;
export type ApproveApplicationInput = z.infer<typeof approveApplicationSchema>;
export type ListApplicationsInput = z.infer<typeof listApplicationsSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type ListEventsInput = z.infer<typeof listEventsSchema>;
export type ApprovePartnerInput = z.infer<typeof approvePartnerSchema>;
export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
