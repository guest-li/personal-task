# Plan 02: Student & Partner Dashboard — Design Spec

## Overview

Build the full authenticated dashboard experience for students and partners. This includes the shared dashboard shell (sidebar + top bar), stat cards with charts, application management, event registration management, profile editing with file uploads, notifications, and partner-specific features (inactive gate, level display, extra filters).

**Scope:** 47 features from Section R of the feature list (features 134–180).

**Prerequisites:** Plan 01 (Foundation & Auth) — completed. Provides auth system, User/StudentProfile/PartnerProfile/Certificate models, JWT cookies, middleware.

## Architecture

**Approach:** Route-per-feature with shared layout (Next.js App Router).

A shared layout at `app/(dashboard)/layout.tsx` provides the sidebar and top bar. Each feature is an independent page under its own route. This matches the reference site URL structure and isolates features from each other.

### Route Structure

| Route | Component | Roles |
|-------|-----------|-------|
| `/user/dashboard` | Dashboard home — stat cards + charts | Student, Partner |
| `/user/my-application` | Application table with filters/sort/export | Student, Partner |
| `/user/my-event` | Event registration table with export | Student only |
| `/user/profile/[id]` | Edit profile, certificates, change password | Student only |
| `/user/notification` | Notification inbox | Student, Partner |

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/v1/users/dashboard-stats` | Stat card values + chart data (role-aware) |
| `GET` | `/api/v1/applications` | List applications (paginated, filterable, sortable) |
| `POST` | `/api/v1/applications` | Create new application |
| `PATCH` | `/api/v1/applications/[id]` | Cancel an application |
| `GET` | `/api/v1/events/my-registrations` | List user's event registrations (paginated) |
| `GET` | `/api/v1/notifications` | List notifications (paginated) |
| `PATCH` | `/api/v1/notifications/read` | Mark notifications as read |
| `PUT` | `/api/v1/users/profile` | Update profile fields (User + StudentProfile) |
| `POST` | `/api/v1/users/avatar` | Upload profile photo |
| `PUT` | `/api/v1/users/password` | Change password (verify current first) |
| `POST` | `/api/v1/users/certificates` | Upload certificate |
| `DELETE` | `/api/v1/users/certificates/[id]` | Remove certificate |

All endpoints are protected by `withAuth`. Role-specific endpoints use `withRole`.

## Data Models

### New Prisma Models

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

### User Model Updates

Add relations to existing User model:

```prisma
model User {
  // ... existing fields ...
  applications       Application[]
  eventRegistrations EventRegistration[]
  notifications      Notification[]
}
```

### Application Code Generation

Auto-generated format: `APP-YYYYMMDD-NNN` (e.g., `APP-20260420-001`).

Generated server-side in the application service: query today's application count, increment, zero-pad to 3 digits. Use a transaction to prevent race conditions.

## File Upload Service

Abstracted behind an interface for future S3 migration:

```ts
// src/server/services/upload.service.ts
interface UploadResult {
  url: string;   // public URL to access the file
  key: string;   // storage key for deletion
}

uploadFile(file: Buffer, filename: string, folder: string): Promise<UploadResult>
deleteFile(key: string): Promise<void>
```

**Local implementation (Plan 02):**
- Saves to `public/uploads/{folder}/{timestamp}-{filename}`
- Returns URL as `/uploads/{folder}/{timestamp}-{filename}`
- Folders: `avatars`, `certificates`
- Max file size: 5MB for avatars, 10MB for certificates
- Allowed types: images (jpg/png/webp) for avatars; images + PDF for certificates
- Sanitizes filenames (strip special chars, lowercase)

**Future S3 migration:** Replace the local implementation inside `upload.service.ts`. No consuming code changes.

## Dashboard Shell

### Layout (`app/(dashboard)/layout.tsx`)

Server component that:
1. Calls `getCurrentUser()` to verify auth — redirects to `/sign-in` if not authenticated
2. Fetches user data from DB (name, avatar, role, status)
3. Renders `<Sidebar>` + `<TopBar>` + `<main>{children}</main>`
4. For partners with `status === "inactive"`, renders `<InactiveOverlay>` instead of children

### Top Bar

- Left: hamburger button (toggles sidebar collapse)
- Center: global search input
- Right: notification bell with unread count badge (green), user avatar + name (click for dropdown with logout)

### Sidebar

Role-aware navigation items:

**Student:**
- Dashboard (`/user/dashboard`)
- My Application (`/user/my-application`)
- My Events (`/user/my-event`)
- Edit Profile (`/user/profile/{userId}`)
- Notification (`/user/notification`)

**Partner:**
- Dashboard (`/user/dashboard`)
- Apply For New (→ `/list/all-universities`, external link — placeholder for now)
- My Application (`/user/my-application`)
- Notification (`/user/notification`)

Partners do NOT see: My Events, Edit Profile.

Active item is highlighted based on current pathname.

### Sidebar Collapse

State managed via React context or local state in the layout. Toggles between full sidebar (with labels) and icon-only narrow sidebar. Persisted in localStorage.

## Dashboard Page (`/user/dashboard`)

### Stat Cards

**Student (4 cards):**
1. Applications — total count, document icon
2. Total Application Fees Paid — sum, wallet icon
3. Total Service Charge — sum, stack icon
4. Total Service Charge Paid — sum, folder icon

**Partner (5 cards):**
Same 4 as student, plus:
5. Your Level: Beginner/Intermediate/Advanced/Expert — from PartnerProfile.level, badge icon

### Charts (recharts)

**Applications History Diagram:**
- Line chart, X-axis: months, Y-axis: count
- Two series: total applications (pink) + approved (blue)
- Shows last 12 months

**Summary Chart:**
- Bar chart comparing 3 values: Applications count, Service Charge total, Application Fees total
- Grouped bars

### API: `GET /api/v1/users/dashboard-stats`

Returns:
```json
{
  "stats": {
    "totalApplications": 12,
    "applicationFeesPaid": 5000.00,
    "serviceCharge": 3000.00,
    "serviceChargePaid": 2500.00,
    "partnerLevel": "beginner"  // only for partners
  },
  "charts": {
    "applicationHistory": [
      { "month": "2026-01", "applications": 3, "approved": 1 },
      ...
    ],
    "summary": {
      "applications": 12,
      "serviceCharge": 3000.00,
      "applicationFees": 5000.00
    }
  }
}
```

## My Application Page (`/user/my-application`)

### Filters

**Student filters:**
- Fund Type dropdown: All / Self-funded / Scholarship
- Status dropdown: All / Pending / Approved / Rejected / Cancelled

**Partner additional filters:**
- University dropdown
- Degree level dropdown
- "Manage Fields" button — opens modal to toggle column visibility
- "Manage Filters" button — opens modal to toggle which filters are shown

### Table

Columns: SL (row number), Application Code, Program Name, University, Status (color-coded badge), Action

Sortable by clicking column headers (toggle asc/desc).

Right-side search box for client-side row filtering.

Pagination: "Showing X to Y of Z entries" + Previous/Next buttons. Page size configurable (10/25/50).

### Creating Applications

For this plan, applications are created via `POST /api/v1/applications` with a JSON body containing `programName`, `universityName`, `degree`, `language`, `fundType`. The UI entry point is the "Apply For New" sidebar link (partner) or a future course/university listing page (student). The full application creation UI (selecting from real university/course data) is deferred to the plan that builds the universities/courses listing. For now, the API endpoint exists and can be tested, but there's no dedicated "create application" form page.

### Action Column

- View — opens application detail (modal or expandable row)
- Cancel — only for `pending` status, confirmation dialog before cancelling

### Export

Three green buttons above the table:
- **Excel** — generates .xlsx using `xlsx` library
- **PDF** — generates PDF using `jspdf` + `jspdf-autotable`
- **Print** — triggers `window.print()` with print-friendly styles

### API: `GET /api/v1/applications`

Query params: `page`, `limit`, `sortBy`, `sortOrder`, `fundType`, `status`, `search`, `university`, `degree`

Returns:
```json
{
  "applications": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

## My Events Page (`/user/my-event`)

Student only. Same table pattern as My Application.

Columns: SL, Event Name, Start Date, End Date, Price, Order Date, Payment Status (badge), Action

Same export buttons (Excel/PDF/Print), search box, sortable columns, pagination.

### API: `GET /api/v1/events/my-registrations`

Query params: `page`, `limit`, `sortBy`, `sortOrder`, `search`

Returns same pagination structure as applications.

## Edit Profile Page (`/user/profile/[id]`)

Student only. Four sections on one page.

### Section 1: Personal Info

- Profile photo: drag-and-drop zone showing current avatar. On drop/select, uploads via `POST /api/v1/users/avatar`, preview updates immediately.
- 11 fields in a form grid:
  - Full Name (text, required)
  - Email (text, read-only/disabled)
  - Mobile (tel)
  - Gender (dropdown: Male/Female/Other)
  - Passport/NID (text)
  - Qualification (dropdown: High School/Bachelor/Master)
  - Interested Major (text)
  - Last Academic Result (text)
  - Experience (text)
  - Language (text)
  - Address (text)
- Save button calls `PUT /api/v1/users/profile`

### Section 2: About

- Free-text textarea for bio/details
- Included in the same `PUT /api/v1/users/profile` call

### Section 3: Certificates

- List of existing certificates: name + file link + delete (X) button
- Delete calls `DELETE /api/v1/users/certificates/[id]` with confirmation dialog
- Add new row: Certificate Name (text input) + Certificate File (file input) + "+" button
- "+" calls `POST /api/v1/users/certificates` (multipart form: name + file)

### Section 4: Change Password

- Current Password (with eye toggle)
- New Password (with eye toggle)
- Confirm Password (with eye toggle)
- Submit calls `PUT /api/v1/users/password`
- Server verifies current password matches before updating

## Notification Page (`/user/notification`)

Both student and partner.

- Title: "My Notification"
- List of notifications: title, message preview, timestamp, read/unread dot indicator
- Click notification → marks as read, expands full message
- "Mark all as read" button
- Empty state: "No notifications yet"
- Paginated (load more or traditional pagination)

## Partner-Specific Features

### Inactive Account Gate

In the dashboard layout: if `user.role === "partner" && user.status === "inactive"`, render `<InactiveOverlay>` instead of children.

Overlay: full-screen centered card with message "Your account is inactive — Please contact the administrator to activate your account." No navigation possible — sidebar and content are blocked.

### Shared URL

Both student and partner use `/user/dashboard`. The layout detects role and conditionally renders different sidebar items and stat cards.

### "Apply For New" Link

Sidebar item for partners only. Links to `/list/all-universities`. Since the universities listing page doesn't exist yet (future plan), it will link to the homepage (`/`) as a placeholder.

## Reusable Components

```
src/components/
  dashboard/
    Sidebar.tsx          — role-aware nav, collapsible, active state
    TopBar.tsx           — search, notification bell, avatar dropdown
    StatCard.tsx         — icon + label + value, reusable
    InactiveOverlay.tsx  — partner inactive blocking overlay
  tables/
    DataTable.tsx        — generic sortable, paginated, searchable table
    ExportButtons.tsx    — Excel/PDF/Print export actions
    FilterBar.tsx        — configurable dropdown filters
  forms/
    FileUpload.tsx       — drag-and-drop file upload with preview
    PasswordInput.tsx    — password input with eye toggle visibility
```

## Dependencies (new npm packages)

- `recharts` — React charting library for dashboard charts
- `xlsx` — Excel file generation for export
- `jspdf` + `jspdf-autotable` — PDF generation for export
- `multer` or Next.js built-in `formData` — file upload parsing (Next.js 14 has built-in `request.formData()`, no extra package needed)

## Testing Strategy

- **Unit tests:** upload service, application code generation, dashboard stats aggregation
- **Integration tests:** all 12 API endpoints (auth-protected, role-checked, paginated)
- **No E2E tests** in this plan — UI pages verified manually via dev server

## What's NOT Included (Deferred)

- Admin panel (creates notifications, manages applications, activates partners) — Plan 03+
- Universities/courses/scholarships listing pages — future plan
- Event creation (admin-side) — future plan
- Real payment processing — future plan
- S3 file storage — future migration of upload service
- Google OAuth — deferred from Plan 01
