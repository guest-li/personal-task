import "server-only";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_EXPIRY: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRY: z.string().default("7d"),
  SMTP_HOST: z.string().default("smtp.sendgrid.net"),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().default("apikey"),
  SMTP_PASS: z.string().default(""),
  EMAIL_FROM: z.string().email().default("noreply@example.com"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

export const env = envSchema.parse(process.env);
