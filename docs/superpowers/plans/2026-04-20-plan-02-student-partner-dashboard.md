# Plan 02: Student & Partner Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full authenticated dashboard for students and partners — shell layout, stat cards, charts, application management, event registration, profile editing with file uploads, notifications, and partner-specific features.

**Architecture:** Route-per-feature with shared Next.js App Router layout. `app/(dashboard)/layout.tsx` provides the sidebar and top bar. Each page is an independent route under `/user/*`. All API endpoints are protected by `withAuth`/`withRole` middleware from Plan 01.

**Tech Stack:** Next.js 14, Prisma, Tailwind CSS, recharts (charts), xlsx (Excel export), jspdf + jspdf-autotable (PDF export), Vitest (testing)

---

## Task 1: Install New Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime dependencies**

```bash
npm install recharts xlsx jspdf jspdf-autotable
```

- [ ] **Step 2: Install type dependencies**

```bash
npm install -D @types/jspdf
```

Note: `recharts` and `xlsx` include their own types. `jspdf-autotable` augments `jspdf` types.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add recharts, xlsx, jspdf dependencies for dashboard"
```

---

## Task 2: Prisma Schema — New Models + User Relations

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `tests/helpers/db.ts`

- [ ] **Step 1: Add enums and models to schema**

Add these to the end of `prisma/schema.prisma` (before no other content):

```prisma
enum FundType {
  self_funded
  scholarship
}

enum ApplicationStatus {
  pending
  approved
  rejected
  cancelled
}

model Application {
  id                 String            @id @default(uuid())
  applicationCode    String            @unique @map("application_code")
  userId             String            @map("user_id")
  user               User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  programName        String            @map("program_name")
  universityName     String            @map("university_name")
  degree             String?
  language           String?
  fundType           FundType          @default(self_funded) @map("fund_type")
  status             ApplicationStatus @default(pending)
  applicationFee     Decimal           @default(0) @map("application_fee") @db.Decimal(10, 2)
  applicationFeePaid Decimal           @default(0) @map("application_fee_paid") @db.Decimal(10, 2)
  serviceCharge      Decimal           @default(0) @map("service_charge") @db.Decimal(10, 2)
  serviceChargePaid  Decimal           @default(0) @map("service_charge_paid") @db.Decimal(10, 2)
  appliedAt          DateTime          @default(now()) @map("applied_at")
  updatedAt          DateTime          @updatedAt @map("updated_at")

  @@map("applications")
}

enum EventStatus {
  upcoming
  ongoing
  past
}

model Event {
  id            String        @id @default(uuid())
  name          String
  startDate     DateTime      @map("start_date")
  endDate       DateTime      @map("end_date")
  price         Decimal       @default(0) @db.Decimal(10, 2)
  category      String?
  location      String?
  description   String?
  image         String?
  status        EventStatus   @default(upcoming)
  createdAt     DateTime      @default(now()) @map("created_at")

  registrations EventRegistration[]

  @@map("events")
}

enum PaymentStatus {
  pending
  paid
  failed
}

model EventRegistration {
  id            String        @id @default(uuid())
  userId        String        @map("user_id")
  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  eventId       String        @map("event_id")
  event         Event         @relation(fields: [eventId], references: [id], onDelete: Cascade)
  orderDate     DateTime      @default(now()) @map("order_date")
  paymentStatus PaymentStatus @default(pending) @map("payment_status")
  createdAt     DateTime      @default(now()) @map("created_at")

  @@unique([userId, eventId])
  @@map("event_registrations")
}

model Notification {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String
  message   String
  isRead    Boolean  @default(false) @map("is_read")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("notifications")
}
```

- [ ] **Step 2: Add relations to existing User model**

In the `User` model, add these lines after the existing `certificates Certificate[]` line:

```prisma
  applications       Application[]
  eventRegistrations EventRegistration[]
  notifications      Notification[]
```

- [ ] **Step 3: Run migration**

```bash
npx prisma migrate dev --name add-applications-events-notifications
```

Expected: Migration succeeds, new tables created.

- [ ] **Step 4: Update cleanDatabase helper**

Update `tests/helpers/db.ts` to delete new tables in correct FK order:

```ts
// tests/helpers/db.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function cleanDatabase() {
  await prisma.notification.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.application.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.partnerProfile.deleteMany();
  await prisma.user.deleteMany();
}

export { prisma as testPrisma };
```

- [ ] **Step 5: Verify existing tests still pass**

```bash
npm test
```

Expected: All 46 existing tests pass.

- [ ] **Step 6: Commit**

```bash
git add prisma/ tests/helpers/db.ts
git commit -m "feat: add Application, Event, EventRegistration, Notification models"
```

---

## Task 3: Upload Service (Local Filesystem)

**Files:**
- Create: `src/server/services/upload.service.ts`
- Test: `tests/unit/services/upload.service.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/services/upload.service.test.ts
import { describe, it, expect, afterEach } from "vitest";
import { uploadFile, deleteFile } from "@/server/services/upload.service";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

describe("upload.service", () => {
  const createdFiles: string[] = [];

  afterEach(() => {
    for (const f of createdFiles) {
      try { fs.unlinkSync(f); } catch {}
    }
    createdFiles.length = 0;
  });

  it("uploads a file and returns url + key", async () => {
    const buffer = Buffer.from("fake image data");
    const result = await uploadFile(buffer, "test-photo.png", "avatars");

    expect(result.url).toMatch(/^\/uploads\/avatars\//);
    expect(result.url).toContain("test-photo.png");
    expect(result.key).toBeDefined();

    const fullPath = path.join(process.cwd(), "public", result.url);
    expect(fs.existsSync(fullPath)).toBe(true);
    createdFiles.push(fullPath);
  });

  it("sanitizes filenames", async () => {
    const buffer = Buffer.from("data");
    const result = await uploadFile(buffer, "My File (1).PNG", "certificates");

    expect(result.url).toMatch(/my-file-1\.png/);
    createdFiles.push(path.join(process.cwd(), "public", result.url));
  });

  it("deletes a file by key", async () => {
    const buffer = Buffer.from("delete me");
    const result = await uploadFile(buffer, "todelete.png", "avatars");
    const fullPath = path.join(process.cwd(), "public", result.url);
    createdFiles.push(fullPath);

    expect(fs.existsSync(fullPath)).toBe(true);
    await deleteFile(result.key);
    expect(fs.existsSync(fullPath)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/unit/services/upload.service.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement upload service**

```ts
// src/server/services/upload.service.ts
import fs from "fs";
import path from "path";

export interface UploadResult {
  url: string;
  key: string;
}

function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.\-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  folder: string,
): Promise<UploadResult> {
  const sanitized = sanitizeFilename(filename);
  const timestamp = Date.now();
  const finalName = `${timestamp}-${sanitized}`;
  const relativePath = `/uploads/${folder}/${finalName}`;
  const fullDir = path.join(process.cwd(), "public", "uploads", folder);
  const fullPath = path.join(fullDir, finalName);

  fs.mkdirSync(fullDir, { recursive: true });
  fs.writeFileSync(fullPath, buffer);

  return {
    url: relativePath,
    key: relativePath,
  };
}

export async function deleteFile(key: string): Promise<void> {
  const fullPath = path.join(process.cwd(), "public", key);
  try {
    fs.unlinkSync(fullPath);
  } catch {
    // File already deleted or doesn't exist — no-op
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/unit/services/upload.service.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 5: Add uploads directory to .gitignore**

Add to `.gitignore`:

```
public/uploads/
```

- [ ] **Step 6: Commit**

```bash
git add src/server/services/upload.service.ts tests/unit/services/upload.service.test.ts .gitignore
git commit -m "feat: add local filesystem upload service"
```

---

## Task 4: Application Service (CRUD + Code Generation)

**Files:**
- Create: `src/server/services/application.service.ts`
- Test: `tests/unit/services/application.service.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/services/application.service.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import {
  createApplication,
  listApplications,
  cancelApplication,
  getDashboardStats,
} from "@/server/services/application.service";
import { cleanDatabase, testPrisma } from "../../helpers/db";
import { createTestUser } from "../../helpers/auth";

describe("application.service", () => {
  let userId: string;

  beforeEach(async () => {
    await cleanDatabase();
    const user = await createTestUser({ email: "app@test.com" });
    userId = user.id;
  });

  it("creates an application with auto-generated code", async () => {
    const app = await createApplication({
      userId,
      programName: "CS Masters",
      universityName: "Beijing University",
      degree: "Master",
      language: "English",
      fundType: "self_funded",
    });

    expect(app.id).toBeDefined();
    expect(app.applicationCode).toMatch(/^APP-\d{8}-\d{3}$/);
    expect(app.status).toBe("pending");
    expect(app.programName).toBe("CS Masters");
  });

  it("generates sequential codes on the same day", async () => {
    const app1 = await createApplication({
      userId,
      programName: "Program A",
      universityName: "Uni A",
    });
    const app2 = await createApplication({
      userId,
      programName: "Program B",
      universityName: "Uni B",
    });

    const code1Num = parseInt(app1.applicationCode.split("-")[2]);
    const code2Num = parseInt(app2.applicationCode.split("-")[2]);
    expect(code2Num).toBe(code1Num + 1);
  });

  it("lists applications with pagination", async () => {
    for (let i = 0; i < 15; i++) {
      await createApplication({
        userId,
        programName: `Program ${i}`,
        universityName: `Uni ${i}`,
      });
    }

    const result = await listApplications(userId, { page: 1, limit: 10 });
    expect(result.applications.length).toBe(10);
    expect(result.pagination.total).toBe(15);
    expect(result.pagination.totalPages).toBe(2);

    const page2 = await listApplications(userId, { page: 2, limit: 10 });
    expect(page2.applications.length).toBe(5);
  });

  it("filters applications by status", async () => {
    const app = await createApplication({
      userId,
      programName: "Approved One",
      universityName: "Uni",
    });
    await testPrisma.application.update({
      where: { id: app.id },
      data: { status: "approved" },
    });
    await createApplication({
      userId,
      programName: "Pending One",
      universityName: "Uni",
    });

    const result = await listApplications(userId, {
      page: 1,
      limit: 10,
      status: "approved",
    });
    expect(result.applications.length).toBe(1);
    expect(result.applications[0].programName).toBe("Approved One");
  });

  it("cancels a pending application", async () => {
    const app = await createApplication({
      userId,
      programName: "To Cancel",
      universityName: "Uni",
    });

    const cancelled = await cancelApplication(app.id, userId);
    expect(cancelled.status).toBe("cancelled");
  });

  it("throws when cancelling non-pending application", async () => {
    const app = await createApplication({
      userId,
      programName: "Approved",
      universityName: "Uni",
    });
    await testPrisma.application.update({
      where: { id: app.id },
      data: { status: "approved" },
    });

    await expect(cancelApplication(app.id, userId)).rejects.toThrow();
  });

  it("returns dashboard stats", async () => {
    await createApplication({
      userId,
      programName: "P1",
      universityName: "U1",
    });
    await testPrisma.application.updateMany({
      data: {
        applicationFee: 1000,
        applicationFeePaid: 500,
        serviceCharge: 800,
        serviceChargePaid: 300,
      },
    });

    const stats = await getDashboardStats(userId);
    expect(stats.totalApplications).toBe(1);
    expect(Number(stats.applicationFeesPaid)).toBe(500);
    expect(Number(stats.serviceCharge)).toBe(800);
    expect(Number(stats.serviceChargePaid)).toBe(300);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/unit/services/application.service.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement application service**

```ts
// src/server/services/application.service.ts
import { prisma } from "@/server/db";
import type { ApplicationStatus, FundType } from "@prisma/client";

interface CreateApplicationInput {
  userId: string;
  programName: string;
  universityName: string;
  degree?: string;
  language?: string;
  fundType?: FundType;
}

interface ListOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  fundType?: FundType;
  status?: ApplicationStatus;
  search?: string;
  university?: string;
  degree?: string;
}

async function generateApplicationCode(): Promise<string> {
  const today = new Date();
  const dateStr =
    today.getFullYear().toString() +
    (today.getMonth() + 1).toString().padStart(2, "0") +
    today.getDate().toString().padStart(2, "0");

  const prefix = `APP-${dateStr}-`;

  const latest = await prisma.application.findFirst({
    where: { applicationCode: { startsWith: prefix } },
    orderBy: { applicationCode: "desc" },
  });

  let seq = 1;
  if (latest) {
    const lastSeq = parseInt(latest.applicationCode.split("-")[2]);
    seq = lastSeq + 1;
  }

  return `${prefix}${seq.toString().padStart(3, "0")}`;
}

export async function createApplication(input: CreateApplicationInput) {
  const applicationCode = await generateApplicationCode();

  return prisma.application.create({
    data: {
      applicationCode,
      userId: input.userId,
      programName: input.programName,
      universityName: input.universityName,
      degree: input.degree ?? null,
      language: input.language ?? null,
      fundType: input.fundType ?? "self_funded",
    },
  });
}

export async function listApplications(userId: string, options: ListOptions) {
  const where: Record<string, unknown> = { userId };

  if (options.fundType) where.fundType = options.fundType;
  if (options.status) where.status = options.status;
  if (options.university) where.universityName = { contains: options.university, mode: "insensitive" };
  if (options.degree) where.degree = { contains: options.degree, mode: "insensitive" };
  if (options.search) {
    where.OR = [
      { programName: { contains: options.search, mode: "insensitive" } },
      { universityName: { contains: options.search, mode: "insensitive" } },
      { applicationCode: { contains: options.search, mode: "insensitive" } },
    ];
  }

  const orderBy: Record<string, string> = {};
  const sortField = options.sortBy ?? "appliedAt";
  orderBy[sortField] = options.sortOrder ?? "desc";

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      orderBy,
      skip: (options.page - 1) * options.limit,
      take: options.limit,
    }),
    prisma.application.count({ where }),
  ]);

  return {
    applications,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: Math.ceil(total / options.limit),
    },
  };
}

export async function cancelApplication(applicationId: string, userId: string) {
  const app = await prisma.application.findFirst({
    where: { id: applicationId, userId },
  });

  if (!app) throw new Error("Application not found");
  if (app.status !== "pending") throw new Error("Only pending applications can be cancelled");

  return prisma.application.update({
    where: { id: applicationId },
    data: { status: "cancelled" },
  });
}

export async function getDashboardStats(userId: string) {
  const apps = await prisma.application.findMany({ where: { userId } });

  const totalApplications = apps.length;
  const applicationFeesPaid = apps.reduce((sum, a) => sum + Number(a.applicationFeePaid), 0);
  const serviceCharge = apps.reduce((sum, a) => sum + Number(a.serviceCharge), 0);
  const serviceChargePaid = apps.reduce((sum, a) => sum + Number(a.serviceChargePaid), 0);

  return {
    totalApplications,
    applicationFeesPaid,
    serviceCharge,
    serviceChargePaid,
  };
}

export async function getApplicationHistory(userId: string) {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const apps = await prisma.application.findMany({
    where: { userId, appliedAt: { gte: twelveMonthsAgo } },
    select: { appliedAt: true, status: true },
  });

  const months: Record<string, { applications: number; approved: number }> = {};
  for (const app of apps) {
    const key = `${app.appliedAt.getFullYear()}-${(app.appliedAt.getMonth() + 1).toString().padStart(2, "0")}`;
    if (!months[key]) months[key] = { applications: 0, approved: 0 };
    months[key].applications++;
    if (app.status === "approved") months[key].approved++;
  }

  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month, ...data }));
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/unit/services/application.service.test.ts
```

Expected: 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/server/services/application.service.ts tests/unit/services/application.service.test.ts
git commit -m "feat: add application service with CRUD, code generation, stats"
```

---

## Task 5: Notification Service

**Files:**
- Create: `src/server/services/notification.service.ts`
- Test: `tests/unit/services/notification.service.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/services/notification.service.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import {
  createNotification,
  listNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from "@/server/services/notification.service";
import { cleanDatabase } from "../../helpers/db";
import { createTestUser } from "../../helpers/auth";

describe("notification.service", () => {
  let userId: string;

  beforeEach(async () => {
    await cleanDatabase();
    const user = await createTestUser({ email: "notif@test.com" });
    userId = user.id;
  });

  it("creates a notification", async () => {
    const n = await createNotification({
      userId,
      title: "Welcome",
      message: "Welcome to the platform!",
    });

    expect(n.id).toBeDefined();
    expect(n.title).toBe("Welcome");
    expect(n.isRead).toBe(false);
  });

  it("lists notifications with pagination", async () => {
    for (let i = 0; i < 5; i++) {
      await createNotification({ userId, title: `N${i}`, message: `Msg ${i}` });
    }

    const result = await listNotifications(userId, { page: 1, limit: 3 });
    expect(result.notifications.length).toBe(3);
    expect(result.pagination.total).toBe(5);
  });

  it("marks a single notification as read", async () => {
    const n = await createNotification({ userId, title: "Read me", message: "msg" });
    expect(n.isRead).toBe(false);

    const updated = await markAsRead(n.id, userId);
    expect(updated.isRead).toBe(true);
  });

  it("marks all notifications as read", async () => {
    await createNotification({ userId, title: "N1", message: "m1" });
    await createNotification({ userId, title: "N2", message: "m2" });

    const count = await markAllAsRead(userId);
    expect(count).toBe(2);
  });

  it("returns unread count", async () => {
    await createNotification({ userId, title: "N1", message: "m1" });
    await createNotification({ userId, title: "N2", message: "m2" });
    const n3 = await createNotification({ userId, title: "N3", message: "m3" });
    await markAsRead(n3.id, userId);

    const count = await getUnreadCount(userId);
    expect(count).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/unit/services/notification.service.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement notification service**

```ts
// src/server/services/notification.service.ts
import { prisma } from "@/server/db";

interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
}

interface ListOptions {
  page: number;
  limit: number;
}

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      message: input.message,
    },
  });
}

export async function listNotifications(userId: string, options: ListOptions) {
  const where = { userId };

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    notifications,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: Math.ceil(total / options.limit),
    },
  };
}

export async function markAsRead(notificationId: string, userId: string) {
  return prisma.notification.update({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId: string) {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  return result.count;
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/unit/services/notification.service.test.ts
```

Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/server/services/notification.service.ts tests/unit/services/notification.service.test.ts
git commit -m "feat: add notification service with CRUD, mark read, unread count"
```

---

## Task 6: Profile Service (Update Profile + Change Password)

**Files:**
- Create: `src/server/services/profile.service.ts`
- Test: `tests/unit/services/profile.service.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/services/profile.service.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/unit/services/profile.service.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement profile service**

```ts
// src/server/services/profile.service.ts
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/unit/services/profile.service.test.ts
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/server/services/profile.service.ts tests/unit/services/profile.service.test.ts
git commit -m "feat: add profile service with update, change password"
```

---

## Task 7: Validators for Dashboard APIs

**Files:**
- Create: `src/server/validators/application.ts`
- Create: `src/server/validators/profile.ts`
- Create: `src/server/validators/notification.ts`

- [ ] **Step 1: Create application validators**

```ts
// src/server/validators/application.ts
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
```

- [ ] **Step 2: Create profile validators**

```ts
// src/server/validators/profile.ts
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
```

- [ ] **Step 3: Create notification validators**

```ts
// src/server/validators/notification.ts
import { z } from "zod";

export const listNotificationsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const markReadSchema = z.object({
  notificationId: z.string().uuid().optional(),
  all: z.boolean().optional(),
});
```

- [ ] **Step 4: Commit**

```bash
git add src/server/validators/application.ts src/server/validators/profile.ts src/server/validators/notification.ts
git commit -m "feat: add Zod validators for application, profile, notification APIs"
```

---

## Task 8: GET /api/v1/users/dashboard-stats

**Files:**
- Create: `app/api/v1/users/dashboard-stats/route.ts`
- Test: `tests/integration/users/dashboard-stats.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/integration/users/dashboard-stats.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/v1/users/dashboard-stats/route";
import { signAccessToken } from "@/server/auth/jwt";
import { AUTH_COOKIE } from "@/server/auth/constants";
import { cleanDatabase, testPrisma } from "../../helpers/db";
import { createTestUser } from "../../helpers/auth";

function makeAuthRequest(token: string) {
  const req = new NextRequest("http://localhost/api/v1/users/dashboard-stats");
  req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);
  return req;
}

describe("GET /api/v1/users/dashboard-stats", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it("returns stats for student with no applications", async () => {
    const user = await createTestUser({ email: "stat@test.com" });
    const token = signAccessToken({ sub: user.id, email: user.email, role: user.role });

    const res = await GET(makeAuthRequest(token), { params: {} });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.stats.totalApplications).toBe(0);
    expect(body.stats.applicationFeesPaid).toBe(0);
    expect(body.charts.applicationHistory).toBeDefined();
  });

  it("returns stats with application data", async () => {
    const user = await createTestUser({ email: "stat2@test.com" });
    await testPrisma.application.create({
      data: {
        applicationCode: "APP-20260420-001",
        userId: user.id,
        programName: "CS",
        universityName: "MIT",
        applicationFee: 1000,
        applicationFeePaid: 500,
        serviceCharge: 800,
        serviceChargePaid: 300,
      },
    });

    const token = signAccessToken({ sub: user.id, email: user.email, role: user.role });
    const res = await GET(makeAuthRequest(token), { params: {} });
    const body = await res.json();

    expect(body.stats.totalApplications).toBe(1);
    expect(body.stats.applicationFeesPaid).toBe(500);
    expect(body.stats.serviceCharge).toBe(800);
  });

  it("includes partnerLevel for partner users", async () => {
    const user = await createTestUser({ email: "partner@test.com", role: "partner" });
    await testPrisma.partnerProfile.create({
      data: { userId: user.id, level: "beginner" },
    });

    const token = signAccessToken({ sub: user.id, email: user.email, role: "partner" });
    const res = await GET(makeAuthRequest(token), { params: {} });
    const body = await res.json();

    expect(body.stats.partnerLevel).toBe("beginner");
  });

  it("returns 401 without auth", async () => {
    const req = new NextRequest("http://localhost/api/v1/users/dashboard-stats");
    const res = await GET(req, { params: {} });
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/integration/users/dashboard-stats.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement dashboard-stats route**

```ts
// app/api/v1/users/dashboard-stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthContext } from "@/server/middleware/with-auth";
import { getDashboardStats, getApplicationHistory } from "@/server/services/application.service";
import { prisma } from "@/server/db";

export const GET = withAuth(async (_req: NextRequest, { user }: AuthContext) => {
  const stats = await getDashboardStats(user.sub);
  const applicationHistory = await getApplicationHistory(user.sub);

  const response: Record<string, unknown> = {
    stats: {
      ...stats,
    },
    charts: {
      applicationHistory,
      summary: {
        applications: stats.totalApplications,
        serviceCharge: stats.serviceCharge,
        applicationFees: stats.applicationFeesPaid,
      },
    },
  };

  if (user.role === "partner") {
    const partnerProfile = await prisma.partnerProfile.findUnique({
      where: { userId: user.sub },
    });
    (response.stats as Record<string, unknown>).partnerLevel =
      partnerProfile?.level ?? "beginner";
  }

  return NextResponse.json(response);
});
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/integration/users/dashboard-stats.test.ts
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/api/v1/users/dashboard-stats/ tests/integration/users/dashboard-stats.test.ts
git commit -m "feat: add GET /api/v1/users/dashboard-stats endpoint"
```

---

## Task 9: Applications API (GET + POST + PATCH)

**Files:**
- Create: `app/api/v1/applications/route.ts`
- Create: `app/api/v1/applications/[id]/route.ts`
- Test: `tests/integration/applications/applications.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/integration/applications/applications.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/v1/applications/route";
import { PATCH } from "@/app/api/v1/applications/[id]/route";
import { signAccessToken } from "@/server/auth/jwt";
import { AUTH_COOKIE } from "@/server/auth/constants";
import { cleanDatabase, testPrisma } from "../../helpers/db";
import { createTestUser } from "../../helpers/auth";

function makeAuthGet(token: string, query = "") {
  const req = new NextRequest(`http://localhost/api/v1/applications${query}`);
  req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);
  return req;
}

function makeAuthPost(token: string, body: Record<string, unknown>) {
  const req = new NextRequest("http://localhost/api/v1/applications", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
  req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);
  return req;
}

function makeAuthPatch(token: string) {
  const req = new NextRequest("http://localhost/api/v1/applications/fake-id", {
    method: "PATCH",
  });
  req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);
  return req;
}

describe("Applications API", () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    await cleanDatabase();
    const user = await createTestUser({ email: "apps@test.com" });
    userId = user.id;
    token = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  });

  describe("POST /api/v1/applications", () => {
    it("creates an application", async () => {
      const res = await POST(makeAuthPost(token, {
        programName: "Computer Science",
        universityName: "Beijing University",
        degree: "Master",
        language: "English",
      }));

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.application.applicationCode).toMatch(/^APP-/);
      expect(body.application.status).toBe("pending");
    });

    it("returns 400 for missing required fields", async () => {
      const res = await POST(makeAuthPost(token, { programName: "Test" }));
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/v1/applications", () => {
    it("lists applications with pagination", async () => {
      for (let i = 0; i < 3; i++) {
        await testPrisma.application.create({
          data: {
            applicationCode: `APP-20260420-00${i + 1}`,
            userId,
            programName: `Program ${i}`,
            universityName: `Uni ${i}`,
          },
        });
      }

      const res = await GET(makeAuthGet(token, "?page=1&limit=2"));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.applications.length).toBe(2);
      expect(body.pagination.total).toBe(3);
    });

    it("filters by status", async () => {
      await testPrisma.application.create({
        data: {
          applicationCode: "APP-20260420-010",
          userId,
          programName: "Approved",
          universityName: "Uni",
          status: "approved",
        },
      });
      await testPrisma.application.create({
        data: {
          applicationCode: "APP-20260420-011",
          userId,
          programName: "Pending",
          universityName: "Uni",
        },
      });

      const res = await GET(makeAuthGet(token, "?status=approved"));
      const body = await res.json();
      expect(body.applications.length).toBe(1);
      expect(body.applications[0].programName).toBe("Approved");
    });
  });

  describe("PATCH /api/v1/applications/:id", () => {
    it("cancels a pending application", async () => {
      const app = await testPrisma.application.create({
        data: {
          applicationCode: "APP-20260420-020",
          userId,
          programName: "Cancel Me",
          universityName: "Uni",
        },
      });

      const req = new NextRequest(`http://localhost/api/v1/applications/${app.id}`, {
        method: "PATCH",
      });
      req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);

      const res = await PATCH(req, { params: { id: app.id } });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.application.status).toBe("cancelled");
    });

    it("returns 400 when cancelling non-pending application", async () => {
      const app = await testPrisma.application.create({
        data: {
          applicationCode: "APP-20260420-021",
          userId,
          programName: "Already Approved",
          universityName: "Uni",
          status: "approved",
        },
      });

      const req = new NextRequest(`http://localhost/api/v1/applications/${app.id}`, {
        method: "PATCH",
      });
      req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);

      const res = await PATCH(req, { params: { id: app.id } });
      expect(res.status).toBe(400);
    });
  });

  it("returns 401 without auth", async () => {
    const req = new NextRequest("http://localhost/api/v1/applications");
    const res = await GET(req, { params: {} });
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/integration/applications/applications.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement applications route (GET + POST)**

```ts
// app/api/v1/applications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthContext } from "@/server/middleware/with-auth";
import { createApplicationSchema, listApplicationsSchema } from "@/server/validators/application";
import { createApplication, listApplications } from "@/server/services/application.service";
import { jsonError } from "@/server/http";

export const GET = withAuth(async (req: NextRequest, { user }: AuthContext) => {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const parsed = listApplicationsSchema.safeParse(params);
  if (!parsed.success) {
    return jsonError("Invalid query parameters", 400, parsed.error.flatten());
  }

  const result = await listApplications(user.sub, parsed.data);
  return NextResponse.json(result);
});

export const POST = withAuth(async (req: NextRequest, { user }: AuthContext) => {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request", 400);
  }

  const parsed = createApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request", 400, parsed.error.flatten());
  }

  const application = await createApplication({
    userId: user.sub,
    ...parsed.data,
  });

  return NextResponse.json({ application }, { status: 201 });
});
```

- [ ] **Step 4: Implement application cancel route (PATCH)**

```ts
// app/api/v1/applications/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthContext } from "@/server/middleware/with-auth";
import { cancelApplication } from "@/server/services/application.service";
import { jsonError } from "@/server/http";

export const PATCH = withAuth<{ id: string }>(
  async (_req: NextRequest, { user, params }: AuthContext<{ id: string }>) => {
    try {
      const application = await cancelApplication(params.id, user.sub);
      return NextResponse.json({ application });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to cancel";
      return jsonError(message, 400);
    }
  },
);
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npm test -- tests/integration/applications/applications.test.ts
```

Expected: 6 tests pass.

- [ ] **Step 6: Commit**

```bash
git add app/api/v1/applications/ tests/integration/applications/
git commit -m "feat: add applications API (GET list, POST create, PATCH cancel)"
```

---

## Task 10: Profile API (PUT profile, PUT password, POST avatar, POST/DELETE certificates)

**Files:**
- Create: `app/api/v1/users/profile/route.ts`
- Create: `app/api/v1/users/password/route.ts`
- Create: `app/api/v1/users/avatar/route.ts`
- Create: `app/api/v1/users/certificates/route.ts`
- Create: `app/api/v1/users/certificates/[id]/route.ts`
- Test: `tests/integration/users/profile.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/integration/users/profile.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { PUT as putProfile } from "@/app/api/v1/users/profile/route";
import { PUT as putPassword } from "@/app/api/v1/users/password/route";
import { DELETE as deleteCert } from "@/app/api/v1/users/certificates/[id]/route";
import { signAccessToken } from "@/server/auth/jwt";
import { AUTH_COOKIE } from "@/server/auth/constants";
import { cleanDatabase, testPrisma } from "../../helpers/db";
import { createTestUser } from "../../helpers/auth";
import { hashPassword, comparePassword } from "@/server/auth/password";

describe("Profile APIs", () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    await cleanDatabase();
    const hash = await hashPassword("oldpass123");
    const user = await createTestUser({
      email: "prof@test.com",
      passwordHash: hash,
    });
    userId = user.id;
    token = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  });

  describe("PUT /api/v1/users/profile", () => {
    it("updates profile fields", async () => {
      const req = new NextRequest("http://localhost/api/v1/users/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: "New Name",
          phone: "+1234567890",
          gender: "male",
          bio: "My bio",
          qualification: "bachelor",
        }),
        headers: { "Content-Type": "application/json" },
      });
      req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);

      const res = await putProfile(req, { params: {} });
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.user.name).toBe("New Name");

      const sp = await testPrisma.studentProfile.findUnique({
        where: { userId },
      });
      expect(sp!.bio).toBe("My bio");
    });

    it("returns 401 without auth", async () => {
      const req = new NextRequest("http://localhost/api/v1/users/profile", {
        method: "PUT",
        body: JSON.stringify({ name: "X" }),
        headers: { "Content-Type": "application/json" },
      });
      const res = await putProfile(req, { params: {} });
      expect(res.status).toBe(401);
    });
  });

  describe("PUT /api/v1/users/password", () => {
    it("changes password with correct current password", async () => {
      const req = new NextRequest("http://localhost/api/v1/users/password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: "oldpass123",
          newPassword: "newpass456",
          confirmPassword: "newpass456",
        }),
        headers: { "Content-Type": "application/json" },
      });
      req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);

      const res = await putPassword(req, { params: {} });
      expect(res.status).toBe(200);

      const user = await testPrisma.user.findUnique({ where: { id: userId } });
      const valid = await comparePassword("newpass456", user!.passwordHash!);
      expect(valid).toBe(true);
    });

    it("rejects with wrong current password", async () => {
      const req = new NextRequest("http://localhost/api/v1/users/password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: "wrongpass",
          newPassword: "newpass456",
          confirmPassword: "newpass456",
        }),
        headers: { "Content-Type": "application/json" },
      });
      req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);

      const res = await putPassword(req, { params: {} });
      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/v1/users/certificates/:id", () => {
    it("deletes own certificate", async () => {
      const cert = await testPrisma.certificate.create({
        data: {
          userId,
          name: "Test Cert",
          fileUrl: "/uploads/certificates/test.pdf",
        },
      });

      const req = new NextRequest(`http://localhost/api/v1/users/certificates/${cert.id}`, {
        method: "DELETE",
      });
      req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);

      const res = await deleteCert(req, { params: { id: cert.id } });
      expect(res.status).toBe(200);

      const deleted = await testPrisma.certificate.findUnique({ where: { id: cert.id } });
      expect(deleted).toBeNull();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/integration/users/profile.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement PUT /api/v1/users/profile**

```ts
// app/api/v1/users/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthContext } from "@/server/middleware/with-auth";
import { updateProfileSchema } from "@/server/validators/profile";
import { updateProfile, getFullProfile } from "@/server/services/profile.service";
import { jsonError } from "@/server/http";

export const PUT = withAuth(async (req: NextRequest, { user }: AuthContext) => {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request", 400);
  }

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request", 400, parsed.error.flatten());
  }

  await updateProfile(user.sub, parsed.data);
  const profile = await getFullProfile(user.sub);

  return NextResponse.json({
    user: {
      id: profile!.id,
      email: profile!.email,
      name: profile!.name,
      phone: profile!.phone,
      gender: profile!.gender,
      country: profile!.country,
      avatar: profile!.avatar,
      studentProfile: profile!.studentProfile,
    },
  });
});
```

- [ ] **Step 4: Implement PUT /api/v1/users/password**

```ts
// app/api/v1/users/password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthContext } from "@/server/middleware/with-auth";
import { changePasswordSchema } from "@/server/validators/profile";
import { changePassword } from "@/server/services/profile.service";
import { jsonError } from "@/server/http";

export const PUT = withAuth(async (req: NextRequest, { user }: AuthContext) => {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request", 400);
  }

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request", 400, parsed.error.flatten());
  }

  try {
    await changePassword(user.sub, parsed.data.currentPassword, parsed.data.newPassword);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Password change failed";
    return jsonError(message, 400);
  }

  return NextResponse.json({ message: "Password changed successfully" });
});
```

- [ ] **Step 5: Implement POST /api/v1/users/avatar**

```ts
// app/api/v1/users/avatar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthContext } from "@/server/middleware/with-auth";
import { uploadFile } from "@/server/services/upload.service";
import { updateProfile } from "@/server/services/profile.service";
import { jsonError } from "@/server/http";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const POST = withAuth(async (req: NextRequest, { user }: AuthContext) => {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return jsonError("Invalid form data", 400);
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return jsonError("No file provided", 400);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return jsonError("File must be JPEG, PNG, or WebP", 400);
  }

  if (file.size > MAX_SIZE) {
    return jsonError("File must be under 5MB", 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadFile(buffer, file.name, "avatars");

  await updateProfile(user.sub, { avatar: result.url });

  return NextResponse.json({ avatar: result.url });
});
```

- [ ] **Step 6: Implement POST /api/v1/users/certificates**

```ts
// app/api/v1/users/certificates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthContext } from "@/server/middleware/with-auth";
import { uploadFile } from "@/server/services/upload.service";
import { prisma } from "@/server/db";
import { jsonError } from "@/server/http";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export const POST = withAuth(async (req: NextRequest, { user }: AuthContext) => {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return jsonError("Invalid form data", 400);
  }

  const name = formData.get("name") as string | null;
  const file = formData.get("file") as File | null;

  if (!name || !file) {
    return jsonError("Name and file are required", 400);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return jsonError("File must be JPEG, PNG, WebP, or PDF", 400);
  }

  if (file.size > MAX_SIZE) {
    return jsonError("File must be under 10MB", 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadFile(buffer, file.name, "certificates");

  const certificate = await prisma.certificate.create({
    data: {
      userId: user.sub,
      name,
      fileUrl: result.url,
    },
  });

  return NextResponse.json({ certificate }, { status: 201 });
});
```

- [ ] **Step 7: Implement DELETE /api/v1/users/certificates/[id]**

```ts
// app/api/v1/users/certificates/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthContext } from "@/server/middleware/with-auth";
import { prisma } from "@/server/db";
import { deleteFile } from "@/server/services/upload.service";
import { jsonError } from "@/server/http";

export const DELETE = withAuth<{ id: string }>(
  async (_req: NextRequest, { user, params }: AuthContext<{ id: string }>) => {
    const cert = await prisma.certificate.findFirst({
      where: { id: params.id, userId: user.sub },
    });

    if (!cert) {
      return jsonError("Certificate not found", 404);
    }

    await deleteFile(cert.fileUrl);
    await prisma.certificate.delete({ where: { id: cert.id } });

    return NextResponse.json({ message: "Certificate deleted" });
  },
);
```

- [ ] **Step 8: Run test to verify it passes**

```bash
npm test -- tests/integration/users/profile.test.ts
```

Expected: 5 tests pass.

- [ ] **Step 9: Commit**

```bash
git add app/api/v1/users/profile/ app/api/v1/users/password/ app/api/v1/users/avatar/ app/api/v1/users/certificates/ tests/integration/users/profile.test.ts
git commit -m "feat: add profile, password, avatar, certificate API endpoints"
```

---

## Task 11: Notifications API (GET list, PATCH read)

**Files:**
- Create: `app/api/v1/notifications/route.ts`
- Create: `app/api/v1/notifications/read/route.ts`
- Test: `tests/integration/notifications/notifications.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/integration/notifications/notifications.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/v1/notifications/route";
import { PATCH } from "@/app/api/v1/notifications/read/route";
import { signAccessToken } from "@/server/auth/jwt";
import { AUTH_COOKIE } from "@/server/auth/constants";
import { cleanDatabase, testPrisma } from "../../helpers/db";
import { createTestUser } from "../../helpers/auth";

describe("Notifications API", () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    await cleanDatabase();
    const user = await createTestUser({ email: "notif@test.com" });
    userId = user.id;
    token = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  });

  describe("GET /api/v1/notifications", () => {
    it("lists notifications with pagination", async () => {
      for (let i = 0; i < 5; i++) {
        await testPrisma.notification.create({
          data: { userId, title: `N${i}`, message: `M${i}` },
        });
      }

      const req = new NextRequest("http://localhost/api/v1/notifications?page=1&limit=3");
      req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);

      const res = await GET(req, { params: {} });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.notifications.length).toBe(3);
      expect(body.pagination.total).toBe(5);
      expect(body.unreadCount).toBe(5);
    });
  });

  describe("PATCH /api/v1/notifications/read", () => {
    it("marks a single notification as read", async () => {
      const n = await testPrisma.notification.create({
        data: { userId, title: "Read me", message: "msg" },
      });

      const req = new NextRequest("http://localhost/api/v1/notifications/read", {
        method: "PATCH",
        body: JSON.stringify({ notificationId: n.id }),
        headers: { "Content-Type": "application/json" },
      });
      req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);

      const res = await PATCH(req, { params: {} });
      expect(res.status).toBe(200);

      const updated = await testPrisma.notification.findUnique({ where: { id: n.id } });
      expect(updated!.isRead).toBe(true);
    });

    it("marks all notifications as read", async () => {
      await testPrisma.notification.create({
        data: { userId, title: "N1", message: "m1" },
      });
      await testPrisma.notification.create({
        data: { userId, title: "N2", message: "m2" },
      });

      const req = new NextRequest("http://localhost/api/v1/notifications/read", {
        method: "PATCH",
        body: JSON.stringify({ all: true }),
        headers: { "Content-Type": "application/json" },
      });
      req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);

      const res = await PATCH(req, { params: {} });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.markedCount).toBe(2);
    });
  });

  it("returns 401 without auth", async () => {
    const req = new NextRequest("http://localhost/api/v1/notifications");
    const res = await GET(req, { params: {} });
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/integration/notifications/notifications.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement GET /api/v1/notifications**

```ts
// app/api/v1/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthContext } from "@/server/middleware/with-auth";
import { listNotificationsSchema } from "@/server/validators/notification";
import { listNotifications, getUnreadCount } from "@/server/services/notification.service";
import { jsonError } from "@/server/http";

export const GET = withAuth(async (req: NextRequest, { user }: AuthContext) => {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const parsed = listNotificationsSchema.safeParse(params);
  if (!parsed.success) {
    return jsonError("Invalid query parameters", 400, parsed.error.flatten());
  }

  const result = await listNotifications(user.sub, parsed.data);
  const unreadCount = await getUnreadCount(user.sub);

  return NextResponse.json({ ...result, unreadCount });
});
```

- [ ] **Step 4: Implement PATCH /api/v1/notifications/read**

```ts
// app/api/v1/notifications/read/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthContext } from "@/server/middleware/with-auth";
import { markReadSchema } from "@/server/validators/notification";
import { markAsRead, markAllAsRead } from "@/server/services/notification.service";
import { jsonError } from "@/server/http";

export const PATCH = withAuth(async (req: NextRequest, { user }: AuthContext) => {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request", 400);
  }

  const parsed = markReadSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request", 400, parsed.error.flatten());
  }

  if (parsed.data.all) {
    const count = await markAllAsRead(user.sub);
    return NextResponse.json({ markedCount: count });
  }

  if (parsed.data.notificationId) {
    const notification = await markAsRead(parsed.data.notificationId, user.sub);
    return NextResponse.json({ notification });
  }

  return jsonError("Provide notificationId or all:true", 400);
});
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npm test -- tests/integration/notifications/notifications.test.ts
```

Expected: 4 tests pass.

- [ ] **Step 6: Commit**

```bash
git add app/api/v1/notifications/ tests/integration/notifications/
git commit -m "feat: add notifications API (GET list, PATCH mark read)"
```

---

## Task 12: Event Registrations API

**Files:**
- Create: `app/api/v1/events/my-registrations/route.ts`
- Test: `tests/integration/events/my-registrations.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/integration/events/my-registrations.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/v1/events/my-registrations/route";
import { signAccessToken } from "@/server/auth/jwt";
import { AUTH_COOKIE } from "@/server/auth/constants";
import { cleanDatabase, testPrisma } from "../../helpers/db";
import { createTestUser } from "../../helpers/auth";

describe("GET /api/v1/events/my-registrations", () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    await cleanDatabase();
    const user = await createTestUser({ email: "events@test.com" });
    userId = user.id;
    token = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  });

  it("lists event registrations with event details", async () => {
    const event = await testPrisma.event.create({
      data: {
        name: "Tech Conference",
        startDate: new Date("2026-06-01"),
        endDate: new Date("2026-06-03"),
        price: 50,
        category: "conference",
      },
    });
    await testPrisma.eventRegistration.create({
      data: { userId, eventId: event.id, paymentStatus: "paid" },
    });

    const req = new NextRequest("http://localhost/api/v1/events/my-registrations?page=1&limit=10");
    req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);

    const res = await GET(req, { params: {} });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.registrations.length).toBe(1);
    expect(body.registrations[0].event.name).toBe("Tech Conference");
    expect(body.registrations[0].paymentStatus).toBe("paid");
    expect(body.pagination.total).toBe(1);
  });

  it("returns empty list for no registrations", async () => {
    const req = new NextRequest("http://localhost/api/v1/events/my-registrations");
    req.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, token);

    const res = await GET(req, { params: {} });
    const body = await res.json();
    expect(body.registrations.length).toBe(0);
    expect(body.pagination.total).toBe(0);
  });

  it("returns 401 without auth", async () => {
    const req = new NextRequest("http://localhost/api/v1/events/my-registrations");
    const res = await GET(req, { params: {} });
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/integration/events/my-registrations.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement event registrations route**

```ts
// app/api/v1/events/my-registrations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthContext } from "@/server/middleware/with-auth";
import { prisma } from "@/server/db";
import { jsonError } from "@/server/http";

export const GET = withAuth(async (req: NextRequest, { user }: AuthContext) => {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "10")));
  const search = url.searchParams.get("search") ?? undefined;

  const where: Record<string, unknown> = { userId: user.sub };

  if (search) {
    where.event = { name: { contains: search, mode: "insensitive" } };
  }

  const [registrations, total] = await Promise.all([
    prisma.eventRegistration.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            price: true,
            category: true,
          },
        },
      },
      orderBy: { orderDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.eventRegistration.count({ where }),
  ]);

  return NextResponse.json({
    registrations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/integration/events/my-registrations.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/api/v1/events/ tests/integration/events/
git commit -m "feat: add GET /api/v1/events/my-registrations endpoint"
```

---

## Task 13: Dashboard Layout Shell (Sidebar + TopBar)

**Files:**
- Create: `src/components/dashboard/Sidebar.tsx`
- Create: `src/components/dashboard/TopBar.tsx`
- Create: `src/components/dashboard/InactiveOverlay.tsx`
- Create: `app/(dashboard)/layout.tsx`

- [ ] **Step 1: Create Sidebar component**

```tsx
// src/components/dashboard/Sidebar.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

interface SidebarProps {
  role: string;
  userId: string;
  collapsed: boolean;
  onToggle: () => void;
}

const studentLinks = (userId: string) => [
  { href: "/user/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/user/my-application", label: "My Application", icon: "📄" },
  { href: "/user/my-event", label: "My Events", icon: "📅" },
  { href: `/user/profile/${userId}`, label: "Edit Profile", icon: "👤" },
  { href: "/user/notification", label: "Notification", icon: "🔔" },
];

const partnerLinks = () => [
  { href: "/user/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/", label: "Apply For New", icon: "➕" },
  { href: "/user/my-application", label: "My Application", icon: "📄" },
  { href: "/user/notification", label: "Notification", icon: "🔔" },
];

export default function Sidebar({ role, userId, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const links = role === "partner" ? partnerLinks() : studentLinks(userId);

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 z-40 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && <span className="text-lg font-bold">EduConsult</span>}
        <button
          onClick={onToggle}
          className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
      </div>

      <nav className="mt-4 space-y-1 px-2">
        {links.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 2: Create TopBar component**

```tsx
// src/components/dashboard/TopBar.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TopBarProps {
  userName: string;
  userAvatar: string | null;
  unreadCount: number;
  sidebarCollapsed: boolean;
  onSidebarToggle: () => void;
}

export default function TopBar({
  userName,
  userAvatar,
  unreadCount,
  sidebarCollapsed,
  onSidebarToggle,
}: TopBarProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.push("/sign-in");
  }

  return (
    <header
      className={`fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6 transition-all duration-300 ${
        sidebarCollapsed ? "left-16" : "left-60"
      }`}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onSidebarToggle}
          className="rounded p-1 text-gray-600 hover:bg-gray-100 lg:hidden"
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <input
          type="text"
          placeholder="Search..."
          className="hidden w-64 rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none sm:block"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/user/notification")}
          className="relative rounded p-1 text-gray-600 hover:bg-gray-100"
        >
          🔔
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded p-1 hover:bg-gray-100"
          >
            {userAvatar ? (
              <img src={userAvatar} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm text-white">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="hidden text-sm text-gray-700 sm:block">{userName}</span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded border bg-white py-1 shadow-lg">
              <button
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Create InactiveOverlay component**

```tsx
// src/components/dashboard/InactiveOverlay.tsx
export default function InactiveOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-8 text-center shadow-xl">
        <div className="mb-4 text-5xl">🔒</div>
        <h1 className="mb-4 text-2xl font-bold text-gray-900">Account Inactive</h1>
        <p className="text-gray-600">
          Your account is inactive — Please contact the administrator to activate your account.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create dashboard layout**

```tsx
// app/(dashboard)/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken } from "@/server/auth/jwt";
import { AUTH_COOKIE } from "@/server/auth/constants";
import { prisma } from "@/server/db";
import { getUnreadCount } from "@/server/services/notification.service";
import DashboardShell from "./DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE.ACCESS_TOKEN)?.value;

  if (!token) {
    redirect("/sign-in");
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, avatar: true, role: true, status: true },
  });

  if (!user) {
    redirect("/sign-in");
  }

  const unreadCount = await getUnreadCount(user.id);

  return (
    <DashboardShell
      userId={user.id}
      userName={user.name}
      userAvatar={user.avatar}
      userRole={user.role}
      userStatus={user.status}
      unreadCount={unreadCount}
    >
      {children}
    </DashboardShell>
  );
}
```

- [ ] **Step 5: Create DashboardShell client wrapper**

```tsx
// app/(dashboard)/DashboardShell.tsx
"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import InactiveOverlay from "@/components/dashboard/InactiveOverlay";

interface DashboardShellProps {
  userId: string;
  userName: string;
  userAvatar: string | null;
  userRole: string;
  userStatus: string;
  unreadCount: number;
  children: React.ReactNode;
}

export default function DashboardShell({
  userId,
  userName,
  userAvatar,
  userRole,
  userStatus,
  unreadCount,
  children,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored === "true") setCollapsed(true);
  }, []);

  function toggleSidebar() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  }

  const isInactivePartner = userRole === "partner" && userStatus === "inactive";

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        role={userRole}
        userId={userId}
        collapsed={collapsed}
        onToggle={toggleSidebar}
      />
      <TopBar
        userName={userName}
        userAvatar={userAvatar}
        unreadCount={unreadCount}
        sidebarCollapsed={collapsed}
        onSidebarToggle={toggleSidebar}
      />
      <main
        className={`pt-16 transition-all duration-300 ${
          collapsed ? "ml-16" : "ml-60"
        }`}
      >
        <div className="p-6">
          {isInactivePartner ? <InactiveOverlay /> : children}
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/dashboard/ app/\(dashboard\)/
git commit -m "feat: add dashboard layout shell with sidebar, top bar, inactive overlay"
```

---

## Task 14: StatCard + Dashboard Page with Charts

**Files:**
- Create: `src/components/dashboard/StatCard.tsx`
- Create: `app/(dashboard)/user/dashboard/page.tsx`

- [ ] **Step 1: Create StatCard component**

```tsx
// src/components/dashboard/StatCard.tsx
interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  className?: string;
}

export default function StatCard({ icon, label, value, className }: StatCardProps) {
  return (
    <div className={`rounded-lg bg-white p-6 shadow ${className ?? ""}`}>
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-2xl">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create dashboard page**

```tsx
// app/(dashboard)/user/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";

interface DashboardData {
  stats: {
    totalApplications: number;
    applicationFeesPaid: number;
    serviceCharge: number;
    serviceChargePaid: number;
    partnerLevel?: string;
  };
  charts: {
    applicationHistory: { month: string; applications: number; approved: number }[];
    summary: { applications: number; serviceCharge: number; applicationFees: number };
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/users/dashboard-stats")
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-gray-500">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="text-red-500">Failed to load dashboard data</div>;
  }

  const summaryData = [
    { name: "Applications", value: data.charts.summary.applications },
    { name: "Service Charge", value: data.charts.summary.serviceCharge },
    { name: "Application Fees", value: data.charts.summary.applicationFees },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="📄" label="Applications" value={data.stats.totalApplications} />
        <StatCard
          icon="💰"
          label="Application Fees Paid"
          value={`$${data.stats.applicationFeesPaid.toFixed(2)}`}
        />
        <StatCard
          icon="📋"
          label="Total Service Charge"
          value={`$${data.stats.serviceCharge.toFixed(2)}`}
        />
        <StatCard
          icon="📁"
          label="Service Charge Paid"
          value={`$${data.stats.serviceChargePaid.toFixed(2)}`}
        />
        {data.stats.partnerLevel && (
          <StatCard
            icon="🏅"
            label="Your Level"
            value={data.stats.partnerLevel.charAt(0).toUpperCase() + data.stats.partnerLevel.slice(1)}
          />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Applications History
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.charts.applicationHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="applications" stroke="#f472b6" name="Applications" />
              <Line type="monotone" dataKey="approved" stroke="#3b82f6" name="Approved" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Summary</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summaryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/StatCard.tsx app/\(dashboard\)/user/dashboard/
git commit -m "feat: add dashboard page with stat cards and recharts"
```

---

## Task 15: DataTable + ExportButtons + FilterBar Components

**Files:**
- Create: `src/components/tables/DataTable.tsx`
- Create: `src/components/tables/ExportButtons.tsx`
- Create: `src/components/tables/FilterBar.tsx`

- [ ] **Step 1: Create DataTable component**

```tsx
// src/components/tables/DataTable.tsx
"use client";

import { useState } from "react";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T, index: number) => React.ReactNode;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onSort?: (sortBy: string, sortOrder: "asc" | "desc") => void;
  onSearch?: (search: string) => void;
  onLimitChange?: (limit: number) => void;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  pagination,
  onPageChange,
  onSort,
  onSearch,
  onLimitChange,
}: DataTableProps<T>) {
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");

  function handleSort(key: string) {
    const newOrder = sortBy === key && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(key);
    setSortOrder(newOrder);
    onSort?.(key, newOrder);
  }

  function handleSearch(value: string) {
    setSearchTerm(value);
    onSearch?.(value);
  }

  const startEntry = (pagination.page - 1) * pagination.limit + 1;
  const endEntry = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show</span>
          <select
            value={pagination.limit}
            onChange={(e) => onLimitChange?.(parseInt(e.target.value))}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-gray-600">entries</span>
        </div>

        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left font-medium text-gray-600 ${
                    col.sortable ? "cursor-pointer select-none hover:text-gray-900" : ""
                  }`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  {col.label}
                  {col.sortable && sortBy === col.key && (
                    <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                  No data found
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      {col.render
                        ? col.render(row, (pagination.page - 1) * pagination.limit + rowIndex)
                        : (row[col.key] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {pagination.total > 0
            ? `Showing ${startEntry} to ${endEntry} of ${pagination.total} entries`
            : "No entries"}
        </p>
        <div className="flex gap-1">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter((p) => Math.abs(p - pagination.page) <= 2)
            .map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`rounded border px-3 py-1 text-sm ${
                  p === pagination.page ? "bg-blue-600 text-white" : ""
                }`}
              >
                {p}
              </button>
            ))}
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create ExportButtons component**

```tsx
// src/components/tables/ExportButtons.tsx
"use client";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportButtonsProps {
  data: Record<string, unknown>[];
  columns: { key: string; label: string }[];
  filename: string;
}

export default function ExportButtons({ data, columns, filename }: ExportButtonsProps) {
  function exportExcel() {
    const rows = data.map((row) =>
      Object.fromEntries(columns.map((col) => [col.label, row[col.key] ?? ""]))
    );
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }

  function exportPDF() {
    const doc = new jsPDF();
    const headers = columns.map((c) => c.label);
    const rows = data.map((row) => columns.map((col) => String(row[col.key] ?? "")));
    autoTable(doc, { head: [headers], body: rows });
    doc.save(`${filename}.pdf`);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={exportExcel}
        className="rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
      >
        Excel
      </button>
      <button
        onClick={exportPDF}
        className="rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
      >
        PDF
      </button>
      <button
        onClick={handlePrint}
        className="rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
      >
        Print
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Create FilterBar component**

```tsx
// src/components/tables/FilterBar.tsx
"use client";

interface FilterOption {
  label: string;
  value: string;
}

interface Filter {
  key: string;
  label: string;
  options: FilterOption[];
}

interface FilterBarProps {
  filters: Filter[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export default function FilterBar({ filters, values, onChange }: FilterBarProps) {
  return (
    <div className="mb-4 flex flex-wrap gap-3">
      {filters.map((filter) => (
        <div key={filter.key} className="flex items-center gap-2">
          <label className="text-sm text-gray-600">{filter.label}:</label>
          <select
            value={values[filter.key] ?? ""}
            onChange={(e) => onChange(filter.key, e.target.value)}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">All</option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/tables/
git commit -m "feat: add DataTable, ExportButtons, FilterBar reusable components"
```

---

## Task 16: My Application Page

**Files:**
- Create: `app/(dashboard)/user/my-application/page.tsx`

- [ ] **Step 1: Create My Application page**

```tsx
// app/(dashboard)/user/my-application/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import DataTable, { type Column } from "@/components/tables/DataTable";
import ExportButtons from "@/components/tables/ExportButtons";
import FilterBar from "@/components/tables/FilterBar";

interface Application {
  id: string;
  applicationCode: string;
  programName: string;
  universityName: string;
  status: string;
  fundType: string;
  appliedAt: string;
  [key: string]: unknown;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default function MyApplicationPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 10, total: 0, totalPages: 0,
  });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState("appliedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(pagination.page),
      limit: String(pagination.limit),
      sortBy,
      sortOrder,
    });
    if (filters.fundType) params.set("fundType", filters.fundType);
    if (filters.status) params.set("status", filters.status);
    if (search) params.set("search", search);

    const res = await fetch(`/api/v1/applications?${params}`);
    const data = await res.json();
    setApplications(data.applications);
    setPagination(data.pagination);
    setLoading(false);
  }, [pagination.page, pagination.limit, sortBy, sortOrder, filters, search]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  async function handleCancel(id: string) {
    if (!confirm("Are you sure you want to cancel this application?")) return;
    await fetch(`/api/v1/applications/${id}`, { method: "PATCH" });
    fetchApplications();
  }

  const columns: Column<Application>[] = [
    { key: "sl", label: "SL", render: (_row, index) => index + 1 },
    { key: "applicationCode", label: "Application Code", sortable: true },
    { key: "programName", label: "Program Name", sortable: true },
    { key: "universityName", label: "University", sortable: true },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row) => (
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[row.status] ?? ""}`}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <div className="flex gap-2">
          {row.status === "pending" && (
            <button
              onClick={() => handleCancel(row.id)}
              className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
            >
              Cancel
            </button>
          )}
        </div>
      ),
    },
  ];

  const filterConfig = [
    {
      key: "fundType",
      label: "Fund Type",
      options: [
        { label: "Self-funded", value: "self_funded" },
        { label: "Scholarship", value: "scholarship" },
      ],
    },
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
        { label: "Cancelled", value: "cancelled" },
      ],
    },
  ];

  const exportColumns = [
    { key: "applicationCode", label: "Application Code" },
    { key: "programName", label: "Program Name" },
    { key: "universityName", label: "University" },
    { key: "status", label: "Status" },
    { key: "fundType", label: "Fund Type" },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Application</h1>
        <ExportButtons data={applications} columns={exportColumns} filename="my-applications" />
      </div>

      <FilterBar
        filters={filterConfig}
        values={filters}
        onChange={(key, value) => {
          setFilters((prev) => ({ ...prev, [key]: value }));
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
      />

      {loading ? (
        <div className="py-8 text-center text-gray-500">Loading...</div>
      ) : (
        <DataTable
          columns={columns}
          data={applications}
          pagination={pagination}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          onSort={(by, order) => { setSortBy(by); setSortOrder(order); }}
          onSearch={(s) => { setSearch(s); setPagination((prev) => ({ ...prev, page: 1 })); }}
          onLimitChange={(limit) => setPagination((prev) => ({ ...prev, limit, page: 1 }))}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(dashboard\)/user/my-application/
git commit -m "feat: add My Application page with filters, sort, export"
```

---

## Task 17: My Events Page

**Files:**
- Create: `app/(dashboard)/user/my-event/page.tsx`

- [ ] **Step 1: Create My Events page**

```tsx
// app/(dashboard)/user/my-event/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import DataTable, { type Column } from "@/components/tables/DataTable";
import ExportButtons from "@/components/tables/ExportButtons";

interface EventRegistration {
  id: string;
  orderDate: string;
  paymentStatus: string;
  event: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    price: number;
  };
  [key: string]: unknown;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const PAYMENT_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export default function MyEventPage() {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 10, total: 0, totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("orderDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(pagination.page),
      limit: String(pagination.limit),
    });
    if (search) params.set("search", search);

    const res = await fetch(`/api/v1/events/my-registrations?${params}`);
    const data = await res.json();
    setRegistrations(data.registrations);
    setPagination(data.pagination);
    setLoading(false);
  }, [pagination.page, pagination.limit, search]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const columns: Column<EventRegistration>[] = [
    { key: "sl", label: "SL", render: (_row, index) => index + 1 },
    { key: "eventName", label: "Event Name", sortable: true, render: (row) => row.event.name },
    {
      key: "startDate", label: "Start Date", sortable: true,
      render: (row) => new Date(row.event.startDate).toLocaleDateString(),
    },
    {
      key: "endDate", label: "End Date", sortable: true,
      render: (row) => new Date(row.event.endDate).toLocaleDateString(),
    },
    {
      key: "price", label: "Price", sortable: true,
      render: (row) => `$${Number(row.event.price).toFixed(2)}`,
    },
    {
      key: "orderDate", label: "Order Date", sortable: true,
      render: (row) => new Date(row.orderDate).toLocaleDateString(),
    },
    {
      key: "paymentStatus", label: "Payment Status",
      render: (row) => (
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${PAYMENT_COLORS[row.paymentStatus] ?? ""}`}>
          {row.paymentStatus.charAt(0).toUpperCase() + row.paymentStatus.slice(1)}
        </span>
      ),
    },
  ];

  const exportColumns = [
    { key: "eventName", label: "Event Name" },
    { key: "startDate", label: "Start Date" },
    { key: "endDate", label: "End Date" },
    { key: "price", label: "Price" },
    { key: "orderDate", label: "Order Date" },
    { key: "paymentStatus", label: "Payment Status" },
  ];

  const exportData = registrations.map((r) => ({
    eventName: r.event.name,
    startDate: new Date(r.event.startDate).toLocaleDateString(),
    endDate: new Date(r.event.endDate).toLocaleDateString(),
    price: Number(r.event.price).toFixed(2),
    orderDate: new Date(r.orderDate).toLocaleDateString(),
    paymentStatus: r.paymentStatus,
  }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
        <ExportButtons data={exportData} columns={exportColumns} filename="my-events" />
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-500">Loading...</div>
      ) : (
        <DataTable
          columns={columns}
          data={registrations}
          pagination={pagination}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          onSort={(by, order) => { setSortBy(by); setSortOrder(order); }}
          onSearch={(s) => { setSearch(s); setPagination((prev) => ({ ...prev, page: 1 })); }}
          onLimitChange={(limit) => setPagination((prev) => ({ ...prev, limit, page: 1 }))}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(dashboard\)/user/my-event/
git commit -m "feat: add My Events page with table, sort, export"
```

---

## Task 18: FileUpload + PasswordInput Components

**Files:**
- Create: `src/components/forms/FileUpload.tsx`
- Create: `src/components/forms/PasswordInput.tsx`

- [ ] **Step 1: Create FileUpload component**

```tsx
// src/components/forms/FileUpload.tsx
"use client";

import { useState, useRef } from "react";

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  maxSizeMB?: number;
  preview?: string | null;
  label?: string;
}

export default function FileUpload({
  onUpload,
  accept = "image/*",
  maxSizeMB = 5,
  preview,
  label = "Upload File",
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError("");
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File must be under ${maxSizeMB}MB`);
      return;
    }
    setUploading(true);
    try {
      await onUpload(file);
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
      >
        {preview && (
          <img src={preview} alt="Preview" className="mx-auto mb-3 h-20 w-20 rounded-full object-cover" />
        )}
        <p className="text-sm text-gray-500">
          {uploading ? "Uploading..." : "Drag & drop or click to select"}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Create PasswordInput component**

```tsx
// src/components/forms/PasswordInput.tsx
"use client";

import { useState } from "react";

interface PasswordInputProps {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  minLength?: number;
}

export default function PasswordInput({
  id,
  name,
  label,
  required = false,
  minLength,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          minLength={minLength}
          className="block w-full rounded border border-gray-300 px-3 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          tabIndex={-1}
        >
          {visible ? "🙈" : "👁"}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/forms/
git commit -m "feat: add FileUpload and PasswordInput form components"
```

---

## Task 19: Edit Profile Page

**Files:**
- Create: `app/(dashboard)/user/profile/[id]/page.tsx`

- [ ] **Step 1: Create Edit Profile page**

```tsx
// app/(dashboard)/user/profile/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import FileUpload from "@/components/forms/FileUpload";
import PasswordInput from "@/components/forms/PasswordInput";

interface ProfileData {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  gender: string | null;
  country: string | null;
  avatar: string | null;
  studentProfile: {
    bio: string | null;
    passportNid: string | null;
    qualification: string | null;
    interestedMajor: string | null;
    lastAcademicResult: string | null;
    experience: string | null;
    language: string | null;
    address: string | null;
  } | null;
}

interface Certificate {
  id: string;
  name: string;
  fileUrl: string;
}

export default function EditProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordErr, setPasswordErr] = useState("");

  useEffect(() => {
    fetch("/api/v1/users/me")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data.user);
        setCertificates(data.user.certificates ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      phone: form.get("phone") || undefined,
      gender: form.get("gender") || undefined,
      country: form.get("country") || undefined,
      bio: form.get("bio") || undefined,
      passportNid: form.get("passportNid") || undefined,
      qualification: form.get("qualification") || undefined,
      interestedMajor: form.get("interestedMajor") || undefined,
      lastAcademicResult: form.get("lastAcademicResult") || undefined,
      experience: form.get("experience") || undefined,
      language: form.get("language") || undefined,
      address: form.get("address") || undefined,
    };

    try {
      const res = await fetch("/api/v1/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Update failed");
        return;
      }
      const data = await res.json();
      setProfile(data.user);
      setMessage("Profile updated successfully");
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/v1/users/avatar", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      setProfile((prev) => prev ? { ...prev, avatar: data.avatar } : prev);
    }
  }

  async function handleCertUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/v1/users/certificates", { method: "POST", body: form });
    if (res.ok) {
      const data = await res.json();
      setCertificates((prev) => [...prev, data.certificate]);
      (e.target as HTMLFormElement).reset();
    }
  }

  async function handleDeleteCert(id: string) {
    if (!confirm("Delete this certificate?")) return;
    const res = await fetch(`/api/v1/users/certificates/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCertificates((prev) => prev.filter((c) => c.id !== id));
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordMsg("");
    setPasswordErr("");

    const form = new FormData(e.currentTarget);
    const body = {
      currentPassword: form.get("currentPassword"),
      newPassword: form.get("newPassword"),
      confirmPassword: form.get("confirmPassword"),
    };

    try {
      const res = await fetch("/api/v1/users/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        setPasswordErr(data.error ?? "Password change failed");
        return;
      }
      setPasswordMsg("Password changed successfully");
      (e.target as HTMLFormElement).reset();
    } catch {
      setPasswordErr("Network error");
    }
  }

  if (loading) return <div className="text-gray-500">Loading profile...</div>;
  if (!profile) return <div className="text-red-500">Failed to load profile</div>;

  const sp = profile.studentProfile;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>

      {/* Section 1: Personal Info */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Personal Information</h2>

        <div className="mb-6">
          <FileUpload
            onUpload={handleAvatarUpload}
            accept="image/jpeg,image/png,image/webp"
            maxSizeMB={5}
            preview={profile.avatar}
            label="Profile Photo"
          />
        </div>

        {message && <div className="mb-4 rounded bg-green-50 p-3 text-sm text-green-700">{message}</div>}
        {error && <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleProfileSubmit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input id="name" name="name" type="text" required defaultValue={profile.name}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input id="email" type="email" disabled value={profile.email}
              className="mt-1 block w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-gray-500" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Mobile</label>
            <input id="phone" name="phone" type="tel" defaultValue={profile.phone ?? ""}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
            <select id="gender" name="gender" defaultValue={profile.gender ?? ""}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="passportNid" className="block text-sm font-medium text-gray-700">Passport/NID</label>
            <input id="passportNid" name="passportNid" type="text" defaultValue={sp?.passportNid ?? ""}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="qualification" className="block text-sm font-medium text-gray-700">Qualification</label>
            <select id="qualification" name="qualification" defaultValue={sp?.qualification ?? ""}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none">
              <option value="">Select</option>
              <option value="high_school">High School</option>
              <option value="bachelor">Bachelor</option>
              <option value="master">Master</option>
            </select>
          </div>
          <div>
            <label htmlFor="interestedMajor" className="block text-sm font-medium text-gray-700">Interested Major</label>
            <input id="interestedMajor" name="interestedMajor" type="text" defaultValue={sp?.interestedMajor ?? ""}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="lastAcademicResult" className="block text-sm font-medium text-gray-700">Last Academic Result</label>
            <input id="lastAcademicResult" name="lastAcademicResult" type="text" defaultValue={sp?.lastAcademicResult ?? ""}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="experience" className="block text-sm font-medium text-gray-700">Experience</label>
            <input id="experience" name="experience" type="text" defaultValue={sp?.experience ?? ""}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700">Language</label>
            <input id="language" name="language" type="text" defaultValue={sp?.language ?? ""}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
            <input id="address" name="address" type="text" defaultValue={sp?.address ?? ""}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
          </div>

          {/* Section 2: About */}
          <div className="sm:col-span-2">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">About / Details</label>
            <textarea id="bio" name="bio" rows={4} defaultValue={sp?.bio ?? ""}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
          </div>

          <div className="sm:col-span-2">
            <button type="submit" disabled={saving}
              className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>

      {/* Section 3: Certificates */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Certificates</h2>

        {certificates.length > 0 && (
          <div className="mb-4 space-y-2">
            {certificates.map((cert) => (
              <div key={cert.id} className="flex items-center justify-between rounded border p-3">
                <div>
                  <span className="font-medium">{cert.name}</span>
                  <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="ml-2 text-sm text-blue-600 hover:underline">
                    View
                  </a>
                </div>
                <button onClick={() => handleDeleteCert(cert.id)}
                  className="text-red-500 hover:text-red-700">✕</button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleCertUpload} className="flex items-end gap-3">
          <div className="flex-1">
            <label htmlFor="certName" className="block text-sm font-medium text-gray-700">Certificate Name</label>
            <input id="certName" name="name" type="text" required
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
          </div>
          <div className="flex-1">
            <label htmlFor="certFile" className="block text-sm font-medium text-gray-700">Certificate File</label>
            <input id="certFile" name="file" type="file" required accept="image/*,.pdf"
              className="mt-1 block w-full text-sm" />
          </div>
          <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">+</button>
        </form>
      </div>

      {/* Section 4: Change Password */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Change Password</h2>

        {passwordMsg && <div className="mb-4 rounded bg-green-50 p-3 text-sm text-green-700">{passwordMsg}</div>}
        {passwordErr && <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{passwordErr}</div>}

        <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-4">
          <PasswordInput id="currentPassword" name="currentPassword" label="Current Password" required />
          <PasswordInput id="newPassword" name="newPassword" label="New Password" required minLength={8} />
          <PasswordInput id="confirmPassword" name="confirmPassword" label="Confirm Password" required minLength={8} />
          <button type="submit" className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update GET /api/v1/users/me to include certificates**

In `app/api/v1/users/me/route.ts`, update the `findUserById` call to include related data. Since the current `findUserById` only does a simple `findUnique`, we need to use `getFullProfile` instead:

Replace the body of the GET handler in `app/api/v1/users/me/route.ts`:

```ts
// app/api/v1/users/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthContext } from "@/server/middleware/with-auth";
import { getFullProfile } from "@/server/services/profile.service";
import { jsonError } from "@/server/http";

export const GET = withAuth(async (_req: NextRequest, { user }: AuthContext) => {
  const dbUser = await getFullProfile(user.sub);
  if (!dbUser) {
    return jsonError("User not found", 404);
  }

  return NextResponse.json({
    user: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      phone: dbUser.phone,
      gender: dbUser.gender,
      country: dbUser.country,
      role: dbUser.role,
      avatar: dbUser.avatar,
      createdAt: dbUser.createdAt,
      studentProfile: dbUser.studentProfile,
      partnerProfile: dbUser.partnerProfile,
      certificates: dbUser.certificates,
    },
  });
});
```

- [ ] **Step 3: Commit**

```bash
git add app/\(dashboard\)/user/profile/ app/api/v1/users/me/
git commit -m "feat: add Edit Profile page with avatar, certificates, password change"
```

---

## Task 20: Notification Page

**Files:**
- Create: `app/(dashboard)/user/notification/page.tsx`

- [ ] **Step 1: Create Notification page**

```tsx
// app/(dashboard)/user/notification/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 20, total: 0, totalPages: 0,
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(pagination.page),
      limit: String(pagination.limit),
    });
    const res = await fetch(`/api/v1/notifications?${params}`);
    const data = await res.json();
    setNotifications(data.notifications);
    setPagination(data.pagination);
    setLoading(false);
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function handleClick(id: string) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(id);
    const n = notifications.find((n) => n.id === id);
    if (n && !n.isRead) {
      await fetch("/api/v1/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    }
  }

  async function handleMarkAllRead() {
    await fetch("/api/v1/notifications/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Notification</h1>
        <button
          onClick={handleMarkAllRead}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Mark all as read
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-500">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
          No notifications yet
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleClick(n.id)}
              className={`cursor-pointer rounded-lg bg-white p-4 shadow transition-colors hover:bg-gray-50 ${
                !n.isRead ? "border-l-4 border-blue-500" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {!n.isRead && (
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                  )}
                  <h3 className={`text-sm ${!n.isRead ? "font-semibold" : "font-normal"}`}>
                    {n.title}
                  </h3>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
              {expandedId === n.id && (
                <p className="mt-2 text-sm text-gray-600">{n.message}</p>
              )}
            </div>
          ))}

          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page <= 1}
                className="rounded border px-3 py-1 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
                className="rounded border px-3 py-1 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(dashboard\)/user/notification/
git commit -m "feat: add notification page with read/unread, expand, mark all"
```

---

## Task 21: Seed Data for Dashboard Testing

**Files:**
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Update seed script with sample data**

Replace the content of `prisma/seed.ts`:

```ts
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const adminEmail = "admin@educonsultancy.com";
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    const passwordHash = await bcrypt.hash("admin1234", 12);
    admin = await prisma.user.create({
      data: { email: adminEmail, name: "Admin", passwordHash, role: "admin" },
    });
    console.log(`Created admin user: ${admin.email}`);
  }

  // Sample student
  const studentEmail = "student@example.com";
  let student = await prisma.user.findUnique({ where: { email: studentEmail } });
  if (!student) {
    const passwordHash = await bcrypt.hash("student123", 12);
    student = await prisma.user.create({
      data: {
        email: studentEmail,
        name: "Alice Student",
        passwordHash,
        role: "student",
        phone: "+1234567890",
        gender: "female",
        country: "Bangladesh",
      },
    });
    await prisma.studentProfile.create({
      data: {
        userId: student.id,
        qualification: "bachelor",
        interestedMajor: "Computer Science",
        language: "English",
        bio: "Passionate about studying abroad.",
      },
    });
    console.log(`Created student user: ${student.email}`);
  }

  // Sample applications for student
  const appCount = await prisma.application.count({ where: { userId: student.id } });
  if (appCount === 0) {
    const apps = [
      { code: "APP-20260401-001", program: "Computer Science BSc", uni: "Beijing University", status: "approved" as const, fee: 2000, feePaid: 2000, sc: 500, scPaid: 500 },
      { code: "APP-20260405-001", program: "Data Science MSc", uni: "Tsinghua University", status: "pending" as const, fee: 3000, feePaid: 0, sc: 800, scPaid: 0 },
      { code: "APP-20260410-001", program: "AI Research PhD", uni: "Zhejiang University", status: "rejected" as const, fee: 1500, feePaid: 1500, sc: 600, scPaid: 600 },
    ];
    for (const app of apps) {
      await prisma.application.create({
        data: {
          applicationCode: app.code,
          userId: student.id,
          programName: app.program,
          universityName: app.uni,
          status: app.status,
          degree: "Master",
          language: "English",
          fundType: "self_funded",
          applicationFee: app.fee,
          applicationFeePaid: app.feePaid,
          serviceCharge: app.sc,
          serviceChargePaid: app.scPaid,
        },
      });
    }
    console.log("Created 3 sample applications");
  }

  // Sample events + registrations
  const eventCount = await prisma.event.count();
  if (eventCount === 0) {
    const event = await prisma.event.create({
      data: {
        name: "Education Expo 2026",
        startDate: new Date("2026-06-15"),
        endDate: new Date("2026-06-17"),
        price: 50,
        category: "expo",
        location: "Guangzhou",
        description: "Annual education expo.",
        status: "upcoming",
      },
    });
    await prisma.eventRegistration.create({
      data: { userId: student.id, eventId: event.id, paymentStatus: "paid" },
    });
    console.log("Created sample event + registration");
  }

  // Sample notifications
  const notifCount = await prisma.notification.count({ where: { userId: student.id } });
  if (notifCount === 0) {
    await prisma.notification.createMany({
      data: [
        { userId: student.id, title: "Welcome!", message: "Welcome to the Education Consultancy Platform." },
        { userId: student.id, title: "Application Update", message: "Your application APP-20260401-001 has been approved." },
        { userId: student.id, title: "Event Reminder", message: "Education Expo 2026 starts in 2 months." },
      ],
    });
    console.log("Created 3 sample notifications");
  }

  // Sample partner (inactive)
  const partnerEmail = "partner@example.com";
  let partner = await prisma.user.findUnique({ where: { email: partnerEmail } });
  if (!partner) {
    const passwordHash = await bcrypt.hash("partner123", 12);
    partner = await prisma.user.create({
      data: {
        email: partnerEmail,
        name: "Bob Partner",
        passwordHash,
        role: "partner",
        status: "inactive",
        gender: "male",
        country: "Thailand",
      },
    });
    await prisma.partnerProfile.create({
      data: { userId: partner.id, level: "beginner" },
    });
    console.log(`Created partner user: ${partner.email} (inactive)`);
  }
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

Expected: Creates admin, student (with apps, events, notifications), and partner users.

- [ ] **Step 3: Commit**

```bash
git add prisma/seed.ts
git commit -m "feat: update seed script with sample dashboard data"
```

---

## Task 22: Full Test Suite Verification

- [ ] **Step 1: Run all tests**

```bash
npm test
```

Expected: All tests pass (existing 46 + new tests from Tasks 3-12).

- [ ] **Step 2: If any tests fail, fix them**

Check for issues like:
- `cleanDatabase` missing new table deletions (fixed in Task 2)
- Import path issues
- Race conditions in test data

- [ ] **Step 3: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: resolve test issues from dashboard integration"
```

---

## Summary

After completing all 22 tasks, the project adds:

- **4 new Prisma models:** Application, Event, EventRegistration, Notification
- **12 API endpoints:** dashboard-stats, applications CRUD, event registrations, notifications, profile, password, avatar, certificates
- **5 dashboard pages:** Dashboard (stat cards + charts), My Application, My Events, Edit Profile, Notification
- **Dashboard shell:** Sidebar (role-aware), TopBar (search, notification bell, avatar), InactiveOverlay (partner gate)
- **Reusable components:** DataTable, ExportButtons, FilterBar, StatCard, FileUpload, PasswordInput
- **File upload service:** Local filesystem with S3-ready interface
- **Export features:** Excel (xlsx), PDF (jspdf), Print
- **Charts:** Line chart (application history) + Bar chart (summary) via recharts
- **Seed data:** Sample student with applications, events, notifications + inactive partner
