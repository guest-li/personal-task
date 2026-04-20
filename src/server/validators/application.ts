import { z } from "zod";

export const createApplicationSchema = z.object({
  programName: z.string().min(1, "Program name is required"),
  universityName: z.string().min(1, "University name is required"),
  degree: z.string().optional(),
  language: z.string().optional(),
  fundType: z.enum(["self_funded", "scholarship"]).optional(),
});

export const listApplicationsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["appliedAt", "applicationCode", "programName", "universityName", "status"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  fundType: z.enum(["self_funded", "scholarship"]).optional(),
  status: z.enum(["pending", "approved", "rejected", "cancelled"]).optional(),
  search: z.string().optional(),
  university: z.string().optional(),
  degree: z.string().optional(),
});
