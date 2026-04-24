# Education Consultancy Platform — High-Level Design (HLD)

> Companion document to the [PRD](./2026-04-09-education-consultancy-platform-PRD.md). Read the PRD first for product context, user roles, data model, and page structure.

---

## 1. System Architecture

**Single-service architecture:** one Next.js application serves both the UI (pages) and the REST API (route handlers under `app/api`). No separate Express server. This simplifies deployment (one container), eliminates cross-origin concerns, and lets server components read the database directly.

```
┌──────────────────────────────────────────────────────────┐
│                    Next.js Application                    │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │                  UI Layer                         │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │   │
│  │  │  Public  │ │ Student  │ │   Admin Panel    │ │   │
│  │  │  Site    │ │ Dashboard│ │     (CSR)        │ │   │
│  │  │ (SSG/ISR)│ │  (CSR)   │ │                  │ │   │
│  │  └──────────┘ └──────────┘ └──────────────────┘ │   │
│  │  ┌──────────┐                                    │   │
│  │  │ Partner  │    Tailwind CSS + SWR + next-intl  │   │
│  │  │ Dashboard│                                    │   │
│  │  │  (CSR)   │                                    │   │
│  │  └──────────┘                                    │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                                │
│                 (fetch / server components)               │
│                          │                                │
│  ┌──────────────────────▼───────────────────────────┐   │
│  │        API Layer — Next.js Route Handlers         │   │
│  │              (app/api/v1/**/route.ts)              │   │
│  │                                                    │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌────────┐ │   │
│  │  │ auth │ │ univ │ │ prog │ │ blog │ │partner │ │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └────────┘ │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌────────┐ │   │
│  │  │schol.│ │event │ │gallry│ │admin │ │ upload │ │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └────────┘ │   │
│  │                                                    │   │
│  │  Shared: src/server/ (services, validators,       │   │
│  │  middleware wrappers, db client, auth, email)     │   │
│  └────────────────────────────────────────────────────┘   │
└─────────┬─────────────────┬────────────────┬─────────────┘
          │                 │                │
    ┌─────▼──────┐  ┌───────▼──────┐  ┌─────▼──────────┐
    │PostgreSQL  │  │    Redis      │  │  File Storage  │
    │ (Prisma)   │  │ (sessions,    │  │  (AWS S3 /     │
    │            │  │  rate limit,  │  │   local disk)  │
    │            │  │  cache)       │  │                │
    └────────────┘  └───────────────┘  └────────────────┘
                            │
                  ┌─────────▼──────────┐
                  │  External Services │
                  │────────────────────│
                  │  SMTP (SendGrid)   │
                  │  Google OAuth      │
                  │  Tawk.to (chat)    │
                  │  Phase 2: SMS GW   │
                  │  Phase 2: Payment  │
                  └────────────────────┘
```

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) — serves UI and API from one process |
| UI | React 18, Tailwind CSS, SWR, shadcn/ui primitives |
| API | Next.js route handlers (`app/api/v1/**/route.ts`) |
| ORM | Prisma |
| Database | PostgreSQL |
| Cache/Sessions | Redis (ioredis client) |
| Auth | JWT + refresh tokens (httpOnly cookies), bcrypt, Google OAuth |
| Validation | Zod |
| File Storage | AWS S3 in production, local disk for dev (pluggable storage adapter) |
| Email | Nodemailer + SMTP (SendGrid) |
| Rich Text Editor | TipTap |
| i18n | next-intl (English + Nepali) |
| Live Chat | Tawk.to (embedded widget) |
| Testing | Vitest (unit + route-handler integration), Playwright (e2e, later plans) |
| Deployment | Docker single-container, Nginx reverse proxy in front |

---

## 3. Application Architecture (single Next.js app)

```
app/                              # Next.js App Router (UI + API in one tree)
├── [locale]/                     # i18n segment (en, ne) — wraps all user-facing pages
│   ├── (public)/                 # Public marketing pages (SSG/ISR)
│   │   ├── page.tsx              # Home
│   │   ├── universities/
│   │   ├── programs/
│   │   ├── scholarships/
│   │   ├── about/
│   │   ├── services/
│   │   ├── team/
│   │   ├── study-in-[country]/
│   │   ├── blog/
│   │   ├── events/
│   │   ├── notices/
│   │   ├── gallery/{authorization,activities}/
│   │   ├── offices/
│   │   ├── contact/
│   │   ├── consultation/
│   │   ├── become-partner/
│   │   ├── payment-process/
│   │   ├── faq/
│   │   └── [legal-slug]/         # privacy-policy, refund-policy, terms-conditions
│   ├── (auth)/                   # login, register, forgot-password
│   ├── dashboard/                # Student dashboard (CSR, protected)
│   └── partner/                  # Partner dashboard (CSR, protected)
├── admin/                        # Admin panel (CSR, protected, English-only — no [locale])
│   └── …                         # universities, programs, blog, consultations, etc.
└── api/
    └── v1/                       # REST API via route handlers
        ├── auth/{register,login,logout,refresh,google,forgot-password}/route.ts
        ├── users/me/route.ts
        ├── universities/route.ts
        ├── universities/[id]/route.ts
        ├── programs/route.ts
        ├── programs/[id]/route.ts
        ├── scholarships/…
        ├── events/…
        ├── notices/…
        ├── galleries/…
        ├── blog/…
        ├── countries/…
        ├── services/…
        ├── team/…
        ├── faq/…
        ├── testimonials/…
        ├── consultations/…
        ├── saved/{universities,programs}/[[…id]]/route.ts
        ├── partners/{apply,applications}/…
        ├── partner/{students,documents,guidance}/…
        ├── offices/…
        ├── legal/…
        ├── payment-methods/…
        ├── external-links/…
        ├── newsletter/…
        ├── contact/route.ts
        ├── upload/{image,document}/route.ts
        └── admin/{stats,users,activity}/route.ts

src/                              # Non-routable application code
├── server/                       # Server-only modules (never imported from client)
│   ├── db.ts                     # Prisma client singleton
│   ├── redis.ts                  # ioredis client singleton
│   ├── auth/
│   │   ├── jwt.ts                # Token sign/verify
│   │   ├── password.ts           # bcrypt hash/compare
│   │   ├── session.ts            # getCurrentUser(req), setAuthCookies()
│   │   └── google.ts             # OAuth helpers
│   ├── middleware/
│   │   ├── withAuth.ts           # HOF that wraps route handlers: requires valid JWT
│   │   ├── withRole.ts           # HOF: requires role ∈ allowed
│   │   ├── withRateLimit.ts      # Redis-backed rate limit
│   │   └── withValidation.ts     # Zod-based body/query validation
│   ├── services/                 # Domain logic (called from route handlers)
│   │   ├── user.service.ts
│   │   ├── university.service.ts
│   │   ├── program.service.ts
│   │   ├── consultation.service.ts
│   │   ├── partner.service.ts
│   │   ├── blog.service.ts
│   │   └── …
│   ├── email/
│   │   ├── mailer.ts             # Nodemailer transport
│   │   └── templates/            # HTML email templates
│   ├── storage/
│   │   ├── index.ts              # Storage adapter interface
│   │   ├── s3.adapter.ts         # AWS S3 adapter (prod)
│   │   └── local.adapter.ts      # Local disk adapter (dev)
│   └── validators/               # Zod schemas — one file per resource
├── components/
│   ├── ui/                       # Button, Card, Modal, Accordion, RangeSlider, …
│   ├── layout/                   # Header, Footer, LanguageSwitcher, StickyButtons, LiveChat
│   ├── university/               # UniversityCard, CountdownTimer, GeoFilter
│   ├── program/                  # ProgramCard, ProgramFilters, TypeaheadSearch
│   ├── scholarship/              # ScholarshipCard, ScholarshipFilters
│   ├── blog/                     # PostCard, PostList, BlogSidebar
│   ├── event/                    # EventCard, EventFilters
│   ├── gallery/                  # GalleryGrid, Lightbox, AlbumCard
│   ├── forms/                    # ConsultationForm, ContactForm, PartnerForm, NewsletterForm
│   └── dashboard/                # Dashboard-specific components
├── lib/                          # Client-safe utilities
│   ├── api-client.ts             # fetch wrapper with credentials: "include"
│   ├── i18n.ts                   # next-intl config
│   ├── hooks/                    # useAuth, useUniversities, useDebounce, …
│   └── utils.ts
├── messages/                     # i18n translation files
│   ├── en.json
│   └── ne.json
└── types/                        # Shared TS types (DTOs, enums)

prisma/
├── schema.prisma                 # Single source of truth for DB schema
├── migrations/
└── seed.ts                       # Seeds dev data + initial admin user

tests/
├── unit/                         # Service & util unit tests (Vitest)
└── integration/                  # Route-handler integration tests (Vitest + supertest-fetch)
```

**Key boundary:** anything under `src/server/` must never be imported from client components. The Next.js `server-only` package is used on entry points to enforce this at build time. Route handlers import from `src/server/*` only.

---

## 4. Request Flow

```
Client (page or dashboard component)
  │
  │  fetch("/api/v1/universities?country=CN", { credentials: "include" })
  ▼
Next.js route handler: app/api/v1/universities/route.ts
  │
  │  export const GET = withRateLimit(
  │                       withValidation(querySchema,
  │                         async (req, ctx) => universityService.list(ctx.query)));
  ▼
src/server/services/university.service.ts
  │
  │  prisma.university.findMany({ where, orderBy, skip, take })
  ▼
PostgreSQL
```

Server components (e.g. the universities listing page) skip the HTTP layer entirely and call the service directly for lower latency and built-in SSG/ISR:

```tsx
// app/[locale]/(public)/universities/page.tsx
import { universityService } from "@/server/services/university.service";

export const revalidate = 300; // ISR: revalidate every 5 minutes

export default async function UniversitiesPage({ searchParams }) {
  const data = await universityService.list(searchParams);
  return <UniversityGrid universities={data.items} />;
}
```

---

## 5. API Endpoints

```
/api/v1
│
├── /auth
│   ├── POST   /register              # Student registration
│   ├── POST   /login                  # Email + password login
│   ├── POST   /logout                 # Invalidate refresh token
│   ├── POST   /refresh                # Refresh access token
│   ├── POST   /google                 # Google OAuth callback
│   └── POST   /forgot-password        # Password reset flow
│
├── /users
│   ├── GET    /me                     # Get current user profile
│   ├── PATCH  /me                     # Update current user profile
│   └── GET    /:id                    # Get user by ID (admin only)
│
├── /universities
│   ├── GET    /                       # List (public, with search/filter/pagination)
│   ├── GET    /:id                    # Detail (public)
│   ├── POST   /                       # Create (admin)
│   ├── PATCH  /:id                    # Update (admin)
│   └── DELETE /:id                    # Delete (admin)
│
├── /programs
│   ├── GET    /                       # List (public, with filter/pagination)
│   ├── GET    /:id                    # Detail (public)
│   ├── POST   /                       # Create (admin)
│   ├── PATCH  /:id                    # Update (admin)
│   └── DELETE /:id                    # Delete (admin)
│
├── /countries
│   ├── GET    /                       # List all country guides (public)
│   ├── GET    /:slug                  # Get by slug (public)
│   ├── POST   /                       # Create (admin)
│   ├── PATCH  /:id                    # Update (admin)
│   └── DELETE /:id                    # Delete (admin)
│
├── /services
│   ├── GET    /                       # List (public)
│   ├── POST   /                       # Create (admin)
│   ├── PATCH  /:id                    # Update (admin)
│   └── DELETE /:id                    # Delete (admin)
│
├── /team
│   ├── GET    /                       # List (public)
│   ├── POST   /                       # Create (admin)
│   ├── PATCH  /:id                    # Update (admin)
│   └── DELETE /:id                    # Delete (admin)
│
├── /blog
│   ├── GET    /                       # List published posts (public)
│   ├── GET    /:slug                  # Get by slug (public)
│   ├── GET    /admin/all              # List all posts incl. drafts (admin)
│   ├── POST   /                       # Create (admin)
│   ├── PATCH  /:id                    # Update (admin)
│   └── DELETE /:id                    # Delete (admin)
│
├── /faq
│   ├── GET    /                       # List (public)
│   ├── POST   /                       # Create (admin)
│   ├── PATCH  /:id                    # Update (admin)
│   └── DELETE /:id                    # Delete (admin)
│
├── /testimonials
│   ├── GET    /                       # List (public)
│   ├── POST   /                       # Create (admin)
│   ├── PATCH  /:id                    # Update (admin)
│   └── DELETE /:id                    # Delete (admin)
│
├── /consultations
│   ├── POST   /                       # Submit (public/student)
│   ├── GET    /                       # List all (admin/counselor)
│   ├── GET    /mine                   # List own (student)
│   ├── PATCH  /:id                    # Update status/assign (admin/counselor)
│   └── GET    /:id                    # Detail (admin/counselor/owner)
│
├── /saved
│   ├── GET    /universities           # List saved universities (student)
│   ├── POST   /universities/:id       # Save university (student)
│   ├── DELETE /universities/:id       # Unsave (student)
│   ├── GET    /programs               # List saved programs (student)
│   ├── POST   /programs/:id           # Save program (student)
│   └── DELETE /programs/:id           # Unsave (student)
│
├── /partners
│   ├── POST   /apply                  # Submit partner application (public)
│   ├── GET    /applications           # List applications (admin)
│   ├── PATCH  /applications/:id       # Approve/reject (admin)
│   └── GET    /applications/:id       # Detail (admin)
│
├── /partner
│   ├── GET    /students               # List assigned students (partner)
│   ├── GET    /students/:id           # Student detail (partner)
│   ├── POST   /students/:id/guidance  # Add guidance note (partner)
│   ├── GET    /documents              # List documents to review (partner)
│   └── POST   /documents/:id/feedback # Submit feedback (partner)
│
├── /upload
│   ├── POST   /image                  # Upload image (admin — for content)
│   └── POST   /document               # Upload document (student — Phase 2)
│
├── /scholarships
│   ├── GET    /                       # List (public, with filter/pagination)
│   ├── GET    /:id                    # Detail (public)
│   ├── POST   /                       # Create (admin)
│   ├── PATCH  /:id                    # Update (admin)
│   └── DELETE /:id                    # Delete (admin)
│
├── /events
│   ├── GET    /                       # List (public, with filter/pagination)
│   ├── GET    /:slug                  # Detail (public)
│   ├── POST   /                       # Create (admin)
│   ├── PATCH  /:id                    # Update (admin)
│   └── DELETE /:id                    # Delete (admin)
│
├── /notices
│   ├── GET    /                       # List (public, with filter/pagination)
│   ├── GET    /:id                    # Detail (public)
│   ├── POST   /                       # Create (admin)
│   ├── PATCH  /:id                    # Update (admin)
│   └── DELETE /:id                    # Delete (admin)
│
├── /galleries
│   ├── GET    /albums                 # List albums (public)
│   ├── GET    /albums/:id             # Album detail with images (public)
│   ├── POST   /albums                 # Create album (admin)
│   ├── PATCH  /albums/:id             # Update album (admin)
│   ├── DELETE /albums/:id             # Delete album (admin)
│   ├── POST   /albums/:id/images     # Upload images to album (admin)
│   ├── PATCH  /images/:id            # Update image caption/order (admin)
│   └── DELETE /images/:id            # Delete image (admin)
│
├── /offices
│   ├── GET    /                       # List all offices (public)
│   ├── GET    /:id                    # Office detail (public)
│   ├── POST   /                       # Create (admin)
│   ├── PATCH  /:id                    # Update (admin)
│   └── DELETE /:id                    # Delete (admin)
│
├── /legal
│   ├── GET    /                       # List all legal pages (public)
│   ├── GET    /:slug                  # Get by slug (public)
│   ├── POST   /                       # Create (admin)
│   ├── PATCH  /:id                    # Update (admin)
│   └── DELETE /:id                    # Delete (admin)
│
├── /payment-methods
│   ├── GET    /                       # List active methods (public)
│   ├── POST   /                       # Create (admin)
│   ├── PATCH  /:id                    # Update (admin)
│   └── DELETE /:id                    # Delete (admin)
│
├── /external-links
│   ├── GET    /                       # List by category (public)
│   ├── POST   /                       # Create (admin)
│   ├── PATCH  /:id                    # Update (admin)
│   └── DELETE /:id                    # Delete (admin)
│
├── /newsletter
│   ├── POST   /subscribe              # Subscribe (public)
│   ├── POST   /unsubscribe            # Unsubscribe (public, via token)
│   ├── GET    /subscribers            # List subscribers (admin)
│   └── GET    /subscribers/export     # Export CSV (admin)
│
├── /contact
│   └── POST   /                       # Submit contact form (public)
│
└── /admin
    ├── GET    /stats                   # Dashboard metrics (admin)
    ├── GET    /users                   # List all users (admin)
    ├── PATCH  /users/:id              # Update user role/status (admin)
    └── GET    /activity               # Recent activity feed (admin)
```

---

## 6. Key Architecture Decisions

1. **Single Next.js service** — UI pages and the REST API live in the same Next.js app. Route handlers (`app/api/v1/**/route.ts`) replace Express. Public pages are server components that call services directly; dashboards and admin panel fetch the same services via `/api/v1/*`. One container to build, one process to run.

2. **SSR/SSG for public pages** — Universities, programs, country guides, and blog posts are statically generated at build time with ISR (Incremental Static Regeneration, revalidate on content change) for SEO performance. University countdown timers render client-side from the `application_deadline` field.

3. **CSR for dashboards** — Student, partner, and admin panels are fully client-side rendered behind authentication. No SEO needed for these pages.

4. **JWT auth with Redis** — Access tokens (15-minute expiry) + refresh tokens (7-day expiry) stored in httpOnly secure cookies. Redis stores a token blacklist for logout/revocation. Role claims embedded in JWT payload.

5. **Role-based middleware via higher-order functions** — Each route handler is wrapped with `withAuth` and `withRole(['admin'])` composable HOFs that verify the JWT cookie and enforce role claims before the handler runs. Replaces Express-style middleware chains.

5. **File uploads via S3** — Admin image uploads (university photos, team photos, blog images) and student document uploads go to S3. Presigned URLs for direct client upload where appropriate; metadata stored in DB.

6. **University deadline logic** — `application_deadline` is stored as a DateTime in the DB. The API includes a computed `application_open` boolean in responses. The frontend renders a real-time countdown timer using client-side JavaScript. The "Apply Now" button is only shown when `application_open` is true.

7. **Request validation** — All API inputs validated with Zod schemas before reaching controllers. Consistent error response format: `{ error: string, details?: object }`.

8. **Pagination** — All list endpoints support cursor-based or offset pagination: `?page=1&limit=20`. Response includes `{ data, total, page, totalPages }`.

9. **Search & filtering** — University and program list endpoints accept query parameters for filtering. PostgreSQL full-text search for university/program name search. Prisma `where` clauses for structured filters.

10. **Email notifications** — Nodemailer with SendGrid SMTP for transactional emails: consultation confirmation, welcome email, partner application status, password reset, newsletter. Email templates stored as HTML in the codebase.

11. **Multi-language (i18n)** — next-intl with `[locale]` route segment. English as default, Nepali as secondary. Translation JSON files per locale. Language switcher in header. Admin panel is English-only. All public content entities have translatable fields stored as JSON (`{ en: "...", ne: "..." }`).

12. **Live chat** — Tawk.to widget embedded via script tag in the Next.js layout. No backend integration needed — Tawk.to manages conversations independently. Admin configures the widget ID via environment variable.

13. **Typeahead search** — Debounced (300ms) client-side search input hitting `/api/v1/programs/search?q=` and `/api/v1/universities/search?q=` endpoints. PostgreSQL `ILIKE` or trigram index for fast partial matching. Returns top 10 suggestions.

14. **Newsletter** — Simple subscribe/unsubscribe flow. Subscription stores email in DB. Admin can export subscriber CSV. Future: integrate with SendGrid marketing campaigns.

---

## 7. Security Considerations

- Passwords hashed with bcrypt (12 rounds)
- JWT in httpOnly, secure, sameSite cookies (not localStorage)
- CORS restricted to frontend origin
- Rate limiting on auth endpoints (5 attempts/15 min) and form submissions
- Input sanitization on all user-submitted content (XSS prevention)
- SQL injection prevented by Prisma parameterized queries
- File upload validation (type, size limits)
- CSRF protection via sameSite cookies + custom header check

---

## 8. Deployment Architecture

```
┌─────────────────────────────────┐
│           Nginx                 │
│     (Reverse Proxy + SSL)       │
│                                 │
│  example.com       → Next.js :3000
│  example.com/api/* → Next.js :3000
└──────────────┬──────────────────┘
               │
      ┌────────▼────────┐
      │    Next.js      │
      │    Container    │
      │  (UI + API)     │
      └────────┬────────┘
               │
┌──────────────▼───────────────┐
│     Docker Network            │
│  ┌──────────┐ ┌──────────┐   │
│  │PostgreSQL│ │  Redis   │   │
│  │Container │ │Container │   │
│  └──────────┘ └──────────┘   │
└───────────────────────────────┘
```

- Docker Compose for local development (one app container + postgres + redis)
- Production: VPS or cloud (AWS EC2 / DigitalOcean) with Docker
- SSL via Let's Encrypt (Certbot)
- PostgreSQL backups: daily automated pg_dump

---

## 9. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Page load (public) | < 2s (LCP) via SSG/SSR |
| API response time | < 200ms (p95) |
| Uptime | 99.5% |
| Concurrent users | 500+ (MVP) |
| Database size | Up to 10K programs, 1K universities, 50K users |
| Mobile responsive | All pages fully responsive |
| Browser support | Chrome, Firefox, Safari, Edge (last 2 versions) |
| Accessibility | WCAG 2.1 AA compliance |
| SEO | Meta tags, OG tags, sitemap.xml, robots.txt, structured data |
| i18n | English (default) + Nepali, with language switcher |
| Image optimization | Next.js Image component, WebP format, lazy loading |
| Search performance | Typeahead results < 100ms via PostgreSQL trigram index |
