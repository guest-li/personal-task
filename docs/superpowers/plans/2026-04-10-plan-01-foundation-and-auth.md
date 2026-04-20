# Plan 1: Foundation & Auth — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A running Next.js app with locally installed PostgreSQL + Redis, Prisma schema for users, JWT-based email/password auth (register, login, logout, refresh, forgot/reset password), protected `/users/me` endpoint, welcome email on registration, 3 role-separated login pages (student/partner/admin), 2 registration pages (student/partner), "stay logged in" option, and a seeded admin user.

**Updated based on malishaedu.com reference analysis (April 2026):** Registration fields expanded (gender, country, mobile with intl format). Partner flow simplified (direct registration → inactive account → admin activates). Forgot password added. Three separate login pages added. "Stay logged in 30 days" added.

**Architecture:** Single Next.js 14 application using App Router. API lives under `app/api/v1/**/route.ts` as route handlers. Server-side logic lives under `src/server/` (services, auth utilities, middleware HOFs). Prisma for database access. Redis for refresh-token blacklisting and rate limiting.

**Tech Stack:** Next.js 14, React 18, TypeScript 5, Tailwind CSS 3, Prisma 5, PostgreSQL (local via Homebrew), Redis (local via Homebrew), ioredis, Zod, bcrypt, jsonwebtoken, Nodemailer, Vitest

---

## File Structure

All paths relative to project root (`/Users/lizhao/Documents/code/job`).

### Config & Meta
| File | Action | Purpose |
|---|---|---|
| `package.json` | Create | Dependencies, scripts |
| `tsconfig.json` | Create | TypeScript config |
| `next.config.mjs` | Create | Next.js config |
| `tailwind.config.ts` | Create | Tailwind setup |
| `postcss.config.mjs` | Create | PostCSS for Tailwind |
| `.eslintrc.json` | Create | ESLint rules |
| `.gitignore` | Modify | Add node_modules, .next, .env.local |
| `.env.example` | Create | Template for env vars |
| `vitest.config.ts` | Create | Vitest test runner config |

### Prisma
| File | Action | Purpose |
|---|---|---|
| `prisma/schema.prisma` | Create | User, StudentProfile, PartnerProfile models |
| `prisma/seed.ts` | Create | Seeds admin user |

### Server Code (`src/server/`)
| File | Action | Purpose |
|---|---|---|
| `src/server/db.ts` | Create | Prisma client singleton |
| `src/server/redis.ts` | Create | ioredis client singleton |
| `src/server/env.ts` | Create | Zod-validated env vars |
| `src/server/auth/constants.ts` | Create | Cookie names, TTLs |
| `src/server/auth/password.ts` | Create | bcrypt hash/compare |
| `src/server/auth/jwt.ts` | Create | Sign/verify access & refresh tokens |
| `src/server/auth/session.ts` | Create | getCurrentUser, setAuthCookies, clearAuthCookies |
| `src/server/middleware/with-auth.ts` | Create | HOF: requires valid JWT |
| `src/server/middleware/with-role.ts` | Create | HOF: requires role ∈ allowed |
| `src/server/middleware/with-validation.ts` | Create | HOF: Zod body/query validation |
| `src/server/middleware/with-rate-limit.ts` | Create | HOF: Redis-backed rate limiting |
| `src/server/http.ts` | Create | HttpError class, jsonResponse helper |
| `src/server/validators/auth.ts` | Create | Zod schemas for register/login |
| `src/server/services/user.service.ts` | Create | createUser, findByEmail, findById |
| `src/server/email/mailer.ts` | Create | Nodemailer transport wrapper |
| `src/server/email/templates/welcome.ts` | Create | Welcome email HTML template |

### API Routes
| File | Action | Purpose |
|---|---|---|
| `app/api/v1/auth/register/route.ts` | Create | POST — register student |
| `app/api/v1/auth/partner-register/route.ts` | Create | POST — register partner (status=inactive) |
| `app/api/v1/auth/login/route.ts` | Create | POST — email+password login (all roles, supports rememberMe) |
| `app/api/v1/auth/logout/route.ts` | Create | POST — clear cookies, blacklist token |
| `app/api/v1/auth/refresh/route.ts` | Create | POST — rotate access token |
| `app/api/v1/auth/forgot-password/route.ts` | Create | POST — send password reset email |
| `app/api/v1/auth/reset-password/route.ts` | Create | POST — reset password with token |
| `app/api/v1/users/me/route.ts` | Create | GET — current user, PATCH — update profile |

### UI Pages
| File | Action | Purpose |
|---|---|---|
| `app/layout.tsx` | Create | Root layout (html, body, Tailwind globals) |
| `app/globals.css` | Create | Tailwind directives |
| `app/page.tsx` | Create | Minimal home page placeholder |
| `app/(auth)/sign-in/page.tsx` | Create | Student login form |
| `app/(auth)/register/page.tsx` | Create | Student register form |
| `app/(auth)/partner-sign-in/page.tsx` | Create | Partner login form |
| `app/(auth)/partner-register/page.tsx` | Create | Partner register form |
| `app/(auth)/login/page.tsx` | Create | Admin login form |
| `app/(auth)/forgot-password/page.tsx` | Create | Forgot password (email input) |
| `app/(auth)/reset-password/page.tsx` | Create | Reset password (new password input) |

### Shared Types
| File | Action | Purpose |
|---|---|---|
| `src/types/auth.ts` | Create | TokenPayload, Role enum mirror |

### Tests
| File | Action | Purpose |
|---|---|---|
| `tests/helpers/db.ts` | Create | Test DB cleanup helper |
| `tests/helpers/auth.ts` | Create | Helper to create user & get auth cookies |
| `tests/unit/auth/password.test.ts` | Create | bcrypt hash/compare tests |
| `tests/unit/auth/jwt.test.ts` | Create | Token sign/verify tests |
| `tests/unit/middleware/with-auth.test.ts` | Create | 401 without token, passes user with token |
| `tests/unit/middleware/with-role.test.ts` | Create | 403 for wrong role |
| `tests/unit/middleware/with-validation.test.ts` | Create | 400 on invalid body |
| `tests/integration/auth/register.test.ts` | Create | Full register flow |
| `tests/integration/auth/login.test.ts` | Create | Full login flow |
| `tests/integration/auth/logout-refresh.test.ts` | Create | Logout + refresh token rotation |
| `tests/integration/users/me.test.ts` | Create | GET /users/me behind auth |

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.mjs`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `.eslintrc.json`
- Modify: `.gitignore`
- Create: `app/globals.css`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`

- [ ] **Step 1: Initialize package.json with dependencies**

```json
{
  "name": "edu-consultancy",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "next": "14.2.15",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "@prisma/client": "5.22.0",
    "ioredis": "5.4.1",
    "bcrypt": "5.1.1",
    "jsonwebtoken": "9.0.2",
    "zod": "3.23.8",
    "nodemailer": "6.9.15",
    "clsx": "2.1.1",
    "tailwind-merge": "2.5.4"
  },
  "devDependencies": {
    "typescript": "5.6.3",
    "@types/node": "20.16.11",
    "@types/react": "18.3.11",
    "@types/react-dom": "18.3.0",
    "@types/bcrypt": "5.0.2",
    "@types/jsonwebtoken": "9.0.7",
    "@types/nodemailer": "6.4.16",
    "prisma": "5.22.0",
    "tsx": "4.19.1",
    "tailwindcss": "3.4.14",
    "postcss": "8.4.47",
    "autoprefixer": "10.4.20",
    "eslint": "8.57.1",
    "eslint-config-next": "14.2.15",
    "vitest": "2.1.3",
    "server-only": "0.0.1"
  }
}
```

- [ ] **Step 2: Create TypeScript config**

```json
// tsconfig.json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
      "@/app/*": ["./app/*"],
      "@/prisma/*": ["./prisma/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create Next.js, Tailwind, PostCSS, ESLint configs**

```js
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["bcrypt"],
  },
};

export default nextConfig;
```

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
```

```js
// postcss.config.mjs
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
export default config;
```

```json
// .eslintrc.json
{
  "extends": "next/core-web-vitals",
  "rules": {
    "@next/next/no-img-element": "off"
  }
}
```

- [ ] **Step 4: Create app shell (globals.css, layout, home page)**

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Education Consultancy",
  description: "Your gateway to international education",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
```

```tsx
// app/page.tsx
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold">Education Consultancy</h1>
      <p className="mt-4 text-lg text-gray-600">Platform coming soon.</p>
    </main>
  );
}
```

- [ ] **Step 5: Update .gitignore and install dependencies**

Append to `.gitignore`:
```
node_modules/
.next/
.env.local
.env*.local
*.tsbuildinfo
next-env.d.ts
```

Run:
```bash
npm install
```

Expected: installs without errors, `node_modules/` created.

- [ ] **Step 6: Verify dev server boots**

Run:
```bash
npm run dev
```

Expected: Next.js compiles, http://localhost:3000 shows "Education Consultancy — Platform coming soon."

Stop the dev server (Ctrl+C).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.mjs tailwind.config.ts postcss.config.mjs .eslintrc.json .gitignore app/
git commit -m "feat: scaffold Next.js project with Tailwind and TypeScript"
```

---

## Task 2: Local PostgreSQL + Redis + Environment Config

**Prerequisites:** PostgreSQL and Redis installed locally via Homebrew.

```bash
# Install (skip if already installed)
brew install postgresql@16 redis

# Start services
brew services start postgresql@16
brew services start redis
```

**Files:**
- Create: `.env.example`

- [ ] **Step 1: Create the database**

```bash
createdb edu_consultancy_dev
```

- [ ] **Step 2: Verify services are running**

```bash
psql -d edu_consultancy_dev -c "SELECT 1;"
redis-cli ping
```

Expected: `1` row returned from postgres, `PONG` from redis.

- [ ] **Step 3: Create .env.example**

```bash
# .env.example
# Copy to .env.local and fill in values

# Database
DATABASE_URL="postgresql://localhost:5432/edu_consultancy_dev"

# Redis
REDIS_URL="redis://localhost:6379"

# Auth
JWT_ACCESS_SECRET="change-me-access-secret-min-32-chars"
JWT_REFRESH_SECRET="change-me-refresh-secret-min-32-chars"
ACCESS_TOKEN_EXPIRY="15m"
REFRESH_TOKEN_EXPIRY="7d"

# Email (SendGrid SMTP)
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
EMAIL_FROM="noreply@example.com"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

- [ ] **Step 4: Create .env.local from example**

```bash
cp .env.example .env.local
```

(`.env.local` is already in `.gitignore` — no secrets committed.)

- [ ] **Step 5: Commit**

```bash
git add .env.example
git commit -m "infra: add environment config for local PostgreSQL and Redis"
```

---

## Task 3: Prisma Schema + DB Client + Redis Client + Env Validation

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/server/env.ts`
- Create: `src/server/db.ts`
- Create: `src/server/redis.ts`
- Create: `src/types/auth.ts`

- [ ] **Step 1: Create shared types**

```ts
// src/types/auth.ts
export type Role = "student" | "counselor" | "admin" | "partner";

export interface TokenPayload {
  sub: string;       // user ID
  email: string;
  role: Role;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}
```

- [ ] **Step 2: Create Prisma schema**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  student
  counselor
  admin
  partner
}

enum Gender {
  male
  female
  other
}

enum UserStatus {
  active
  inactive
  suspended
}

enum Qualification {
  high_school
  bachelor
  master
}

model User {
  id           String     @id @default(uuid())
  email        String     @unique
  passwordHash String?    @map("password_hash")
  name         String
  phone        String?
  gender       Gender?
  country      String?
  continent    String?
  role         Role       @default(student)
  avatar       String?
  googleId     String?    @unique @map("google_id")
  status       UserStatus @default(active)
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")

  studentProfile StudentProfile?
  partnerProfile PartnerProfile?
  certificates   Certificate[]

  @@map("users")
}

model StudentProfile {
  id                 String         @id @default(uuid())
  userId             String         @unique @map("user_id")
  user               User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  passportNid        String?        @map("passport_nid")
  qualification      Qualification?
  interestedMajor    String?        @map("interested_major")
  lastAcademicResult String?        @map("last_academic_result")
  experience         String?
  language           String?
  preferredCountries String[]       @map("preferred_countries")
  address            String?
  bio                String?

  @@map("student_profiles")
}

model Certificate {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name      String
  fileUrl   String   @map("file_url")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("certificates")
}

enum PartnerLevel {
  beginner
  intermediate
  advanced
  expert
}

model PartnerProfile {
  id                  String       @id @default(uuid())
  userId              String       @unique @map("user_id")
  user                User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  qualifications      String?
  experience          String?
  specializationAreas String[]     @map("specialization_areas")
  level               PartnerLevel @default(beginner)
  bio                 String?

  @@map("partner_profiles")
}
```

- [ ] **Step 3: Run initial migration**

```bash
npx prisma migrate dev --name init
```

Expected: Migration created in `prisma/migrations/`, tables `users`, `student_profiles`, `partner_profiles` created in the database.

- [ ] **Step 4: Create env validation**

```ts
// src/server/env.ts
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
```

- [ ] **Step 5: Create Prisma client singleton**

```ts
// src/server/db.ts
import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 6: Create Redis client singleton**

```ts
// src/server/redis.ts
import "server-only";
import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: Redis | undefined };

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
```

- [ ] **Step 7: Verify Prisma client generates and imports work**

```bash
npx prisma generate
npx tsx -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.\$connect().then(() => { console.log('DB connected'); return p.\$disconnect(); })"
```

Expected: "DB connected" printed.

- [ ] **Step 8: Commit**

```bash
git add prisma/ src/server/env.ts src/server/db.ts src/server/redis.ts src/types/
git commit -m "feat: add Prisma schema (users), env validation, DB and Redis clients"
```

---

## Task 4: Vitest Test Infrastructure

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/helpers/db.ts`
- Create: `tests/helpers/auth.ts`
- Create: `tests/unit/smoke.test.ts`

- [ ] **Step 1: Create Vitest config**

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: [],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/app": path.resolve(__dirname, "./app"),
    },
  },
});
```

- [ ] **Step 2: Create test DB cleanup helper**

```ts
// tests/helpers/db.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function cleanDatabase() {
  await prisma.certificate.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.partnerProfile.deleteMany();
  await prisma.user.deleteMany();
}

export { prisma as testPrisma };
```

- [ ] **Step 3: Create auth test helper (placeholder — filled in after JWT task)**

```ts
// tests/helpers/auth.ts
import { testPrisma } from "./db";

export async function createTestUser(overrides: {
  email?: string;
  name?: string;
  role?: "student" | "partner" | "admin";
  passwordHash?: string;
  status?: "active" | "inactive" | "suspended";
} = {}) {
  return testPrisma.user.create({
    data: {
      email: overrides.email ?? `test-${Date.now()}@example.com`,
      name: overrides.name ?? "Test User",
      role: overrides.role ?? "student",
      passwordHash: overrides.passwordHash ?? "not-a-real-hash",
      status: overrides.status ?? "active",
    },
  });
}
```

- [ ] **Step 4: Write a smoke test**

```ts
// tests/unit/smoke.test.ts
import { describe, it, expect } from "vitest";

describe("smoke test", () => {
  it("1 + 1 = 2", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run tests**

```bash
npm test
```

Expected: 1 test passes.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts tests/
git commit -m "test: add Vitest config and test infrastructure"
```

---

## Task 5: Password Hashing Utility

**Files:**
- Create: `src/server/auth/password.ts`
- Test: `tests/unit/auth/password.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/auth/password.test.ts
import { describe, it, expect } from "vitest";
import { hashPassword, comparePassword } from "@/server/auth/password";

describe("password", () => {
  it("hashes a password and verifies it", async () => {
    const hash = await hashPassword("my-secret-123");
    expect(hash).not.toBe("my-secret-123");
    expect(hash.startsWith("$2b$")).toBe(true);

    const match = await comparePassword("my-secret-123", hash);
    expect(match).toBe(true);
  });

  it("rejects wrong password", async () => {
    const hash = await hashPassword("correct-password");
    const match = await comparePassword("wrong-password", hash);
    expect(match).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/unit/auth/password.test.ts
```

Expected: FAIL — cannot find module `@/server/auth/password`.

- [ ] **Step 3: Implement password utility**

```ts
// src/server/auth/password.ts
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function comparePassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/unit/auth/password.test.ts
```

Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/server/auth/password.ts tests/unit/auth/password.test.ts
git commit -m "feat: add bcrypt password hashing utility"
```

---

## Task 6: JWT Token Utilities

**Files:**
- Create: `src/server/auth/constants.ts`
- Create: `src/server/auth/jwt.ts`
- Test: `tests/unit/auth/jwt.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/auth/jwt.test.ts
import { describe, it, expect } from "vitest";
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from "@/server/auth/jwt";
import type { TokenPayload } from "@/types/auth";

const payload: TokenPayload = {
  sub: "user-123",
  email: "test@example.com",
  role: "student",
};

describe("JWT", () => {
  it("signs and verifies an access token", () => {
    const token = signAccessToken(payload);
    expect(typeof token).toBe("string");

    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe("user-123");
    expect(decoded.email).toBe("test@example.com");
    expect(decoded.role).toBe("student");
  });

  it("signs and verifies a refresh token", () => {
    const token = signRefreshToken(payload);
    const decoded = verifyRefreshToken(token);
    expect(decoded.sub).toBe("user-123");
  });

  it("rejects tampered token", () => {
    const token = signAccessToken(payload);
    expect(() => verifyAccessToken(token + "x")).toThrow();
  });

  it("access and refresh secrets are different", () => {
    const access = signAccessToken(payload);
    expect(() => verifyRefreshToken(access)).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/unit/auth/jwt.test.ts
```

Expected: FAIL — cannot find module `@/server/auth/jwt`.

- [ ] **Step 3: Create auth constants**

```ts
// src/server/auth/constants.ts
export const AUTH_COOKIE = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
} as const;

export const TOKEN_EXPIRY = {
  ACCESS: "15m",
  REFRESH: "7d",
  REMEMBER_ME_REFRESH: "30d",
} as const;

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
```

- [ ] **Step 4: Implement JWT utilities**

```ts
// src/server/auth/jwt.ts
import jwt from "jsonwebtoken";
import type { TokenPayload } from "@/types/auth";
import { TOKEN_EXPIRY } from "./constants";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-me-32chars!";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret-change-me-32chars";

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: TOKEN_EXPIRY.ACCESS,
  });
}

export function signRefreshToken(payload: TokenPayload, rememberMe = false): string {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: rememberMe ? TOKEN_EXPIRY.REMEMBER_ME_REFRESH : TOKEN_EXPIRY.REFRESH,
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npm test -- tests/unit/auth/jwt.test.ts
```

Expected: 4 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/server/auth/constants.ts src/server/auth/jwt.ts tests/unit/auth/jwt.test.ts
git commit -m "feat: add JWT access and refresh token utilities"
```

---

## Task 7: Session Helpers

**Files:**
- Create: `src/server/auth/session.ts`

- [ ] **Step 1: Implement session helpers**

```ts
// src/server/auth/session.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "./jwt";
import { signAccessToken, signRefreshToken } from "./jwt";
import { AUTH_COOKIE, COOKIE_OPTIONS } from "./constants";
import type { TokenPayload, SessionUser } from "@/types/auth";

export function getCurrentUser(req: NextRequest): TokenPayload | null {
  const token = req.cookies.get(AUTH_COOKIE.ACCESS_TOKEN)?.value;
  if (!token) return null;
  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

export function setAuthCookies(
  res: NextResponse,
  payload: TokenPayload,
  options?: { rememberMe?: boolean },
): NextResponse {
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload, options?.rememberMe);

  res.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60, // 15 minutes in seconds
  });

  const refreshMaxAge = options?.rememberMe
    ? 30 * 24 * 60 * 60 // 30 days
    : 7 * 24 * 60 * 60; // 7 days

  res.cookies.set(AUTH_COOKIE.REFRESH_TOKEN, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: refreshMaxAge,
  });

  return res;
}

export function clearAuthCookies(res: NextResponse): NextResponse {
  res.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, "", {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
  res.cookies.set(AUTH_COOKIE.REFRESH_TOKEN, "", {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
  return res;
}
```

- [ ] **Step 2: Commit**

No separate test file — session helpers are thin wrappers around JWT + cookies. They are covered by the integration tests in Task 14–17.

```bash
git add src/server/auth/session.ts
git commit -m "feat: add session helpers for auth cookies"
```

---

## Task 8: HTTP Helpers + withAuth Middleware

**Files:**
- Create: `src/server/http.ts`
- Create: `src/server/middleware/with-auth.ts`
- Test: `tests/unit/middleware/with-auth.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/middleware/with-auth.test.ts
import { describe, it, expect } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/server/middleware/with-auth";
import { signAccessToken } from "@/server/auth/jwt";
import { AUTH_COOKIE } from "@/server/auth/constants";
import type { TokenPayload } from "@/types/auth";

function makeRequest(cookie?: string): NextRequest {
  const req = new NextRequest("http://localhost/api/test", {
    method: "GET",
  });
  if (cookie) {
    req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, cookie);
  }
  return req;
}

describe("withAuth", () => {
  const payload: TokenPayload = {
    sub: "user-1",
    email: "test@example.com",
    role: "student",
  };

  it("returns 401 when no auth cookie present", async () => {
    const handler = withAuth(async (_req, { user }) => {
      return NextResponse.json({ user });
    });

    const res = await handler(makeRequest(), { params: {} });
    expect(res.status).toBe(401);
  });

  it("passes user to handler when valid token present", async () => {
    const token = signAccessToken(payload);
    const handler = withAuth(async (_req, { user }) => {
      return NextResponse.json({ userId: user.sub });
    });

    const res = await handler(makeRequest(token), { params: {} });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.userId).toBe("user-1");
  });

  it("returns 401 when token is invalid", async () => {
    const handler = withAuth(async () => NextResponse.json({}));
    const res = await handler(makeRequest("bad-token"), { params: {} });
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/unit/middleware/with-auth.test.ts
```

Expected: FAIL — cannot find module `@/server/middleware/with-auth`.

- [ ] **Step 3: Create HTTP helpers**

```ts
// src/server/http.ts
import { NextResponse } from "next/server";

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function jsonError(
  message: string,
  status: number,
  details?: unknown,
): NextResponse {
  return NextResponse.json(
    { error: message, ...(details ? { details } : {}) },
    { status },
  );
}

export function jsonSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}
```

- [ ] **Step 4: Create withAuth middleware**

```ts
// src/server/middleware/with-auth.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { jsonError } from "@/server/http";
import type { TokenPayload } from "@/types/auth";

export type AuthContext<P = Record<string, string>> = {
  params: P;
  user: TokenPayload;
};

type AuthHandler<P = Record<string, string>> = (
  req: NextRequest,
  ctx: AuthContext<P>,
) => Promise<NextResponse>;

export function withAuth<P = Record<string, string>>(
  handler: AuthHandler<P>,
) {
  return async (
    req: NextRequest,
    ctx: { params: P },
  ): Promise<NextResponse> => {
    const user = getCurrentUser(req);
    if (!user) {
      return jsonError("Unauthorized", 401);
    }
    return handler(req, { ...ctx, user });
  };
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npm test -- tests/unit/middleware/with-auth.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/server/http.ts src/server/middleware/with-auth.ts tests/unit/middleware/with-auth.test.ts
git commit -m "feat: add HTTP helpers and withAuth middleware"
```

---

## Task 9: withRole Middleware

**Files:**
- Create: `src/server/middleware/with-role.ts`
- Test: `tests/unit/middleware/with-role.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/middleware/with-role.test.ts
import { describe, it, expect } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/server/middleware/with-role";
import { signAccessToken } from "@/server/auth/jwt";
import { AUTH_COOKIE } from "@/server/auth/constants";
import type { TokenPayload } from "@/types/auth";

function makeAuthRequest(role: TokenPayload["role"]): NextRequest {
  const payload: TokenPayload = { sub: "user-1", email: "t@e.com", role };
  const token = signAccessToken(payload);
  const req = new NextRequest("http://localhost/api/test");
  req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);
  return req;
}

describe("withRole", () => {
  it("allows matching role", async () => {
    const handler = withRole(["admin"], async (_req, { user }) => {
      return NextResponse.json({ role: user.role });
    });
    const res = await handler(makeAuthRequest("admin"), { params: {} });
    expect(res.status).toBe(200);
  });

  it("returns 403 for non-matching role", async () => {
    const handler = withRole(["admin"], async () => NextResponse.json({}));
    const res = await handler(makeAuthRequest("student"), { params: {} });
    expect(res.status).toBe(403);
  });

  it("returns 401 when not authenticated", async () => {
    const handler = withRole(["admin"], async () => NextResponse.json({}));
    const req = new NextRequest("http://localhost/api/test");
    const res = await handler(req, { params: {} });
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/unit/middleware/with-role.test.ts
```

Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement withRole**

```ts
// src/server/middleware/with-role.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthContext } from "./with-auth";
import { jsonError } from "@/server/http";
import type { Role } from "@/types/auth";

type RoleHandler<P = Record<string, string>> = (
  req: NextRequest,
  ctx: AuthContext<P>,
) => Promise<NextResponse>;

export function withRole<P = Record<string, string>>(
  allowedRoles: Role[],
  handler: RoleHandler<P>,
) {
  return withAuth<P>(async (req, ctx) => {
    if (!allowedRoles.includes(ctx.user.role)) {
      return jsonError("Forbidden", 403);
    }
    return handler(req, ctx);
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/unit/middleware/with-role.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/server/middleware/with-role.ts tests/unit/middleware/with-role.test.ts
git commit -m "feat: add withRole middleware"
```

---

## Task 10: withValidation Middleware

**Files:**
- Create: `src/server/middleware/with-validation.ts`
- Test: `tests/unit/middleware/with-validation.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/middleware/with-validation.test.ts
import { describe, it, expect } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { withValidation } from "@/server/middleware/with-validation";
import { z } from "zod";

const testSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

describe("withValidation", () => {
  it("passes validated body to handler", async () => {
    const handler = withValidation(testSchema, async (_req, ctx) => {
      return NextResponse.json({ email: ctx.body.email });
    });

    const req = new NextRequest("http://localhost/api/test", {
      method: "POST",
      body: JSON.stringify({ email: "a@b.com", name: "Test" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await handler(req, { params: {} });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.email).toBe("a@b.com");
  });

  it("returns 400 on invalid body", async () => {
    const handler = withValidation(testSchema, async () => NextResponse.json({}));

    const req = new NextRequest("http://localhost/api/test", {
      method: "POST",
      body: JSON.stringify({ email: "not-an-email" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await handler(req, { params: {} });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid request");
  });

  it("returns 400 on missing body", async () => {
    const handler = withValidation(testSchema, async () => NextResponse.json({}));
    const req = new NextRequest("http://localhost/api/test", { method: "POST" });
    const res = await handler(req, { params: {} });
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/unit/middleware/with-validation.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement withValidation**

```ts
// src/server/middleware/with-validation.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { jsonError } from "@/server/http";

export function withValidation<
  S extends z.ZodType,
  P = Record<string, string>,
>(
  schema: S,
  handler: (
    req: NextRequest,
    ctx: P & { body: z.infer<S> },
  ) => Promise<NextResponse>,
) {
  return async (req: NextRequest, ctx: P): Promise<NextResponse> => {
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return jsonError("Invalid request", 400, { message: "Missing or malformed JSON body" });
    }

    const result = schema.safeParse(raw);
    if (!result.success) {
      return jsonError("Invalid request", 400, result.error.flatten());
    }

    return handler(req, { ...ctx, body: result.data });
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/unit/middleware/with-validation.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/server/middleware/with-validation.ts tests/unit/middleware/with-validation.test.ts
git commit -m "feat: add withValidation middleware (Zod)"
```

---

## Task 11: withRateLimit Middleware

**Files:**
- Create: `src/server/middleware/with-rate-limit.ts`

- [ ] **Step 1: Implement withRateLimit**

```ts
// src/server/middleware/with-rate-limit.ts
import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/server/redis";
import { jsonError } from "@/server/http";

interface RateLimitOptions {
  limit: number;
  windowSec: number;
}

export function withRateLimit<P>(
  key: string,
  opts: RateLimitOptions,
  handler: (req: NextRequest, ctx: P) => Promise<NextResponse>,
) {
  return async (req: NextRequest, ctx: P): Promise<NextResponse> => {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
    const bucket = `ratelimit:${key}:${ip}`;

    const count = await redis.incr(bucket);
    if (count === 1) {
      await redis.expire(bucket, opts.windowSec);
    }

    if (count > opts.limit) {
      return jsonError("Too many requests", 429);
    }

    return handler(req, ctx);
  };
}
```

- [ ] **Step 2: Commit**

Rate limiting is tested end-to-end in the integration tests (Task 14–17) and requires a running Redis. Skipping unit test here — the logic is 10 lines.

```bash
git add src/server/middleware/with-rate-limit.ts
git commit -m "feat: add withRateLimit middleware (Redis-backed)"
```

---

## Task 12: Auth Validators + User Service

**Files:**
- Create: `src/server/validators/auth.ts`
- Create: `src/server/services/user.service.ts`
- Test: `tests/unit/services/user.service.test.ts`

- [ ] **Step 1: Create Zod validators for auth**

```ts
// src/server/validators/auth.ts
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
```

- [ ] **Step 2: Write the failing user service test**

```ts
// tests/unit/services/user.service.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { createUser, findUserByEmail, findUserById } from "@/server/services/user.service";
import { testPrisma, cleanDatabase } from "../helpers/db";

describe("user.service", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it("creates a student user with hashed password", async () => {
    const user = await createUser({
      name: "Alice",
      email: "alice@example.com",
      password: "securepass123",
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe("alice@example.com");
    expect(user.name).toBe("Alice");
    expect(user.role).toBe("student");
    expect(user.passwordHash).not.toBe("securepass123");
    expect(user.passwordHash!.startsWith("$2b$")).toBe(true);
  });

  it("rejects duplicate email", async () => {
    await createUser({ name: "A", email: "dup@test.com", password: "pass1234" });
    await expect(
      createUser({ name: "B", email: "dup@test.com", password: "pass5678" }),
    ).rejects.toThrow();
  });

  it("finds user by email", async () => {
    await createUser({ name: "Bob", email: "bob@test.com", password: "pass1234" });
    const found = await findUserByEmail("bob@test.com");
    expect(found).not.toBeNull();
    expect(found!.name).toBe("Bob");
  });

  it("returns null for unknown email", async () => {
    const found = await findUserByEmail("nobody@test.com");
    expect(found).toBeNull();
  });

  it("finds user by ID", async () => {
    const user = await createUser({ name: "Carol", email: "carol@test.com", password: "pass1234" });
    const found = await findUserById(user.id);
    expect(found).not.toBeNull();
    expect(found!.email).toBe("carol@test.com");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npm test -- tests/unit/services/user.service.test.ts
```

Expected: FAIL — cannot find module.

- [ ] **Step 4: Implement user service**

```ts
// src/server/services/user.service.ts
import { prisma } from "@/server/db";
import { hashPassword } from "@/server/auth/password";
import type { RegisterInput } from "@/server/validators/auth";

export async function createUser(input: RegisterInput, role: "student" | "partner" = "student") {
  const passwordHash = await hashPassword(input.password);

  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
      phone: input.phone ?? null,
      gender: input.gender ?? null,
      country: input.country ?? null,
      role,
      status: role === "partner" ? "inactive" : "active",
    },
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}
```

- [ ] **Step 5: Run test to verify it passes**

Make sure PostgreSQL and Redis are running (`brew services list`), then:

```bash
npm test -- tests/unit/services/user.service.test.ts
```

Expected: 5 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/server/validators/auth.ts src/server/services/user.service.ts tests/unit/services/user.service.test.ts
git commit -m "feat: add auth validators and user service"
```

---

## Task 13: Email Service + Welcome Template

**Files:**
- Create: `src/server/email/mailer.ts`
- Create: `src/server/email/templates/welcome.ts`

- [ ] **Step 1: Create mailer transport**

```ts
// src/server/email/mailer.ts
import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter;

function getTransporter() {
  if (transporter) return transporter;

  if (process.env.NODE_ENV === "test") {
    // In tests, use a no-op transport
    transporter = nodemailer.createTransport({ jsonTransport: true });
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.sendgrid.net",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER ?? "apikey",
      pass: process.env.SMTP_PASS ?? "",
    },
  });

  return transporter;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const from = process.env.EMAIL_FROM ?? "noreply@example.com";
  await getTransporter().sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}
```

- [ ] **Step 2: Create welcome email template**

```ts
// src/server/email/templates/welcome.ts
export function welcomeEmailHtml(name: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1a365d;">Welcome to Education Consultancy!</h1>
  <p>Hi ${escapeHtml(name)},</p>
  <p>Thank you for creating your account. You can now:</p>
  <ul>
    <li>Browse universities and programs</li>
    <li>Save your favorites</li>
    <li>Book a free consultation</li>
  </ul>
  <p>If you have any questions, feel free to reach out to our team.</p>
  <p>Best regards,<br>Education Consultancy Team</p>
</body>
</html>`.trim();
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
```

- [ ] **Step 3: Commit**

```bash
git add src/server/email/
git commit -m "feat: add email service with Nodemailer and welcome template"
```

---

## Task 14: POST /api/v1/auth/register

**Files:**
- Create: `app/api/v1/auth/register/route.ts`
- Test: `tests/integration/auth/register.test.ts`

- [ ] **Step 1: Write the failing integration test**

```ts
// tests/integration/auth/register.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/v1/auth/register/route";
import { cleanDatabase, testPrisma } from "../../helpers/db";

function makeRegisterRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/v1/auth/register", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it("registers a new student and returns user data", async () => {
    const res = await POST(makeRegisterRequest({
      name: "Alice",
      email: "alice@example.com",
      password: "securepass123",
      confirmPassword: "securepass123",
      gender: "female",
      country: "China",
    }));

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.user.email).toBe("alice@example.com");
    expect(body.user.role).toBe("student");
    expect(body.user.status).toBe("active");
    expect(body.user.passwordHash).toBeUndefined();

    const dbUser = await testPrisma.user.findUnique({
      where: { email: "alice@example.com" },
    });
    expect(dbUser).not.toBeNull();
    expect(dbUser!.gender).toBe("female");
    expect(dbUser!.country).toBe("China");
  });

  it("sets auth cookies on successful registration", async () => {
    const res = await POST(makeRegisterRequest({
      name: "Bob",
      email: "bob@example.com",
      password: "securepass123",
      confirmPassword: "securepass123",
    }));

    expect(res.status).toBe(201);
    const cookies = res.headers.getSetCookie();
    const cookieStr = cookies.join("; ");
    expect(cookieStr).toContain("access_token=");
    expect(cookieStr).toContain("refresh_token=");
  });

  it("returns 400 for invalid input", async () => {
    const res = await POST(makeRegisterRequest({
      email: "not-an-email",
    }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when passwords do not match", async () => {
    const res = await POST(makeRegisterRequest({
      name: "Mismatch",
      email: "mismatch@example.com",
      password: "securepass123",
      confirmPassword: "differentpass",
    }));
    expect(res.status).toBe(400);
  });

  it("returns 409 for duplicate email", async () => {
    await POST(makeRegisterRequest({
      name: "First",
      email: "dup@example.com",
      password: "securepass123",
      confirmPassword: "securepass123",
    }));

    const res = await POST(makeRegisterRequest({
      name: "Second",
      email: "dup@example.com",
      password: "securepass456",
      confirmPassword: "securepass456",
    }));

    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toContain("already registered");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/integration/auth/register.test.ts
```

Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement register route**

```ts
// app/api/v1/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/server/validators/auth";
import { createUser, findUserByEmail } from "@/server/services/user.service";
import { setAuthCookies } from "@/server/auth/session";
import { jsonError } from "@/server/http";
import { withRateLimit } from "@/server/middleware/with-rate-limit";
import { sendEmail } from "@/server/email/mailer";
import { welcomeEmailHtml } from "@/server/email/templates/welcome";
import type { TokenPayload } from "@/types/auth";

async function handler(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request", 400);
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request", 400, parsed.error.flatten());
  }

  const existing = await findUserByEmail(parsed.data.email);
  if (existing) {
    return jsonError("Email already registered", 409);
  }

  const user = await createUser(parsed.data, "student");

  const payload: TokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  const res = NextResponse.json(
    {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
    },
    { status: 201 },
  );

  setAuthCookies(res, payload);

  // Send welcome email (fire-and-forget)
  sendEmail({
    to: user.email,
    subject: "Welcome to Education Consultancy",
    html: welcomeEmailHtml(user.name),
  }).catch((err) => {
    console.error("Failed to send welcome email:", err);
  });

  return res;
}

export const POST = withRateLimit(
  "auth:register",
  { limit: 5, windowSec: 900 },
  handler,
);
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/integration/auth/register.test.ts
```

Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/api/v1/auth/register/ tests/integration/auth/register.test.ts
git commit -m "feat: add POST /api/v1/auth/register endpoint"
```

---

## Task 15: POST /api/v1/auth/login

**Files:**
- Create: `app/api/v1/auth/login/route.ts`
- Test: `tests/integration/auth/login.test.ts`

- [ ] **Step 1: Write the failing integration test**

```ts
// tests/integration/auth/login.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/v1/auth/login/route";
import { cleanDatabase } from "../../helpers/db";
import { createTestUser } from "../../helpers/auth";
import { hashPassword } from "@/server/auth/password";

function makeLoginRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/v1/auth/login", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it("logs in with correct credentials and returns cookies", async () => {
    const hash = await hashPassword("correctpass");
    await createTestUser({ email: "login@test.com", passwordHash: hash });

    const res = await POST(makeLoginRequest({
      email: "login@test.com",
      password: "correctpass",
    }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.email).toBe("login@test.com");

    const cookies = res.headers.getSetCookie();
    expect(cookies.join("; ")).toContain("access_token=");
  });

  it("returns 401 for wrong password", async () => {
    const hash = await hashPassword("correctpass");
    await createTestUser({ email: "wrong@test.com", passwordHash: hash });

    const res = await POST(makeLoginRequest({
      email: "wrong@test.com",
      password: "wrongpass",
    }));

    expect(res.status).toBe(401);
  });

  it("returns 401 for non-existent email", async () => {
    const res = await POST(makeLoginRequest({
      email: "noone@test.com",
      password: "anything",
    }));

    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid body", async () => {
    const res = await POST(makeLoginRequest({ email: "bad" }));
    expect(res.status).toBe(400);
  });

  it("returns 403 for suspended user", async () => {
    const hash = await hashPassword("pass1234");
    await createTestUser({
      email: "suspended@test.com",
      passwordHash: hash,
      status: "suspended",
    });

    const res = await POST(makeLoginRequest({
      email: "suspended@test.com",
      password: "pass1234",
    }));

    expect(res.status).toBe(403);
  });

  it("returns 403 for inactive partner", async () => {
    const hash = await hashPassword("pass1234");
    await createTestUser({
      email: "inactive-partner@test.com",
      passwordHash: hash,
      role: "partner",
      status: "inactive",
    });

    const res = await POST(makeLoginRequest({
      email: "inactive-partner@test.com",
      password: "pass1234",
    }));

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("inactive");
  });

  it("sets extended cookie when rememberMe is true", async () => {
    const hash = await hashPassword("pass1234");
    await createTestUser({ email: "remember@test.com", passwordHash: hash });

    const res = await POST(makeLoginRequest({
      email: "remember@test.com",
      password: "pass1234",
      rememberMe: true,
    }));

    expect(res.status).toBe(200);
    const cookies = res.headers.getSetCookie();
    const refreshCookie = cookies.find((c) => c.includes("refresh_token="));
    expect(refreshCookie).toContain("Max-Age=2592000"); // 30 days
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/integration/auth/login.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement login route**

```ts
// app/api/v1/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/server/validators/auth";
import { findUserByEmail } from "@/server/services/user.service";
import { comparePassword } from "@/server/auth/password";
import { setAuthCookies } from "@/server/auth/session";
import { jsonError } from "@/server/http";
import { withRateLimit } from "@/server/middleware/with-rate-limit";
import type { TokenPayload } from "@/types/auth";

async function handler(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request", 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request", 400, parsed.error.flatten());
  }

  const user = await findUserByEmail(parsed.data.email);
  if (!user || !user.passwordHash) {
    return jsonError("Invalid email or password", 401);
  }

  if (user.status === "suspended") {
    return jsonError("Account suspended", 403);
  }

  if (user.status === "inactive") {
    return jsonError("Account is inactive — please contact the administrator to activate your account", 403);
  }

  const valid = await comparePassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return jsonError("Invalid email or password", 401);
  }

  const payload: TokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  const res = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });

  setAuthCookies(res, payload, { rememberMe: parsed.data.rememberMe });

  return res;
}

export const POST = withRateLimit(
  "auth:login",
  { limit: 5, windowSec: 900 },
  handler,
);
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/integration/auth/login.test.ts
```

Expected: 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/api/v1/auth/login/ tests/integration/auth/login.test.ts
git commit -m "feat: add POST /api/v1/auth/login endpoint"
```

---

## Task 16: POST /api/v1/auth/logout + POST /api/v1/auth/refresh

**Files:**
- Create: `app/api/v1/auth/logout/route.ts`
- Create: `app/api/v1/auth/refresh/route.ts`
- Test: `tests/integration/auth/logout-refresh.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/integration/auth/logout-refresh.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as logoutHandler } from "@/app/api/v1/auth/logout/route";
import { POST as refreshHandler } from "@/app/api/v1/auth/refresh/route";
import { signAccessToken, signRefreshToken } from "@/server/auth/jwt";
import { AUTH_COOKIE } from "@/server/auth/constants";
import { redis } from "@/server/redis";
import { cleanDatabase } from "../../helpers/db";
import { createTestUser } from "../../helpers/auth";
import type { TokenPayload } from "@/types/auth";

describe("logout + refresh", () => {
  let payload: TokenPayload;
  let refreshToken: string;

  beforeEach(async () => {
    await cleanDatabase();
    // Flush rate limit keys
    const keys = await redis.keys("ratelimit:*");
    if (keys.length > 0) await redis.del(...keys);
    // Flush blacklist keys
    const blKeys = await redis.keys("blacklist:*");
    if (blKeys.length > 0) await redis.del(...blKeys);

    const user = await createTestUser({ email: "auth@test.com" });
    payload = { sub: user.id, email: user.email, role: user.role };
    refreshToken = signRefreshToken(payload);
  });

  describe("POST /api/v1/auth/refresh", () => {
    it("issues new access token from valid refresh token", async () => {
      const req = new NextRequest("http://localhost/api/v1/auth/refresh", {
        method: "POST",
      });
      req.cookies.set(AUTH_COOKIE.REFRESH_TOKEN, refreshToken);

      const res = await refreshHandler(req);
      expect(res.status).toBe(200);

      const cookies = res.headers.getSetCookie().join("; ");
      expect(cookies).toContain("access_token=");
    });

    it("returns 401 without refresh token", async () => {
      const req = new NextRequest("http://localhost/api/v1/auth/refresh", {
        method: "POST",
      });
      const res = await refreshHandler(req);
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    it("clears cookies and blacklists refresh token", async () => {
      const req = new NextRequest("http://localhost/api/v1/auth/logout", {
        method: "POST",
      });
      req.cookies.set(AUTH_COOKIE.REFRESH_TOKEN, refreshToken);

      const res = await logoutHandler(req);
      expect(res.status).toBe(200);

      // Cookies should be cleared (maxAge=0)
      const cookies = res.headers.getSetCookie().join("; ");
      expect(cookies).toContain("access_token=;");

      // Refresh token should now be blacklisted — using it should fail
      const refreshReq = new NextRequest("http://localhost/api/v1/auth/refresh", {
        method: "POST",
      });
      refreshReq.cookies.set(AUTH_COOKIE.REFRESH_TOKEN, refreshToken);
      const refreshRes = await refreshHandler(refreshReq);
      expect(refreshRes.status).toBe(401);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/integration/auth/logout-refresh.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement refresh route**

```ts
// app/api/v1/auth/refresh/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken, signAccessToken } from "@/server/auth/jwt";
import { AUTH_COOKIE, COOKIE_OPTIONS } from "@/server/auth/constants";
import { redis } from "@/server/redis";
import { jsonError } from "@/server/http";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE.REFRESH_TOKEN)?.value;
  if (!token) {
    return jsonError("Unauthorized", 401);
  }

  // Check if token is blacklisted
  const blacklisted = await redis.get(`blacklist:${token}`);
  if (blacklisted) {
    return jsonError("Unauthorized", 401);
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    return jsonError("Unauthorized", 401);
  }

  const newAccessToken = signAccessToken({
    sub: payload.sub,
    email: payload.email,
    role: payload.role,
  });

  const res = NextResponse.json({ success: true });
  res.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, newAccessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60,
  });

  return res;
}
```

- [ ] **Step 4: Implement logout route**

```ts
// app/api/v1/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/server/auth/constants";
import { redis } from "@/server/redis";
import { clearAuthCookies } from "@/server/auth/session";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(AUTH_COOKIE.REFRESH_TOKEN)?.value;

  // Blacklist the refresh token for 7 days (its max lifespan)
  if (refreshToken) {
    await redis.set(`blacklist:${refreshToken}`, "1", "EX", 7 * 24 * 60 * 60);
  }

  const res = NextResponse.json({ success: true });
  clearAuthCookies(res);

  return res;
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npm test -- tests/integration/auth/logout-refresh.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 6: Commit**

```bash
git add app/api/v1/auth/logout/ app/api/v1/auth/refresh/ tests/integration/auth/logout-refresh.test.ts
git commit -m "feat: add logout (token blacklist) and refresh endpoints"
```

---

## Task 17: GET /api/v1/users/me

**Files:**
- Create: `app/api/v1/users/me/route.ts`
- Test: `tests/integration/users/me.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/integration/users/me.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/v1/users/me/route";
import { signAccessToken } from "@/server/auth/jwt";
import { AUTH_COOKIE } from "@/server/auth/constants";
import { cleanDatabase } from "../../helpers/db";
import { createTestUser } from "../../helpers/auth";
import type { TokenPayload } from "@/types/auth";

describe("GET /api/v1/users/me", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it("returns current user when authenticated", async () => {
    const user = await createTestUser({ email: "me@test.com", name: "Me" });
    const token = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const req = new NextRequest("http://localhost/api/v1/users/me");
    req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);

    const res = await GET(req, { params: {} });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.user.email).toBe("me@test.com");
    expect(body.user.name).toBe("Me");
    expect(body.user.passwordHash).toBeUndefined();
  });

  it("returns 401 when not authenticated", async () => {
    const req = new NextRequest("http://localhost/api/v1/users/me");
    const res = await GET(req, { params: {} });
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/integration/users/me.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement /users/me route**

```ts
// app/api/v1/users/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthContext } from "@/server/middleware/with-auth";
import { findUserById } from "@/server/services/user.service";
import { jsonError } from "@/server/http";

export const GET = withAuth(async (_req: NextRequest, { user }: AuthContext) => {
  const dbUser = await findUserById(user.sub);
  if (!dbUser) {
    return jsonError("User not found", 404);
  }

  return NextResponse.json({
    user: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      phone: dbUser.phone,
      role: dbUser.role,
      avatar: dbUser.avatar,
      createdAt: dbUser.createdAt,
    },
  });
});
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/integration/users/me.test.ts
```

Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/api/v1/users/me/ tests/integration/users/me.test.ts
git commit -m "feat: add GET /api/v1/users/me endpoint"
```

---

## Task 18: Student Register Page UI

**Files:**
- Create: `app/(auth)/register/page.tsx`

- [ ] **Step 1: Create student register page**

```tsx
// app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
      confirmPassword: form.get("confirmPassword"),
      phone: form.get("phone") || undefined,
      gender: form.get("gender") || undefined,
      country: form.get("country") || undefined,
    };

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Registration failed");
        return;
      }

      router.push("/");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Student Registration</h1>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Mobile (optional)
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
              Gender (optional)
            </label>
            <select
              id="gender"
              name="gender"
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Country (optional)
            </label>
            <input
              id="country"
              name="country"
              type="text"
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/sign-in" className="text-blue-600 hover:underline">
            Sign In
          </a>
        </p>
        <p className="mt-2 text-center text-sm text-gray-600">
          Are you a partner?{" "}
          <a href="/partner-register" className="text-blue-600 hover:underline">
            Register as Partner
          </a>
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify page renders**

```bash
npm run dev
```

Open http://localhost:3000/register — form should render with name, email, phone, gender, country, password, confirmPassword fields.

- [ ] **Step 3: Commit**

```bash
git add app/\(auth\)/register/
git commit -m "feat: add student register page UI"
```

---

## Task 19: Student Sign-In Page UI

**Files:**
- Create: `app/(auth)/sign-in/page.tsx`

- [ ] **Step 1: Create student sign-in page**

```tsx
// app/(auth)/sign-in/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentSignInPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      email: form.get("email"),
      password: form.get("password"),
      rememberMe: form.get("rememberMe") === "on",
    };

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Login failed");
        return;
      }

      router.push("/user/dashboard");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Student Sign In</h1>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" name="rememberMe" className="rounded border-gray-300" />
              Stay logged in 30 days
            </label>
            <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "SIGN IN"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Register
          </a>
        </p>
        <p className="mt-2 text-center text-sm text-gray-600">
          Are you a partner?{" "}
          <a href="/partner-sign-in" className="text-blue-600 hover:underline">
            Partner Sign In
          </a>
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify page renders**

```bash
npm run dev
```

Open http://localhost:3000/sign-in — form should render with email, password, "Stay logged in 30 days" checkbox, forgot password link.

- [ ] **Step 3: Commit**

```bash
git add app/\(auth\)/sign-in/
git commit -m "feat: add student sign-in page UI"
```

---

## Task 20: POST /api/v1/auth/partner-register

**Files:**
- Create: `app/api/v1/auth/partner-register/route.ts`
- Test: `tests/integration/auth/partner-register.test.ts`

- [ ] **Step 1: Write the failing integration test**

```ts
// tests/integration/auth/partner-register.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/v1/auth/partner-register/route";
import { cleanDatabase, testPrisma } from "../../helpers/db";

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/v1/auth/partner-register", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/v1/auth/partner-register", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it("registers a partner with inactive status", async () => {
    const res = await POST(makeRequest({
      name: "Partner Corp",
      email: "partner@example.com",
      password: "securepass123",
      confirmPassword: "securepass123",
      gender: "male",
      country: "Bangladesh",
    }));

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.user.role).toBe("partner");
    expect(body.user.status).toBe("inactive");

    const dbUser = await testPrisma.user.findUnique({
      where: { email: "partner@example.com" },
    });
    expect(dbUser).not.toBeNull();
    expect(dbUser!.status).toBe("inactive");
    expect(dbUser!.role).toBe("partner");
  });

  it("does not set auth cookies (inactive account)", async () => {
    const res = await POST(makeRequest({
      name: "Partner2",
      email: "partner2@example.com",
      password: "securepass123",
      confirmPassword: "securepass123",
      gender: "female",
      country: "Thailand",
    }));

    expect(res.status).toBe(201);
    const cookies = res.headers.getSetCookie();
    expect(cookies.length).toBe(0);
  });

  it("returns 400 when required fields missing", async () => {
    const res = await POST(makeRequest({
      name: "Incomplete",
      email: "inc@example.com",
      password: "securepass123",
      confirmPassword: "securepass123",
    }));
    expect(res.status).toBe(400);
  });

  it("returns 409 for duplicate email", async () => {
    await POST(makeRequest({
      name: "First",
      email: "dup@example.com",
      password: "securepass123",
      confirmPassword: "securepass123",
      gender: "male",
      country: "China",
    }));

    const res = await POST(makeRequest({
      name: "Second",
      email: "dup@example.com",
      password: "securepass456",
      confirmPassword: "securepass456",
      gender: "male",
      country: "China",
    }));

    expect(res.status).toBe(409);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/integration/auth/partner-register.test.ts
```

Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement partner-register route**

```ts
// app/api/v1/auth/partner-register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { partnerRegisterSchema } from "@/server/validators/auth";
import { createUser, findUserByEmail } from "@/server/services/user.service";
import { jsonError } from "@/server/http";
import { withRateLimit } from "@/server/middleware/with-rate-limit";
import { sendEmail } from "@/server/email/mailer";
import { welcomeEmailHtml } from "@/server/email/templates/welcome";

async function handler(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request", 400);
  }

  const parsed = partnerRegisterSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request", 400, parsed.error.flatten());
  }

  const existing = await findUserByEmail(parsed.data.email);
  if (existing) {
    return jsonError("Email already registered", 409);
  }

  const user = await createUser(parsed.data, "partner");

  // No auth cookies — account is inactive until admin activates

  sendEmail({
    to: user.email,
    subject: "Partner Registration Received",
    html: welcomeEmailHtml(user.name),
  }).catch((err) => {
    console.error("Failed to send welcome email:", err);
  });

  return NextResponse.json(
    {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
      message: "Registration successful. Your account is inactive — please contact the administrator to activate your account.",
    },
    { status: 201 },
  );
}

export const POST = withRateLimit(
  "auth:partner-register",
  { limit: 5, windowSec: 900 },
  handler,
);
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/integration/auth/partner-register.test.ts
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/api/v1/auth/partner-register/ tests/integration/auth/partner-register.test.ts
git commit -m "feat: add POST /api/v1/auth/partner-register endpoint"
```

---

## Task 21: Partner Register Page UI

**Files:**
- Create: `app/(auth)/partner-register/page.tsx`

- [ ] **Step 1: Create partner register page**

```tsx
// app/(auth)/partner-register/page.tsx
"use client";

import { useState } from "react";

export default function PartnerRegisterPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
      confirmPassword: form.get("confirmPassword"),
      gender: form.get("gender"),
      country: form.get("country"),
    };

    try {
      const res = await fetch("/api/v1/auth/partner-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Registration failed");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Registration Received</h1>
          <p className="text-gray-600">
            Your partner account has been created. It is currently <strong>inactive</strong>.
            Please contact the administrator to activate your account.
          </p>
          <a
            href="/partner-sign-in"
            className="mt-6 inline-block rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Go to Partner Sign In
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Become a Partner</h1>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name / Organization
            </label>
            <input id="name" name="name" type="text" required
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input id="email" name="email" type="email" required
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
              Gender
            </label>
            <select id="gender" name="gender" required
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <input id="country" name="country" type="text" required
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input id="password" name="password" type="password" required minLength={8}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input id="confirmPassword" name="confirmPassword" type="password" required minLength={8}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Submitting..." : "Register as Partner"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already a partner?{" "}
          <a href="/partner-sign-in" className="text-blue-600 hover:underline">
            Sign In
          </a>
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify page renders**

```bash
npm run dev
```

Open http://localhost:3000/partner-register — form with name, email, gender (required), country (required), password, confirmPassword. After submit shows "inactive" message.

- [ ] **Step 3: Commit**

```bash
git add app/\(auth\)/partner-register/
git commit -m "feat: add partner register page UI"
```

---

## Task 22: Partner Sign-In Page UI

**Files:**
- Create: `app/(auth)/partner-sign-in/page.tsx`

- [ ] **Step 1: Create partner sign-in page**

```tsx
// app/(auth)/partner-sign-in/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PartnerSignInPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      email: form.get("email"),
      password: form.get("password"),
      rememberMe: form.get("rememberMe") === "on",
    };

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Login failed");
        return;
      }

      router.push("/user/dashboard");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Partner Sign In</h1>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input id="email" name="email" type="email" required
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input id="password" name="password" type="password" required
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" name="rememberMe" className="rounded border-gray-300" />
              Stay logged in 30 days
            </label>
            <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </a>
          </div>

          <button type="submit" disabled={loading}
            className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Signing in..." : "SIGN IN"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have a partner account?{" "}
          <a href="/partner-register" className="text-blue-600 hover:underline">
            Register as Partner
          </a>
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify page renders**

```bash
npm run dev
```

Open http://localhost:3000/partner-sign-in — same layout as student sign-in but titled "Partner Sign In".

- [ ] **Step 3: Commit**

```bash
git add app/\(auth\)/partner-sign-in/
git commit -m "feat: add partner sign-in page UI"
```

---

## Task 23: Admin Login Page UI

**Files:**
- Create: `app/(auth)/login/page.tsx`

- [ ] **Step 1: Create admin login page**

Admin login is at `/login` (matching malishaedu's pattern). No registration link — admins are created via seed/internal only.

```tsx
// app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      email: form.get("email"),
      password: form.get("password"),
    };

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Login failed");
        return;
      }

      const data = await res.json();
      if (data.user.role !== "admin") {
        setError("Access denied — admin accounts only");
        return;
      }

      router.push("/admin/dashboard");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Hello, Admin!</h1>
        <p className="mb-6 text-sm text-gray-500">Sign in to the admin panel</p>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input id="email" name="email" type="email" required
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input id="password" name="password" type="password" required
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Signing in..." : "SIGN IN"}
          </button>
        </form>

        <p className="mt-4 text-center">
          <a href="/admin-forgot-password" className="text-sm text-blue-600 hover:underline">
            Reset Password
          </a>
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify page renders**

```bash
npm run dev
```

Open http://localhost:3000/login — "Hello, Admin!" page with email + password + SIGN IN. No registration link.

- [ ] **Step 3: Commit**

```bash
git add app/\(auth\)/login/
git commit -m "feat: add admin login page UI"
```

---

## Task 24: Forgot Password + Reset Password API

**Files:**
- Create: `app/api/v1/auth/forgot-password/route.ts`
- Create: `app/api/v1/auth/reset-password/route.ts`
- Create: `src/server/email/templates/reset-password.ts`
- Test: `tests/integration/auth/forgot-password.test.ts`

- [ ] **Step 1: Create reset password email template**

```ts
// src/server/email/templates/reset-password.ts
export function resetPasswordEmailHtml(name: string, resetUrl: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">Reset Your Password</h1>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click the button below to set a new password:</p>
      <a href="${resetUrl}"
         style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Reset Password
      </a>
      <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
    </div>
  `;
}
```

- [ ] **Step 2: Write integration tests**

```ts
// tests/integration/auth/forgot-password.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as forgotPost } from "@/app/api/v1/auth/forgot-password/route";
import { POST as resetPost } from "@/app/api/v1/auth/reset-password/route";
import { cleanDatabase, testPrisma } from "../../helpers/db";
import { createTestUser } from "../../helpers/auth";
import { hashPassword, comparePassword } from "@/server/auth/password";

vi.mock("@/server/email/mailer", () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

describe("Forgot/Reset Password flow", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it("returns 200 for forgot-password even if email not found (no leak)", async () => {
    const req = new NextRequest("http://localhost/api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: "nobody@test.com" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await forgotPost(req);
    expect(res.status).toBe(200);
  });

  it("returns 200 for forgot-password with valid email", async () => {
    const hash = await hashPassword("oldpass123");
    await createTestUser({ email: "user@test.com", passwordHash: hash });

    const req = new NextRequest("http://localhost/api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: "user@test.com" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await forgotPost(req);
    expect(res.status).toBe(200);
  });

  it("resets password with valid token", async () => {
    const hash = await hashPassword("oldpass123");
    const user = await createTestUser({ email: "reset@test.com", passwordHash: hash });

    // Generate token directly for testing
    const jwt = await import("jsonwebtoken");
    const token = jwt.default.sign(
      { sub: user.id, purpose: "password-reset" },
      process.env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-me-32chars!",
      { expiresIn: "1h" },
    );

    const req = new NextRequest("http://localhost/api/v1/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        token,
        password: "newpass456",
        confirmPassword: "newpass456",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await resetPost(req);
    expect(res.status).toBe(200);

    const updated = await testPrisma.user.findUnique({ where: { id: user.id } });
    const valid = await comparePassword("newpass456", updated!.passwordHash!);
    expect(valid).toBe(true);
  });

  it("returns 400 for invalid/expired token", async () => {
    const req = new NextRequest("http://localhost/api/v1/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        token: "invalid-token",
        password: "newpass456",
        confirmPassword: "newpass456",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await resetPost(req);
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 3: Implement forgot-password route**

```ts
// app/api/v1/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/server/validators/auth";
import { findUserByEmail } from "@/server/services/user.service";
import { jsonError } from "@/server/http";
import { withRateLimit } from "@/server/middleware/with-rate-limit";
import { sendEmail } from "@/server/email/mailer";
import { resetPasswordEmailHtml } from "@/server/email/templates/reset-password";
import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-me-32chars!";

async function handler(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request", 400);
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request", 400, parsed.error.flatten());
  }

  // Always return 200 to prevent email enumeration
  const user = await findUserByEmail(parsed.data.email);
  if (user) {
    const token = jwt.sign(
      { sub: user.id, purpose: "password-reset" },
      ACCESS_SECRET,
      { expiresIn: "1h" },
    );

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      html: resetPasswordEmailHtml(user.name, resetUrl),
    }).catch((err) => {
      console.error("Failed to send reset email:", err);
    });
  }

  return NextResponse.json({
    message: "If an account with that email exists, a password reset link has been sent.",
  });
}

export const POST = withRateLimit(
  "auth:forgot-password",
  { limit: 3, windowSec: 900 },
  handler,
);
```

- [ ] **Step 4: Implement reset-password route**

```ts
// app/api/v1/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { resetPasswordSchema } from "@/server/validators/auth";
import { findUserById } from "@/server/services/user.service";
import { hashPassword } from "@/server/auth/password";
import { jsonError } from "@/server/http";
import { withRateLimit } from "@/server/middleware/with-rate-limit";
import { prisma } from "@/server/db";
import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-me-32chars!";

async function handler(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request", 400);
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request", 400, parsed.error.flatten());
  }

  let payload: { sub: string; purpose: string };
  try {
    payload = jwt.verify(parsed.data.token, ACCESS_SECRET) as typeof payload;
  } catch {
    return jsonError("Invalid or expired reset token", 400);
  }

  if (payload.purpose !== "password-reset") {
    return jsonError("Invalid token", 400);
  }

  const user = await findUserById(payload.sub);
  if (!user) {
    return jsonError("User not found", 404);
  }

  const newHash = await hashPassword(parsed.data.password);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  return NextResponse.json({
    message: "Password has been reset successfully. You can now sign in.",
  });
}

export const POST = withRateLimit(
  "auth:reset-password",
  { limit: 5, windowSec: 900 },
  handler,
);
```

- [ ] **Step 5: Run tests**

```bash
npm test -- tests/integration/auth/forgot-password.test.ts
```

Expected: 4 tests pass.

- [ ] **Step 6: Commit**

```bash
git add app/api/v1/auth/forgot-password/ app/api/v1/auth/reset-password/ src/server/email/templates/reset-password.ts tests/integration/auth/forgot-password.test.ts
git commit -m "feat: add forgot-password and reset-password API endpoints"
```

---

## Task 25: Forgot Password + Reset Password Pages UI

**Files:**
- Create: `app/(auth)/forgot-password/page.tsx`
- Create: `app/(auth)/reset-password/page.tsx`

- [ ] **Step 1: Create forgot password page**

```tsx
// app/(auth)/forgot-password/page.tsx
"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email") }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Request failed");
        return;
      }

      setSent(true);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Forgot Password</h1>

        {sent ? (
          <div className="rounded bg-green-50 p-4 text-sm text-green-700">
            If an account with that email exists, a password reset link has been sent.
            Check your inbox.
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            <p className="mb-4 text-sm text-gray-600">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input id="email" name="email" type="email" required
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>

              <button type="submit" disabled={loading}
                className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        )}

        <p className="mt-4 text-center text-sm text-gray-600">
          <a href="/sign-in" className="text-blue-600 hover:underline">Back to Sign In</a>
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Create reset password page**

```tsx
// app/(auth)/reset-password/page.tsx
"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-600">Invalid Link</h1>
          <p className="text-gray-600">This password reset link is invalid or has expired.</p>
          <a href="/forgot-password" className="mt-4 inline-block text-blue-600 hover:underline">
            Request a new link
          </a>
        </div>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      token,
      password: form.get("password"),
      confirmPassword: form.get("confirmPassword"),
    };

    try {
      const res = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Reset failed");
        return;
      }

      router.push("/sign-in?reset=success");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Set New Password</h1>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input id="password" name="password" type="password" required minLength={8}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input id="confirmPassword" name="confirmPassword" type="password" required minLength={8}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Verify pages render**

```bash
npm run dev
```

1. Open http://localhost:3000/forgot-password — email input + send button
2. Open http://localhost:3000/reset-password — shows "Invalid Link" (no token)
3. Open http://localhost:3000/reset-password?token=test — shows password form

- [ ] **Step 4: Commit**

```bash
git add app/\(auth\)/forgot-password/ app/\(auth\)/reset-password/
git commit -m "feat: add forgot-password and reset-password page UI"
```

---

## Task 26: Seed Script (Admin User)

**Files:**
- Create: `prisma/seed.ts`

- [ ] **Step 1: Create seed script**

```ts
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@educonsultancy.com";

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existing) {
    console.log(`Admin user already exists: ${adminEmail}`);
    return;
  }

  const passwordHash = await bcrypt.hash("admin1234", 12);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: "Admin",
      passwordHash,
      role: "admin",
    },
  });

  console.log(`Created admin user: ${admin.email} (ID: ${admin.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 2: Run seed**

```bash
npx prisma db seed
```

Expected: `Created admin user: admin@educonsultancy.com (ID: ...)`.

- [ ] **Step 3: Verify admin can log in**

```bash
curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@educonsultancy.com","password":"admin1234"}' \
  -c - | head -20
```

Expected: 200 response with `user.role: "admin"` and set-cookie headers.

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.ts
git commit -m "feat: add seed script with admin user"
```

---

## Task 27: Full Verification + README

**Files:**
- Create/Update: `README.md` (minimal dev setup instructions)

- [ ] **Step 1: Run all tests**

```bash
npx prisma migrate dev
npm test
```

Expected: All tests pass (smoke + password + JWT + withAuth + withRole + withValidation + user service + register + partner-register + login + logout/refresh + forgot/reset password + /me).

- [ ] **Step 2: Manual smoke test**

```bash
npm run dev
```

1. Open http://localhost:3000 — home page renders
2. Open http://localhost:3000/register — student register with name, email, phone, gender, country, password, confirmPassword
3. After register, redirected to `/user/dashboard`
4. Open http://localhost:3000/sign-in — student sign in with email, password, "Stay logged in 30 days" checkbox
5. Check cookies in DevTools → Application → Cookies: `access_token` and `refresh_token` present
6. Open http://localhost:3000/partner-register — partner register form (gender + country required)
7. After partner register, shows "inactive account" message (no redirect)
8. Open http://localhost:3000/partner-sign-in — partner sign in (mirrors student layout)
9. Open http://localhost:3000/login — admin "Hello, Admin!" login page
10. Login with admin@educonsultancy.com / admin1234 — redirects to `/admin/dashboard`
11. Open http://localhost:3000/forgot-password — email input to request reset link
12. Open http://localhost:3000/reset-password?token=test — password reset form (invalid token shows error on submit)

- [ ] **Step 3: Add minimal README section**

Add this section to `README.md`:

```markdown
## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 16+ (`brew install postgresql@16 && brew services start postgresql@16`)
- Redis 7+ (`brew install redis && brew services start redis`)

### Getting Started

```bash
# Create database
createdb edu_consultancy_dev

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Run database migrations
npx prisma migrate dev

# Seed admin user (admin@educonsultancy.com / admin1234)
npx prisma db seed

# Start dev server
npm run dev
```

### Running Tests

```bash
npm test          # run all tests once
npm run test:watch  # watch mode
```
```

- [ ] **Step 4: Final commit**

```bash
git add README.md
git commit -m "docs: add development setup instructions"
```

---

## Summary

After completing all 27 tasks, the project has:

- **Next.js 14 app** with Tailwind CSS, TypeScript, ESLint
- **Local dev environment** with PostgreSQL (Homebrew) + Redis (Homebrew)
- **Prisma schema** with User (gender, country, continent, status), StudentProfile (passportNid, experience, language, address), PartnerProfile (level), Certificate models
- **JWT auth** with access tokens (15min) + refresh tokens (7day / 30day with "remember me") in httpOnly cookies
- **Refresh token blacklisting** via Redis
- **8 API endpoints:**
  - `POST /auth/register` — student registration (name, email, password, confirmPassword, phone, gender, country)
  - `POST /auth/partner-register` — partner registration (→ inactive status, no cookies)
  - `POST /auth/login` — email+password login for all roles, with rememberMe support
  - `POST /auth/logout` — clear cookies, blacklist refresh token
  - `POST /auth/refresh` — rotate access token
  - `POST /auth/forgot-password` — send password reset email (no email leak)
  - `POST /auth/reset-password` — reset password with JWT token
  - `GET /users/me` — current user profile
- **Middleware HOFs:** withAuth, withRole, withValidation, withRateLimit
- **Email service** with Nodemailer (welcome email + password reset email)
- **7 UI pages:**
  - `/register` — student registration (name, email, phone, gender, country, password, confirmPassword)
  - `/sign-in` — student login with "Stay logged in 30 days" checkbox + forgot password link
  - `/partner-register` — partner registration (gender + country required) → inactive confirmation
  - `/partner-sign-in` — partner login (same fields as student sign-in)
  - `/login` — admin "Hello, Admin!" login (no registration link)
  - `/forgot-password` — email input to request reset link
  - `/reset-password` — new password form (token from email link)
- **Admin seed user** (admin@educonsultancy.com / admin1234)
- **Test suite** with Vitest (unit + integration tests)

**Not included (deferred):**
- Google OAuth (Plan 1B or later — needs Google Cloud setup)
- i18n wrapping (Plan 9)
- Full UI styling/layout (later plans)
