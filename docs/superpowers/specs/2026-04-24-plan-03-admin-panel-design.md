# Plan 03: Admin Panel — Design Spec

> **For agentic workers:** This spec covers the core admin dashboard for managing users, applications, events, and partner approvals. Plan 03b will add advanced features (consultations, newsletter, galleries, etc.).

**Goal:** Build an admin-only dashboard where consultancy staff can manage platform data: users, applications, events, and partner applications.

**Architecture:** Monolithic admin dashboard at `/admin/*` with detail-page pattern for editing. Separate API namespace (`/api/v1/admin/*`) for admin operations. All routes protected by `withRole(['admin'])` middleware.

**Tech Stack:** Next.js App Router, React forms, Tailwind CSS, Zod validation, Prisma ORM (no schema changes).

---

## Route Structure

### Admin Dashboard Pages

```
/admin                          → Dashboard (stats overview)
/admin/users                    → User list + filters
/admin/users/[id]               → User detail/edit page
/admin/users/new                → Create new user
/admin/applications             → Application list + filters
/admin/applications/[id]        → Application detail + approve/reject
/admin/events                   → Event list + filters
/admin/events/[id]              → Event detail/edit page
/admin/events/new               → Create new event
/admin/partners                 → Partner application list (pending)
/admin/partners/[id]            → Partner application review page
/admin/notifications            → Notification creation + send
```

All `/admin/*` routes require `role === 'admin'`. Unauthorized access redirects to login or dashboard.

---

## API Endpoints (New)

### Users Management

**GET `/api/v1/admin/users`**
- Query params: `page`, `limit`, `role` (filter), `status` (filter), `search` (by email/name)
- Returns: paginated user list with id, email, name, role, status, createdAt

**GET `/api/v1/admin/users/[id]`**
- Returns: full user object (id, email, name, phone, gender, country, role, status, avatar, createdAt, updatedAt)

**POST `/api/v1/admin/users`**
- Body: `{ email, password, name, role }` (role: student/counselor/admin/partner)
- Returns: created user object
- Auto-generates hashed password, sets status to active

**PUT `/api/v1/admin/users/[id]`**
- Body: `{ name?, email?, role?, status? }` (partial update)
- Returns: updated user object
- Note: email change should check for duplicates

**DELETE `/api/v1/admin/users/[id]` (Soft Delete)**
- Sets user.status = 'suspended'
- Does not delete from DB, preserves data integrity
- Returns: success message

### Applications Management

**GET `/api/v1/admin/applications`**
- Query params: `page`, `limit`, `status` (pending/approved/rejected/cancelled), `search` (by app code/program name)
- Returns: paginated list with id, applicationCode, user (id, name, email), programName, universityName, status, appliedAt

**GET `/api/v1/admin/applications/[id]`**
- Returns: full application with user details, all fee fields, adminNote (if exists)

**PATCH `/api/v1/admin/applications/[id]`**
- Body: `{ status, adminNote? }` (status: approved/rejected)
- Returns: updated application
- Creates notification for student when status changes

### Events Management

**GET `/api/v1/admin/events`**
- Query params: `page`, `limit`, `status` (upcoming/ongoing/past), `search` (by name)
- Returns: paginated list with id, name, startDate, endDate, price, status, createdAt

**POST `/api/v1/admin/events`**
- Body: `{ name, startDate, endDate, price, category?, location?, description?, image? }`
- Returns: created event
- startDate/endDate validation: endDate > startDate

**GET `/api/v1/admin/events/[id]`**
- Returns: full event object

**PUT `/api/v1/admin/events/[id]`**
- Body: partial event update (name, dates, price, etc.)
- Returns: updated event

**DELETE `/api/v1/admin/events/[id]`**
- Deletes event (cascade delete eventRegistrations)
- Returns: success message

### Partner Applications Management

**GET `/api/v1/admin/partners/applications`**
- Query params: `page`, `limit`, `status` (pending only, or pending+reviewed)
- Returns: list of users with role='partner' and status='inactive'
- Shows: id, email, name, partnerProfile (level, qualifications, experience), createdAt

**PATCH `/api/v1/admin/partners/applications/[userId]`**
- Body: `{ approved: boolean, adminNote? }`
- If approved: set user.status = 'active'
- If rejected: set user.status = 'suspended' + store reject reason
- Returns: updated user object + status

### Notifications

**POST `/api/v1/admin/notifications/send`**
- Body: `{ title, message, targetRole? (optional: 'student'/'partner'/null for all), targetUserIds? (optional: [id1, id2] for specific users) }`
- Creates notification records in DB
- Returns: { createdCount, notificationIds }
- Note: No email sending in Plan 03 (deferred to Phase 2)

---

## UI Components & Patterns

### Layout

**AdminLayout** (new wrapper):
- Server component, checks `withRole(['admin'])` via middleware
- Renders: Sidebar nav + Top bar (admin name + logout) + main content
- Sidebar has links to: Dashboard, Users, Applications, Events, Partners, Notifications

**AdminSidebar** (new):
- Links: Dashboard, Users, Applications, Events, Partners, Notifications
- Highlights current section based on pathname
- Color scheme: dark (matches Plan 02 sidebar)

### List Pages

Reuse `DataTable` from Plan 02:
- Paginated rows, sortable columns, search box
- Filters (status, role, date range) via FilterBar or custom dropdowns
- Action column: Edit (link to detail page), Delete/Deactivate (via modal confirmation)
- Pagination controls

### Detail Pages

New pattern:
- Breadcrumb: Admin > Section > Item (e.g., Admin > Users > john@example.com)
- Form with fields (read-only for some: id, createdAt)
- Submit button (Update/Save), Cancel button (back to list)
- Success toast on save
- Delete/Deactivate button (separate, with confirmation modal)

**User Detail Page** fields:
- Email (read-only), Name, Phone, Gender, Country, Role (dropdown), Status (dropdown: active/inactive/suspended)

**Application Detail Page** fields:
- Application Code (read-only), User, Program Name, University, Status (read-only or editable: pending/approved/rejected/cancelled)
- Fee fields (read-only): applicationFee, applicationFeePaid, serviceCharge, serviceChargePaid
- Admin Note (textarea) for approval/rejection reason
- Approve button, Reject button

**Event Detail Page** fields:
- Name, Start Date, End Date, Price, Category, Location, Description, Image (upload)

**Partner Application Review** page:
- User info (read-only): name, email, qualifications, experience, level
- Action buttons: Approve (creates partner account + notification), Reject + note

**Notification Creation** page:
- Title (text), Message (textarea), Target (radio: All / Specific Role / Specific Users)
- If Specific Users: searchable user list with checkboxes
- Send button

### Form Components

Reuse from Plan 02:
- TextInput, Select, Textarea, DateInput
- New: FileUpload for event images
- New: MultiSelect for partner user targeting
- New: ConfirmDialog for destructive actions (delete, reject, deactivate)

### Data Display

- Status badges: colors for pending/approved/rejected/active/inactive
- Date formatting: ISO → readable (2026-04-24 → Apr 24, 2026)
- Currency: $ prefix for prices/fees
- Timestamps: relative (2 hours ago) or absolute (Apr 24, 2026, 2:30 PM)

---

## Database & Schema

No new tables or model changes. Uses existing:
- User (with role, status fields)
- Application (with status field)
- Event
- PartnerProfile (for partner details on review page)

---

## Authentication & Authorization

**Middleware:**
- All routes in `/admin/*` protected by `withRole(['admin'])` at layout level
- Route handlers in `/api/v1/admin/*` protected by `withRole(['admin'])`
- Unauthorized access: return 403 Forbidden

**Session:**
- Admin logs in via existing `/sign-in` as student or partner? No — need separate admin login route.
- Deferred to Plan 03b: separate admin sign-in page. For Plan 03, assume admins are created via admin user creation API, can log in as regular users with admin role.

---

## Testing Strategy

- **Unit tests:** Application service approve/reject logic, user role/status updates
- **Integration tests:** All admin API endpoints (auth check, validation, happy path)
- **E2E (manual):** Admin flows (create user, approve application, edit event)

---

## What's NOT Included (Plan 03b)

- Consultation request management
- Newsletter subscriber list
- Team management (photos, bios)
- Gallery uploads (authorization letters, activity photos)
- Blog/article CRUD
- Notice board
- FAQ management
- Counselor access (role-based views)
- Bulk actions (delete multiple, export)
- Advanced analytics
- Audit logs

---

## File Structure

```
app/
  (admin)/
    layout.tsx                  → AdminLayout wrapper
    page.tsx                    → Dashboard
    users/
      page.tsx                  → User list
      [id]/
        page.tsx                → User detail
      new/
        page.tsx                → Create user
    applications/
      page.tsx                  → Application list
      [id]/
        page.tsx                → Application detail
    events/
      page.tsx                  → Event list
      [id]/
        page.tsx                → Event detail
      new/
        page.tsx                → Create event
    partners/
      page.tsx                  → Partner applications list
      [id]/
        page.tsx                → Partner application review
    notifications/
      page.tsx                  → Notification creation

  api/v1/admin/
    users/
      route.ts                  → GET (list), POST (create)
      [id]/
        route.ts                → GET (detail), PUT (update), DELETE (soft)
    applications/
      route.ts                  → GET (list)
      [id]/
        route.ts                → GET (detail), PATCH (approve/reject)
    events/
      route.ts                  → GET (list), POST (create)
      [id]/
        route.ts                → GET (detail), PUT (update), DELETE
    partners/
      applications/
        route.ts                → GET (list)
        [userId]/
          route.ts              → PATCH (approve/reject)
    notifications/
      send/
        route.ts                → POST (create + send)

src/
  components/
    admin/
      AdminLayout.tsx
      AdminSidebar.tsx
      ConfirmDialog.tsx
  server/
    services/
      user.admin.service.ts     → createUser, updateUser, deactivateUser
      application.admin.service.ts
      event.admin.service.ts
      partner.admin.service.ts
    validators/
      admin.ts                  → Zod schemas for all admin inputs
```

