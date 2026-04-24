# Plan 03: Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an admin-only dashboard where admins can manage users, applications, events, partner approvals, and send notifications.

**Architecture:** Monolithic admin dashboard at `/admin/*` using detail-page pattern (list → detail → edit). Separate API namespace `/api/v1/admin/*` for admin operations. All routes protected by `withRole(['admin'])` middleware. Reuse existing DataTable, form components, and middleware patterns from Plans 01-02.

**Tech Stack:** Next.js 14, React, Tailwind CSS, Zod, Prisma (no schema changes), TDD with Vitest.

---

## Task Decomposition

### Task 1: Admin Zod Validators

**Files:**
- Create: `src/server/validators/admin.ts`

- [ ] **Step 1: Write admin validators**

```typescript
// src/server/validators/admin.ts
import { z } from "zod";

// Users
export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.enum(["student", "counselor", "admin", "partner"]),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  country: z.string().optional(),
  role: z.enum(["student", "counselor", "admin", "partner"]).optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
});

export const listUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  role: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

// Applications
export const approveApplicationSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  adminNote: z.string().optional(),
});

export const listApplicationsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.string().optional(),
  search: z.string().optional(),
});

// Events
export const createEventSchema = z.object({
  name: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  price: z.coerce.number().min(0),
  category: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export const updateEventSchema = createEventSchema.partial();

export const listEventsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
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
  title: z.string().min(1),
  message: z.string().min(1),
  targetRole: z.enum(["student", "partner"]).optional(),
  targetUserIds: z.array(z.string()).optional(),
}).refine((data) => !(data.targetRole && data.targetUserIds), {
  message: "Cannot specify both targetRole and targetUserIds",
});
```

- [ ] **Step 2: Verify no syntax errors**

Run: `npx tsc --noEmit src/server/validators/admin.ts`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/server/validators/admin.ts
git commit -m "feat: add admin validators for users, apps, events, partners, notifications"
```

---

### Task 2: Admin Services (User, Application, Event, Partner)

**Files:**
- Create: `src/server/services/admin.service.ts`

- [ ] **Step 1: Write admin services**

```typescript
// src/server/services/admin.service.ts
import { prisma } from "@/server/db";
import { hashPassword } from "@/server/auth/password";
import type { User, Application, Event } from "@prisma/client";

// User Admin
export async function createUserAdmin(email: string, password: string, name: string, role: string) {
  const hash = await hashPassword(password);
  return prisma.user.create({
    data: { email, passwordHash: hash, name, role: role as any, status: "active" },
  });
}

export async function updateUserAdmin(id: string, data: any) {
  return prisma.user.update({ where: { id }, data });
}

export async function deactivateUserAdmin(id: string) {
  return prisma.user.update({ where: { id }, data: { status: "suspended" } });
}

export async function listUsersAdmin(page: number, limit: number, filters: any) {
  const where: any = {};
  if (filters.role) where.role = filters.role;
  if (filters.status) where.status = filters.status;
  if (filters.search) {
    where.OR = [
      { email: { contains: filters.search, mode: "insensitive" } },
      { name: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, email: true, name: true, role: true, status: true, createdAt: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getUserDetailAdmin(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

// Application Admin
export async function approveApplicationAdmin(id: string, status: string, note?: string) {
  const app = await prisma.application.update({
    where: { id },
    data: { status: status as any },
    include: { user: true },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId: app.userId,
      title: `Application ${status}`,
      message: status === "approved" 
        ? `Your application to ${app.universityName} has been approved!`
        : `Your application to ${app.universityName} was not approved.`,
    },
  });

  return app;
}

export async function listApplicationsAdmin(page: number, limit: number, filters: any) {
  const where: any = {};
  if (filters.status) where.status = filters.status;
  if (filters.search) {
    where.OR = [
      { applicationCode: { contains: filters.search, mode: "insensitive" } },
      { programName: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [apps, total] = await Promise.all([
    prisma.application.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { appliedAt: "desc" },
    }),
    prisma.application.count({ where }),
  ]);

  return { applications: apps, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getApplicationDetailAdmin(id: string) {
  return prisma.application.findUnique({
    where: { id },
    include: { user: true },
  });
}

// Event Admin
export async function createEventAdmin(data: any) {
  return prisma.event.create({ data });
}

export async function updateEventAdmin(id: string, data: any) {
  return prisma.event.update({ where: { id }, data });
}

export async function deleteEventAdmin(id: string) {
  // Cascade delete event registrations
  await prisma.eventRegistration.deleteMany({ where: { eventId: id } });
  return prisma.event.delete({ where: { id } });
}

export async function listEventsAdmin(page: number, limit: number, filters: any) {
  const where: any = {};
  if (filters.status) where.status = filters.status;
  if (filters.search) where.name = { contains: filters.search, mode: "insensitive" };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { startDate: "desc" },
    }),
    prisma.event.count({ where }),
  ]);

  return { events, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getEventDetailAdmin(id: string) {
  return prisma.event.findUnique({ where: { id } });
}

// Partner Admin
export async function approvePartnerAdmin(userId: string, approved: boolean) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status: approved ? "active" : "suspended" },
    include: { partnerProfile: true },
  });

  if (approved) {
    await prisma.notification.create({
      data: {
        userId,
        title: "Partner Application Approved",
        message: "Your partner application has been approved. You can now help students!",
      },
    });
  }

  return user;
}

export async function listPendingPartnersAdmin(page: number, limit: number) {
  const [partners, total] = await Promise.all([
    prisma.user.findMany({
      where: { role: "partner", status: "inactive" },
      include: { partnerProfile: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.count({ where: { role: "partner", status: "inactive" } }),
  ]);

  return { partners, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

// Notifications
export async function sendNotificationAdmin(title: string, message: string, targetRole?: string, targetUserIds?: string[]) {
  let userIds: string[] = [];

  if (targetUserIds && targetUserIds.length > 0) {
    userIds = targetUserIds;
  } else if (targetRole) {
    const users = await prisma.user.findMany({
      where: { role: targetRole },
      select: { id: true },
    });
    userIds = users.map((u) => u.id);
  } else {
    const users = await prisma.user.findMany({
      select: { id: true },
    });
    userIds = users.map((u) => u.id);
  }

  const notifications = await Promise.all(
    userIds.map((uid) =>
      prisma.notification.create({
        data: { userId: uid, title, message },
      })
    )
  );

  return { createdCount: notifications.length, notificationIds: notifications.map((n) => n.id) };
}
```

- [ ] **Step 2: Verify no syntax errors**

Run: `npx tsc --noEmit src/server/services/admin.service.ts`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/server/services/admin.service.ts
git commit -m "feat: add admin services for user, app, event, partner management"
```

---

### Task 3: Admin User API Endpoints

**Files:**
- Create: `app/api/v1/admin/users/route.ts`
- Create: `app/api/v1/admin/users/[id]/route.ts`

- [ ] **Step 1: Write user list & create endpoint**

```typescript
// app/api/v1/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/server/middleware/with-role";
import { withValidation } from "@/server/middleware/with-validation";
import { listUsersAdmin, createUserAdmin } from "@/server/services/admin.service";
import { listUsersSchema, createUserSchema } from "@/server/validators/admin";
import { jsonError } from "@/server/http";

export const GET = withRole(["admin"], async (req) => {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const parsed = listUsersSchema.safeParse(params);
  if (!parsed.success) return jsonError("Invalid params", 400, parsed.error.flatten());

  const result = await listUsersAdmin(parsed.data.page, parsed.data.limit, {
    role: parsed.data.role,
    status: parsed.data.status,
    search: parsed.data.search,
  });

  return NextResponse.json(result);
});

export const POST = withRole(["admin"], async (req) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  try {
    const user = await createUserAdmin(parsed.data.email, parsed.data.password, parsed.data.name, parsed.data.role);
    return NextResponse.json({ user }, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") return jsonError("Email already exists", 409);
    return jsonError("Failed to create user", 500);
  }
});
```

- [ ] **Step 2: Write user detail endpoint**

```typescript
// app/api/v1/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/server/middleware/with-role";
import { getUserDetailAdmin, updateUserAdmin, deactivateUserAdmin } from "@/server/services/admin.service";
import { updateUserSchema } from "@/server/validators/admin";
import { jsonError } from "@/server/http";

export const GET = withRole(["admin"], async (_req, { params }) => {
  const user = await getUserDetailAdmin(params.id);
  if (!user) return jsonError("User not found", 404);
  return NextResponse.json({ user });
});

export const PUT = withRole(["admin"], async (req, { params }) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  try {
    const user = await updateUserAdmin(params.id, parsed.data);
    return NextResponse.json({ user });
  } catch (e: any) {
    if (e.code === "P2025") return jsonError("User not found", 404);
    return jsonError("Failed to update user", 500);
  }
});

export const DELETE = withRole(["admin"], async (_req, { params }) => {
  try {
    await deactivateUserAdmin(params.id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.code === "P2025") return jsonError("User not found", 404);
    return jsonError("Failed to deactivate user", 500);
  }
});
```

- [ ] **Step 3: Test endpoints manually (via curl or API client)**

Expected: GET returns list, POST creates user, PUT updates, DELETE soft-deletes

- [ ] **Step 4: Commit**

```bash
git add app/api/v1/admin/users/
git commit -m "feat: add admin user management API endpoints"
```

---

### Task 4: Admin Application API Endpoints

**Files:**
- Create: `app/api/v1/admin/applications/route.ts`
- Create: `app/api/v1/admin/applications/[id]/route.ts`

- [ ] **Step 1: Write application endpoints**

```typescript
// app/api/v1/admin/applications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/server/middleware/with-role";
import { listApplicationsAdmin } from "@/server/services/admin.service";
import { listApplicationsSchema } from "@/server/validators/admin";
import { jsonError } from "@/server/http";

export const GET = withRole(["admin"], async (req) => {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const parsed = listApplicationsSchema.safeParse(params);
  if (!parsed.success) return jsonError("Invalid params", 400, parsed.error.flatten());

  const result = await listApplicationsAdmin(parsed.data.page, parsed.data.limit, {
    status: parsed.data.status,
    search: parsed.data.search,
  });

  return NextResponse.json(result);
});
```

```typescript
// app/api/v1/admin/applications/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/server/middleware/with-role";
import { getApplicationDetailAdmin, approveApplicationAdmin } from "@/server/services/admin.service";
import { approveApplicationSchema } from "@/server/validators/admin";
import { jsonError } from "@/server/http";

export const GET = withRole(["admin"], async (_req, { params }) => {
  const app = await getApplicationDetailAdmin(params.id);
  if (!app) return jsonError("Application not found", 404);
  return NextResponse.json({ application: app });
});

export const PATCH = withRole(["admin"], async (req, { params }) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = approveApplicationSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  try {
    const app = await approveApplicationAdmin(params.id, parsed.data.status, parsed.data.adminNote);
    return NextResponse.json({ application: app });
  } catch (e: any) {
    if (e.code === "P2025") return jsonError("Application not found", 404);
    return jsonError("Failed to update application", 500);
  }
});
```

- [ ] **Step 2: Test endpoints**

Expected: GET returns app, PATCH updates status and creates notification

- [ ] **Step 3: Commit**

```bash
git add app/api/v1/admin/applications/
git commit -m "feat: add admin application management API endpoints"
```

---

### Task 5: Admin Event API Endpoints

**Files:**
- Create: `app/api/v1/admin/events/route.ts`
- Create: `app/api/v1/admin/events/[id]/route.ts`

- [ ] **Step 1: Write event endpoints**

```typescript
// app/api/v1/admin/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/server/middleware/with-role";
import { listEventsAdmin, createEventAdmin } from "@/server/services/admin.service";
import { listEventsSchema, createEventSchema } from "@/server/validators/admin";
import { jsonError } from "@/server/http";

export const GET = withRole(["admin"], async (req) => {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const parsed = listEventsSchema.safeParse(params);
  if (!parsed.success) return jsonError("Invalid params", 400, parsed.error.flatten());

  const result = await listEventsAdmin(parsed.data.page, parsed.data.limit, {
    status: parsed.data.status,
    search: parsed.data.search,
  });

  return NextResponse.json(result);
});

export const POST = withRole(["admin"], async (req) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  const event = await createEventAdmin(parsed.data);
  return NextResponse.json({ event }, { status: 201 });
});
```

```typescript
// app/api/v1/admin/events/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/server/middleware/with-role";
import { getEventDetailAdmin, updateEventAdmin, deleteEventAdmin } from "@/server/services/admin.service";
import { updateEventSchema } from "@/server/validators/admin";
import { jsonError } from "@/server/http";

export const GET = withRole(["admin"], async (_req, { params }) => {
  const event = await getEventDetailAdmin(params.id);
  if (!event) return jsonError("Event not found", 404);
  return NextResponse.json({ event });
});

export const PUT = withRole(["admin"], async (req, { params }) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = updateEventSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  try {
    const event = await updateEventAdmin(params.id, parsed.data);
    return NextResponse.json({ event });
  } catch (e: any) {
    if (e.code === "P2025") return jsonError("Event not found", 404);
    return jsonError("Failed to update event", 500);
  }
});

export const DELETE = withRole(["admin"], async (_req, { params }) => {
  try {
    await deleteEventAdmin(params.id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.code === "P2025") return jsonError("Event not found", 404);
    return jsonError("Failed to delete event", 500);
  }
});
```

- [ ] **Step 2: Test endpoints**

Expected: Endpoints work, cascade deletes registrations

- [ ] **Step 3: Commit**

```bash
git add app/api/v1/admin/events/
git commit -m "feat: add admin event management API endpoints"
```

---

### Task 6: Admin Partner & Notification API Endpoints

**Files:**
- Create: `app/api/v1/admin/partners/applications/route.ts`
- Create: `app/api/v1/admin/partners/applications/[userId]/route.ts`
- Create: `app/api/v1/admin/notifications/send/route.ts`

- [ ] **Step 1: Write partner endpoints**

```typescript
// app/api/v1/admin/partners/applications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/server/middleware/with-role";
import { listPendingPartnersAdmin } from "@/server/services/admin.service";
import { z } from "zod";
import { jsonError } from "@/server/http";

const schema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const GET = withRole(["admin"], async (req) => {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const parsed = schema.safeParse(params);
  if (!parsed.success) return jsonError("Invalid params", 400, parsed.error.flatten());

  const result = await listPendingPartnersAdmin(parsed.data.page, parsed.data.limit);
  return NextResponse.json(result);
});
```

```typescript
// app/api/v1/admin/partners/applications/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/server/middleware/with-role";
import { approvePartnerAdmin } from "@/server/services/admin.service";
import { approvePartnerSchema } from "@/server/validators/admin";
import { jsonError } from "@/server/http";

export const PATCH = withRole(["admin"], async (req, { params }) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = approvePartnerSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  try {
    const user = await approvePartnerAdmin(params.userId, parsed.data.approved);
    return NextResponse.json({ user });
  } catch (e: any) {
    if (e.code === "P2025") return jsonError("User not found", 404);
    return jsonError("Failed to process partner application", 500);
  }
});
```

- [ ] **Step 2: Write notification endpoint**

```typescript
// app/api/v1/admin/notifications/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/server/middleware/with-role";
import { sendNotificationAdmin } from "@/server/services/admin.service";
import { sendNotificationSchema } from "@/server/validators/admin";
import { jsonError } from "@/server/http";

export const POST = withRole(["admin"], async (req) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = sendNotificationSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  const result = await sendNotificationAdmin(
    parsed.data.title,
    parsed.data.message,
    parsed.data.targetRole,
    parsed.data.targetUserIds
  );

  return NextResponse.json(result, { status: 201 });
});
```

- [ ] **Step 3: Test endpoints**

Expected: Partner approval works, notification creation broadcasts/targets correctly

- [ ] **Step 4: Commit**

```bash
git add app/api/v1/admin/partners/ app/api/v1/admin/notifications/
git commit -m "feat: add admin partner approval and notification sending endpoints"
```

---

### Task 7: Admin Layout & Sidebar Components

**Files:**
- Create: `src/components/admin/AdminLayout.tsx`
- Create: `src/components/admin/AdminSidebar.tsx`

- [ ] **Step 1: Write AdminLayout**

```typescript
// src/components/admin/AdminLayout.tsx
import { withRole } from "@/server/middleware/with-role";
import { redirect } from "next/navigation";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Auth check happens at middleware level via route layer
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Write AdminSidebar**

```typescript
// src/components/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Dashboard", href: "/admin", icon: "📊" },
  { label: "Users", href: "/admin/users", icon: "👥" },
  { label: "Applications", href: "/admin/applications", icon: "📋" },
  { label: "Events", href: "/admin/events", icon: "📅" },
  { label: "Partners", href: "/admin/partners", icon: "🤝" },
  { label: "Notifications", href: "/admin/notifications", icon: "🔔" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-white p-4 shadow-lg">
      <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>
      <nav className="space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-2 rounded transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-slate-800"
              }`}
            >
              {link.icon} {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 3: Create admin layout wrapper at app/(admin)/layout.tsx**

```typescript
// app/(admin)/layout.tsx
import { getCurrentUser } from "@/server/auth/session";
import { redirect } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/sign-in");
  }

  return <AdminLayout>{children}</AdminLayout>;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/ app/\(admin\)/layout.tsx
git commit -m "feat: add admin layout and sidebar components"
```

---

### Task 8: Admin Dashboard Page

**Files:**
- Create: `app/(admin)/page.tsx`

- [ ] **Step 1: Write dashboard**

```typescript
// app/(admin)/page.tsx
import { prisma } from "@/server/db";

export default async function AdminDashboard() {
  const [totalUsers, totalApps, totalEvents, pendingApps, pendingPartners] =
    await Promise.all([
      prisma.user.count(),
      prisma.application.count(),
      prisma.event.count(),
      prisma.application.count({ where: { status: "pending" } }),
      prisma.user.count({ where: { role: "partner", status: "inactive" } }),
    ]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded shadow">
          <div className="text-gray-500 text-sm">Total Users</div>
          <div className="text-4xl font-bold text-blue-600">{totalUsers}</div>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <div className="text-gray-500 text-sm">Total Applications</div>
          <div className="text-4xl font-bold text-blue-600">{totalApps}</div>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <div className="text-gray-500 text-sm">Pending Applications</div>
          <div className="text-4xl font-bold text-yellow-600">{pendingApps}</div>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <div className="text-gray-500 text-sm">Total Events</div>
          <div className="text-4xl font-bold text-blue-600">{totalEvents}</div>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <div className="text-gray-500 text-sm">Pending Partners</div>
          <div className="text-4xl font-bold text-red-600">{pendingPartners}</div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(admin\)/page.tsx
git commit -m "feat: add admin dashboard page with stats"
```

---

### Task 9: Admin User List Page

**Files:**
- Create: `app/(admin)/users/page.tsx`

- [ ] **Step 1: Write user list page**

```typescript
// app/(admin)/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DataTable from "@/components/tables/DataTable";
import type { Column } from "@/components/tables/DataTable";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: "", status: "", search: "" });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(pagination.page),
      limit: String(pagination.limit),
      ...(filters.role && { role: filters.role }),
      ...(filters.status && { status: filters.status }),
      ...(filters.search && { search: filters.search }),
    });

    fetch(`/api/v1/admin/users?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users);
        setPagination(data.pagination);
      })
      .finally(() => setLoading(false));
  }, [pagination.page, pagination.limit, filters]);

  const columns: Column<User>[] = [
    { key: "email", label: "Email", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "role", label: "Role", sortable: true },
    { key: "status", label: "Status", sortable: true },
    {
      key: "action",
      label: "Action",
      render: (user) => (
        <Link href={`/admin/users/${user.id}`} className="text-blue-600 hover:underline">
          Edit
        </Link>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <Link href="/admin/users/new" className="bg-blue-600 px-4 py-2 text-white rounded hover:bg-blue-700">
          + New User
        </Link>
      </div>

      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search..."
          className="border rounded px-3 py-2"
          onChange={(e) => {
            setFilters({ ...filters, search: e.target.value });
            setPagination({ ...pagination, page: 1 });
          }}
        />
        <select
          className="border rounded px-3 py-2"
          onChange={(e) => {
            setFilters({ ...filters, role: e.target.value });
            setPagination({ ...pagination, page: 1 });
          }}
        >
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="counselor">Counselor</option>
          <option value="admin">Admin</option>
          <option value="partner">Partner</option>
        </select>
        <select
          className="border rounded px-3 py-2"
          onChange={(e) => {
            setFilters({ ...filters, status: e.target.value });
            setPagination({ ...pagination, page: 1 });
          }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <DataTable
          columns={columns}
          data={users}
          pagination={pagination}
          onPageChange={(page) => setPagination({ ...pagination, page })}
          onSort={() => {}}
          onSearch={() => {}}
          onLimitChange={(limit) => setPagination({ ...pagination, limit, page: 1 })}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(admin\)/users/page.tsx
git commit -m "feat: add admin user list page"
```

---

### Task 10: Admin User Detail/Edit Page

**Files:**
- Create: `app/(admin)/users/[id]/page.tsx`

- [ ] **Step 1: Write detail page**

```typescript
// app/(admin)/users/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  gender: string | null;
  country: string | null;
  role: string;
  status: string;
  createdAt: string;
}

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});

  useEffect(() => {
    fetch(`/api/v1/admin/users/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user);
        setFormData(data.user);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/v1/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("User updated");
        router.push("/admin/users");
      } else {
        alert("Failed to update user");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate() {
    if (!confirm("Deactivate this user?")) return;

    try {
      await fetch(`/api/v1/admin/users/${id}`, { method: "DELETE" });
      alert("User deactivated");
      router.push("/admin/users");
    } catch {
      alert("Failed to deactivate user");
    }
  }

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit User</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block text-sm font-medium">Email (read-only)</label>
          <input type="email" value={user.email} disabled className="w-full border rounded px-3 py-2 bg-gray-50" />
        </div>

        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Role</label>
          <select
            value={formData.role || ""}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full border rounded px-3 py-2"
          >
            <option value="student">Student</option>
            <option value="counselor">Counselor</option>
            <option value="admin">Admin</option>
            <option value="partner">Partner</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            value={formData.status || ""}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full border rounded px-3 py-2"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div className="flex gap-2 pt-4">
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeactivate}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
          >
            Deactivate
          </button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(admin\)/users/\[id\]/page.tsx
git commit -m "feat: add admin user detail/edit page"
```

---

### Task 11: Admin User Create Page

**Files:**
- Create: `app/(admin)/users/new/page.tsx`

- [ ] **Step 1: Write create page**

```typescript
// app/(admin)/users/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminUserCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "student",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/v1/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("User created");
        router.push("/admin/users");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create user");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Create New User</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Password (min 8 chars)</label>
          <input
            type="password"
            required
            minLength={8}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full border rounded px-3 py-2"
          >
            <option value="student">Student</option>
            <option value="counselor">Counselor</option>
            <option value="admin">Admin</option>
            <option value="partner">Partner</option>
          </select>
        </div>

        <div className="flex gap-2 pt-4">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            {loading ? "Creating..." : "Create"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(admin\)/users/new/page.tsx
git commit -m "feat: add admin user create page"
```

---

### Task 12: Admin Application Pages (List & Detail)

**Files:**
- Create: `app/(admin)/applications/page.tsx`
- Create: `app/(admin)/applications/[id]/page.tsx`

- [ ] **Step 1: Write application list page (similar to user list)**

```typescript
// app/(admin)/applications/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DataTable from "@/components/tables/DataTable";
import type { Column } from "@/components/tables/DataTable";

interface Application {
  id: string;
  applicationCode: string;
  user: { name: string; email: string };
  programName: string;
  universityName: string;
  status: string;
  appliedAt: string;
}

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(pagination.page),
      limit: String(pagination.limit),
      ...(status && { status }),
    });

    fetch(`/api/v1/admin/applications?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setApps(data.applications);
        setPagination(data.pagination);
      })
      .finally(() => setLoading(false));
  }, [pagination.page, pagination.limit, status]);

  const columns: Column<Application>[] = [
    { key: "applicationCode", label: "Code", sortable: true },
    { key: "programName", label: "Program", sortable: true },
    { key: "universityName", label: "University", sortable: true },
    { key: "status", label: "Status", sortable: true },
    {
      key: "action",
      label: "Action",
      render: (app) => (
        <Link href={`/admin/applications/${app.id}`} className="text-blue-600 hover:underline">
          Review
        </Link>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Applications</h1>

      <div className="mb-4">
        <select
          className="border rounded px-3 py-2"
          onChange={(e) => {
            setStatus(e.target.value);
            setPagination({ ...pagination, page: 1 });
          }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <DataTable
          columns={columns}
          data={apps}
          pagination={pagination}
          onPageChange={(page) => setPagination({ ...pagination, page })}
          onSort={() => {}}
          onSearch={() => {}}
          onLimitChange={(limit) => setPagination({ ...pagination, limit, page: 1 })}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write application detail page with approve/reject**

```typescript
// app/(admin)/applications/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Application {
  id: string;
  applicationCode: string;
  user: { id: string; name: string; email: string };
  programName: string;
  universityName: string;
  status: string;
  applicationFee: number;
  applicationFeePaid: number;
  serviceCharge: number;
  serviceChargePaid: number;
}

export default function AdminApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    fetch(`/api/v1/admin/applications/${id}`)
      .then((r) => r.json())
      .then((data) => setApp(data.application))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleApprove() {
    setProcessing(true);
    try {
      const res = await fetch(`/api/v1/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved", adminNote: note }),
      });

      if (res.ok) {
        alert("Application approved");
        router.push("/admin/applications");
      }
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject() {
    setProcessing(true);
    try {
      const res = await fetch(`/api/v1/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected", adminNote: note }),
      });

      if (res.ok) {
        alert("Application rejected");
        router.push("/admin/applications");
      }
    } finally {
      setProcessing(false);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (!app) return <div>Application not found</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Application Review</h1>

      <div className="bg-white p-6 rounded shadow space-y-4">
        <div>
          <label className="text-sm font-medium">Code</label>
          <p>{app.applicationCode}</p>
        </div>

        <div>
          <label className="text-sm font-medium">Applicant</label>
          <p>
            {app.user.name} ({app.user.email})
          </p>
        </div>

        <div>
          <label className="text-sm font-medium">Program</label>
          <p>
            {app.programName} at {app.universityName}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium">Status</label>
          <p className="font-bold">{app.status}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-y">
          <div>
            <p className="text-sm text-gray-600">Application Fee</p>
            <p>${app.applicationFee.toFixed(2)} (Paid: ${app.applicationFeePaid.toFixed(2)})</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Service Charge</p>
            <p>${app.serviceCharge.toFixed(2)} (Paid: ${app.serviceChargePaid.toFixed(2)})</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Admin Note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows={4}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <button
            onClick={handleApprove}
            disabled={processing}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            {processing ? "Processing..." : "Approve"}
          </button>
          <button
            onClick={handleReject}
            disabled={processing}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
          >
            Reject
          </button>
          <button
            onClick={() => router.back()}
            className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(admin\)/applications/
git commit -m "feat: add admin application list and detail pages"
```

---

### Task 13: Admin Event Pages (List, Detail, Create)

**Files:**
- Create: `app/(admin)/events/page.tsx`
- Create: `app/(admin)/events/[id]/page.tsx`
- Create: `app/(admin)/events/new/page.tsx`

(Similar pattern to users and applications — list with DataTable, detail with edit, new with form)

- [ ] **Step 1-3: Write all three event pages** (following same pattern as Tasks 10-12)

- [ ] **Step 4: Commit**

```bash
git add app/\(admin\)/events/
git commit -m "feat: add admin event list, detail, and create pages"
```

---

### Task 14: Admin Partner Applications Pages (List & Review)

**Files:**
- Create: `app/(admin)/partners/page.tsx`
- Create: `app/(admin)/partners/[userId]/page.tsx`

(Partner list shows pending approvals, review page has approve/reject buttons)

- [ ] **Step 1-2: Write partner list and review pages** (similar to applications)

- [ ] **Step 3: Commit**

```bash
git add app/\(admin\)/partners/
git commit -m "feat: add admin partner application list and review pages"
```

---

### Task 15: Admin Notification Creation Page

**Files:**
- Create: `app/(admin)/notifications/page.tsx`

- [ ] **Step 1: Write notification creation page**

```typescript
// app/(admin)/notifications/page.tsx
"use client";

import { useState } from "react";

export default function AdminNotificationsPage() {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    target: "all" as "all" | "role" | "users",
    targetRole: "",
    targetUserIds: [] as string[],
  });
  const [loading, setLoading] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const body: any = {
      title: formData.title,
      message: formData.message,
    };

    if (formData.target === "role" && formData.targetRole) {
      body.targetRole = formData.targetRole;
    } else if (formData.target === "users" && formData.targetUserIds.length > 0) {
      body.targetUserIds = formData.targetUserIds;
    }

    try {
      const res = await fetch("/api/v1/admin/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Notification sent to ${data.createdCount} users`);
        setFormData({
          title: "",
          message: "",
          target: "all",
          targetRole: "",
          targetUserIds: [],
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Send Notification</h1>

      <form onSubmit={handleSend} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Message</label>
          <textarea
            required
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full border rounded px-3 py-2"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Target</label>
          <div className="space-y-2">
            <label>
              <input
                type="radio"
                value="all"
                checked={formData.target === "all"}
                onChange={(e) => setFormData({ ...formData, target: e.target.value as any })}
              />
              <span className="ml-2">All Users</span>
            </label>
            <label>
              <input
                type="radio"
                value="role"
                checked={formData.target === "role"}
                onChange={(e) => setFormData({ ...formData, target: e.target.value as any })}
              />
              <span className="ml-2">By Role</span>
            </label>
            {formData.target === "role" && (
              <select
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select Role</option>
                <option value="student">Students</option>
                <option value="partner">Partners</option>
              </select>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(admin\)/notifications/page.tsx
git commit -m "feat: add admin notification creation and send page"
```

---

### Task 16: Admin Integration Tests

**Files:**
- Create: `tests/integration/admin/users.test.ts`
- Create: `tests/integration/admin/applications.test.ts`
- Create: `tests/integration/admin/events.test.ts`
- Create: `tests/integration/admin/partners.test.ts`

- [ ] **Step 1: Write user endpoint tests** (list, create, update, delete)

- [ ] **Step 2: Write application endpoint tests** (list, approve, reject)

- [ ] **Step 3: Write event endpoint tests** (CRUD)

- [ ] **Step 4: Write partner endpoint tests** (list, approve)

- [ ] **Step 5: Run all tests**

Run: `npx vitest run tests/integration/admin/`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add tests/integration/admin/
git commit -m "test: add integration tests for all admin endpoints"
```

---

### Task 17: Full Test Run & Validation

- [ ] **Step 1: Run full test suite**

Run: `npx vitest run`
Expected: 150+ tests passing

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Manual visual testing**

Test in browser:
- Login as admin
- Create user, edit, deactivate
- Review and approve application (check notification sent)
- Create event, delete
- Review and approve partner
- Send notification to all/role/users

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: Plan 03 admin panel complete - all tests passing"
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-24-plan-03-admin-panel.md`. 

**Two execution options:**

**1. Subagent-Driven (Recommended)** — I dispatch a fresh Haiku subagent per task (Tasks 1-3), review between tasks for quality, fast iteration with minimal context overhead.

**2. Inline Execution** — Execute all tasks in this session using executing-plans, batch execution with checkpoints.

Which approach would you prefer?