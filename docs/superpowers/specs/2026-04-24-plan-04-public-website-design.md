# Plan 04: Public Marketing Website — Design Spec

> **For agentic workers:** This spec covers the comprehensive public-facing website for the education consultancy platform. It includes dynamic catalogs (universities, courses, scholarships), static content pages, public forms, blog, events, and office management.

**Goal:** Build a professional public marketing website where students and partners can discover universities, courses, scholarships, and submit consultation requests.

**Architecture:** Monolithic Next.js 14 public site at `/` with server-rendered pages, client-side filtering for catalogs, and AJAX forms. Minimal database schema additions (4 new models). Reuse auth pages and dashboards from Plans 01-02.

**Tech Stack:** Next.js 14 App Router, React, Tailwind CSS, Prisma ORM (minimal schema), TypeScript, Zod validation, Slick carousel, lightGallery, Google Translate, Tawk.to

---

## Database Schema (Minimal)

### New Prisma Models

```prisma
model University {
  id String @id @default(uuid())
  name String
  logo String?                  // URL to logo image
  banner String?                // URL to banner image
  worldRank Int?
  location String?              // City/Country
  studentCount Int?
  tags String[]                 // ["211 Projects", "985 Projects", "C9 League", "Double First Class"]
  intake String?                // "Sept 2026" format
  deadline DateTime?
  province String?              // Chinese province
  courses Course[]
  scholarships Scholarship[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("universities")
}

model Course {
  id String @id @default(uuid())
  name String
  slug String @unique
  degree String                 // "Bachelor", "Master", "PhD", "Chinese Language", "Diploma", "Short", "Medical Foundation", "Foundation+Bachelor"
  language String               // "English", "Chinese", "Bilingual"
  major String                  // Subject/major (500+ options)
  universityId String
  university University @relation(fields: [universityId], references: [id], onDelete: Cascade)
  intake String                 // "Sept 2026"
  tuition Decimal @db.Decimal(10, 2)
  accommodation Decimal @db.Decimal(10, 2)
  serviceCharge Decimal @db.Decimal(10, 2)
  rating Float?                 // 1-5 stars
  popularity Int? @default(0)   // view count or ranking
  tags String[]                 // ["Our Top Picks", "Most Popular", "Fastest Admissions", "Highest Rating", "Top Ranked"]
  province String?              // For filtering
  city String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("courses")
}

model Scholarship {
  id String @id @default(uuid())
  name String                   // "CSC", "CGSO", etc. (700+ options)
  slug String @unique
  type String                   // "Type A" through "Type G"
  degree String                 // "Bachelor", "Master", "PhD", "Language", "Foundation"
  major String
  universityId String
  university University @relation(fields: [universityId], references: [id], onDelete: Cascade)
  intake String
  language String               // "English", "Chinese", "Bilingual"
  province String               // Chinese province
  city String
  tuition Decimal @db.Decimal(10, 2)
  accommodation Decimal @db.Decimal(10, 2)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("scholarships")
}

model BlogPost {
  id String @id @default(uuid())
  title String
  slug String @unique
  content String                // Markdown or HTML
  featuredImage String?
  category String               // "China", "Scholarship", "International Collaboration"
  topic String                  // "Study In China", etc.
  viewCount Int @default(0)
  published Boolean @default(false)
  publishedAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("blog_posts")
}
```

**No changes to existing models.** Reuse `Event` and `Notification` for events/notices feed.

---

## Route Structure

### Public Pages (Server-rendered)

**Marketing & Catalog Pages:**
- `/` → Home (hero, search, carousels, stats, services preview, testimonials)
- `/universities` → University list with filters
- `/universities/[slug]` → University detail
- `/courses` → Course list with extensive filters
- `/courses/[slug]` → Course detail
- `/scholarships` → Scholarship list with filters
- `/scholarships/[slug]` → Scholarship detail (if needed)
- `/blog` → Blog listing with category/topic/sort filters
- `/blog/[slug]` → Blog post detail
- `/events` → Event listing with filters + Show More pagination
- `/notices` → Notices feed (2 sections: MalishaEdu updates + Latest updates)

**Services & Content Pages:**
- `/services` → Services overview (9 cards)
- `/services/[slug]` → Individual service page (admission, language, airport-pickup, expo-china, expo-overseas, on-campus, job-business, csr, service-charges)
- `/about` → Company details
- `/team` → Founders & co-founders
- `/gallery` → Photo gallery (authorization letters)
- `/activity-gallery` → Activity photos gallery
- `/faqs` → FAQ page
- `/contact` → Contact form + map + office list
- `/office/[id]` → Office detail (address, map, photos)
- `/why-china` → Marketing content
- `/about-china` → Country info
- `/payment-process` → Payment guide + bank details
- `/privacy-policy`, `/refund-policy`, `/terms-conditions` → Legal pages
- `/get-free-consultation` → Consultation form (name, phone, email, major, degree, result)
- `/updates` → News/updates page
- `/instructor` → Partner/instructor intro page

### Auth & Dashboard (Reuse from Plans 01-02)

- `/sign-in` → Student login
- `/partner-sign-in` → Partner login
- `/register` → Student registration
- `/partner-register` → Partner registration (with admin approval flow)
- `/forgot-password` → Password reset
- `/user/dashboard` → Student & Partner dashboard (shared URL, role-based layout)

### API Endpoints (New)

**Public Catalog APIs:**
- `GET /api/v1/public/universities` — List with filters (province, tags, intake, search, pagination)
- `GET /api/v1/public/universities/:id` — Detail
- `GET /api/v1/public/courses` — List with filters (degree, language, major, university, intake, province, city, price range, sort)
- `GET /api/v1/public/courses/:id` — Detail
- `GET /api/v1/public/scholarships` — List with filters (name, type, degree, major, university, intake, language, province, city, price range)

**Blog & Content APIs:**
- `GET /api/v1/public/blog` — List with filters (category, topic, sort)
- `GET /api/v1/public/blog/:slug` — Detail

**Form Submission APIs:**
- `POST /api/v1/public/consultation` — Submit consultation form (validates with Zod, sends email notification)
- `POST /api/v1/public/newsletter` — Subscribe to newsletter
- `POST /api/v1/public/contact` — Submit contact form (validates, sends email)

---

## UI Components & Patterns

### Layout Components

**PublicLayout** (Server Component)
- Wraps all public pages
- Includes PublicHeader, PublicFooter
- Handles metadata, SEO tags

**PublicHeader** (Client Component)
- Logo + site name
- Multi-level navigation dropdowns:
  - Services (9 items)
  - About (5 items)
  - More (additional links)
- Language switcher (Google Translate or i18n dropdown: 11 languages)
- CTA buttons (Apply Now, Get Consultation)
- Mobile hamburger menu (responsive collapse)

**PublicFooter** (Server Component)
- 4 sections: Quick Links | Payment Methods | Social Media | Newsletter
- Quick links: CSCA, Government scholarships, University rankings, Chinese platforms
- Payment logos: WeChat, Visa, Mastercard, PayPal, UnionPay, Alipay
- Social icons: Facebook, Twitter, Instagram, LinkedIn, etc.
- Newsletter signup: Email input + Subscribe button
- WeChat QR code + WhatsApp QR code
- Copyright + Legal links (Privacy, Refund, Terms)

### Reusable Components

**HeroSection**
- Static background image (NOT carousel)
- Headline + CTA buttons
- Typeahead search bar (universities + courses) with intake selector
- Countdown timer for deadlines

**SearchBar** (Client Component)
- Typeahead autocomplete (AJAX live suggestions)
- Filters: University name, Course name, Major
- Intake selector dropdown
- Search icon button

**Carousel** (Client Component)
- Slick carousel library
- Variations:
  - University showcase (5-column, auto-rotating)
  - Course carousel (arrow navigation)
  - Blog carousel (latest 5 posts)
  - Partner logo carousel
  - Office photo slider (on office detail pages)
- Responsive: Adjust columns on mobile

**FilterBar** (Client Component)
- Reusable filter component with:
  - Text search input
  - Dropdown filters (province, degree, language, major, status, etc.)
  - Range sliders (tuition, accommodation, service charge: £0-£50,000 with £50 increments)
  - Multi-select checkboxes (tags)
  - Clear All button
  - Total count display ("Total Universities: 73", "Total Courses: 500+")

**CatalogCard** (Client Component)
- University card: Logo, banner, world rank, location, student count, tags, deadline countdown, Apply Now button
- Course card: Degree, language, major, university, intake, fees, rating, popularity, Save/Wishlist button
- Scholarship card: Name, type, degree, major, university, intake, language, fees
- Badge: Status indicator (published, featured, popular, etc.)
- Countdown timer: Days/Hours/Min to deadline

**StatusBadge** (Client Component)
- Color-coded badges for: pending, approved, rejected, published, featured, popular

**FormModal** (Client Component)
- Reusable modal for consultation, contact, newsletter forms
- AJAX submit (no page reload)
- SweetAlert confirmation on success
- Inline error messages
- Loading state on button

**DataTable** (Reuse from Plan 02)
- Sortable columns
- Pagination (Previous/Next + page numbers)
- Search/filter in table
- Export buttons (Excel, PDF, Print)
- Row actions (Edit, View, Delete)

**LightGallery** (Image Lightbox)
- Integration: lightGallery library
- Features: Zoom, thumbnail navigation, keyboard shortcuts
- Used on: /gallery, /activity-gallery, /authorization-letters, office photo sliders

### Interactive Elements

**Animated Stats Counters**
- 13 Years | 27K Students | 17 Branches | 250 Universities
- Scroll-triggered animation (counter increments from 0 to final value)
- Icon + text layout

**Countdown Timers**
- Displayed on university/course cards
- Format: "Closes in 12 days, 5 hours, 30 mins"
- Updates every second (client-side JavaScript)

**Floating Buttons** (Fixed position, right edge)
- Apply Now button (links to /courses)
- Get Consultation button (opens consultation form modal)
- Visible on scroll

**Live Chat**
- Tawk.to widget integration
- Auto-load on homepage

**Testimonial Sliders** (2 separate sliders)
- Student/Learner testimonials ("What Our Learners Are Saying")
- Partner testimonials ("What Our Partners Are Saying")
- Carousel format with arrows + dots

**City Quick Filters** (Homepage)
- Buttons: Zhengzhou | Yangzhou | Changzhou | Ningbo | Wuhan
- On-click filters to /universities or /courses

---

## Key Features (Detailed)

### 1. Homepage

**Components:**
- Hero banner with typeahead search + intake selector
- University showcase carousel (5-column, auto-rotating)
- City quick filter buttons
- Animated stats counters (13/27K/17/250)
- Services preview cards (9 icons linking to /services/*)
- Deadline countdown timers (from universities data)
- Course carousel (arrow navigation)
- Blog carousel (latest 5 posts)
- Partner logo carousel
- Featured expo banner (3rd Belt and Road Conference)
- Student testimonials slider
- Partner testimonials slider
- Newsletter subscription (in footer)
- Floating Apply Now + Get Consultation buttons

**Data Sources:**
- Universities: GET /api/v1/public/universities (limit 12, sorted by deadline)
- Courses: GET /api/v1/public/courses (limit 5, sorted by popularity)
- Blog: GET /api/v1/public/blog (limit 5, published, sorted by date)
- Events: Use existing Event model (latest featured expo)

### 2. University Catalog

**URL:** `/universities`

**Features:**
- Typeahead search (live AJAX suggestions)
- Filters:
  - Province (24 Chinese provinces as dropdown)
  - Tags (211 Projects, 985 Projects, C9 League, Double First Class — multi-select checkboxes)
  - Intake (multi-year selector, e.g., "Sept 2026", "March 2026")
  - Clear All button
- Display:
  - Total count ("Total Universities: 73")
  - University cards grid (logo, banner, world rank, location, student count, tags, deadline countdown, Apply Now button)
  - Pagination (numbered pages + Previous/Next arrows)
- Detail page: `/universities/[slug]` shows full profile + apply button

**Data Source:** GET /api/v1/public/universities

### 3. Course Catalog

**URL:** `/courses`

**Features:**
- Typeahead search (live AJAX for course names, majors, universities)
- Filters:
  - Degree (8 levels: Bachelor, Master, PhD, Chinese Language, Diploma, Short, Medical Foundation, Foundation+Bachelor)
  - Language (English, Chinese, Bilingual)
  - Major/Subject (500+ options — searchable dropdown)
  - University (100+ partners — searchable dropdown)
  - Intake (multi-year)
  - Province (24 provinces)
  - City (50+ cities)
- Price range sliders:
  - Tuition (£0-£50,000, £50 increments)
  - Accommodation (£0-£50,000, £50 increments)
  - Service charge (£0-£50,000, £50 increments)
- Sort tabs: "Our Top Picks" | "Most Popular" | "Fastest Admissions" | "Highest Rating" | "Top Ranked"
- Display:
  - Total count
  - Course cards (program name, degree, language, major, university, intake, fees, rating, popularity)
  - Save/Wishlist button (AJAX toggle)
  - Add to cart option
  - Pagination (pages + arrows)
- Cart removal confirmation (SweetAlert dialog)
- Detail page: `/courses/[slug]` shows full details + apply button

**Data Source:** GET /api/v1/public/courses

### 4. Scholarship Catalog

**URL:** `/scholarships`

**Features:**
- Filters: Name (700+ scholarships), Type (A-G), Degree, Major, University, Intake, Language, Province, City
- Price range sliders (same as courses)
- Sort tabs (same as courses)
- Display: Table format (sortable columns: Program Name, University, Degree, Language, Tuition, Accommodation)
- Pagination (table pagination)
- Apply button (links to application flow)

**Data Source:** GET /api/v1/public/scholarships

### 5. Blog Section

**URL:** `/blog`

**Features:**
- Filters:
  - Category (All, China, Scholarship, International Collaboration)
  - Topic (All, Study In China)
  - Sort by (Latest, Most Liked)
- AJAX dynamic filtering (no page reload)
- Display: Blog cards (featured image, category badge, title, date, view count, "Read More" link)
- Detail page: `/blog/[slug]` shows full article, related posts, share buttons
- View count increments on page view

**Data Source:** GET /api/v1/public/blog

### 6. Events & Notices

**Events** (`/events`)
- Filter by category (dropdown)
- Filter by status/release (upcoming, ongoing, past)
- Search by title
- Event cards (title, image, date, location, action button)
- Show More pagination (AJAX progressive loading, not traditional pagination)

**Notices** (`/notices`)
- 2 sections:
  1. **MalishaEdu Updates**: Service charges, ambassador programs, events, jobs
  2. **Latest Updates**: Scholarships, partnerships, exhibitions
- Circular date badges (day number + month abbreviation, e.g., "24 APR")
- List view with links to detail pages

**Data Sources:** Event and Notification models (reuse from Plans 01-03)

### 7. Services Pages

**URL:** `/services` + `/services/[slug]`

**8 Service Pages:**
1. Service Charges (fee breakdown)
2. Admission Service (dedicated content)
3. Chinese Language & Foundation Course (dedicated content)
4. Education Expo in China (dedicated content)
5. Education Expo Overseas (dedicated content)
6. Airport Pickup Service (dedicated content)
7. On-Campus Service (dedicated content)
8. Job & Business in China (dedicated content)
9. Corporate Social Responsibility (dedicated content)

**Homepage**: `/services` shows 9 service cards (icon, title, brief description, link to individual page)

**Detail Page**: `/services/[slug]` displays rich content (hardcoded HTML/Markdown)

### 8. About & Company Pages

**Company Details** (`/about`)
- Company overview, mission, vision
- Key statistics
- Hardcoded content

**Team/Founders** (`/team`)
- Founder photos, names, roles, bios
- Co-founder list
- Hardcoded content or seeded data

**Galleries:**
- `/gallery` → Authorization/accreditation certificates gallery
- `/activity-gallery` → Activity photos with justified layout + lightbox
- `/authorization-letters` → Separate accreditation gallery
- Integration: lightGallery for zoom + thumbnails

### 9. Contact & Office Pages

**Contact Page** (`/contact`)
- Contact form: Name*, Phone*, Email, User Type (Student/Instructor/Company), Organization, Preferred Date+Time, Reason
- AJAX form submission (no page reload)
- SweetAlert success confirmation
- Embedded Google Map with office markers
- Office list (12+ offices) with quick links

**Office Detail** (`/office/[id]`)
- Office name, address, phone, email
- Embedded Google Map (single office marker)
- Photo slider (Slick carousel, auto-play)
- Contact info

**Hardcoded Offices:** HQ Guangzhou + 11 regional (Bangladesh, Thailand, Sri Lanka, Somalia, Laos, Kenya, Angola, Ethiopia, etc.)

### 10. Public Forms

**Consultation Form** (`/get-free-consultation`)
- Fields: Name* (required), Phone* (required), Email, Interested Major, Interested Degree, Last Academic Result
- International phone input (intl-tel-input library with country auto-detect)
- AJAX form submission
- SweetAlert success toast (1500ms auto-dismiss)
- Validation: Zod schemas
- Email notification to admin

**Contact Form** (`/contact`)
- Fields: Name*, Phone*, Email, User Type, Organization, Preferred Date+Time, Reason
- AJAX submit, no page reload
- SweetAlert confirmation
- Email notification to admin

**Newsletter Subscription** (Footer)
- Email input + Subscribe button
- AJAX submission
- Toast notification

**Data Sources:**
- POST /api/v1/public/consultation
- POST /api/v1/public/contact
- POST /api/v1/public/newsletter

### 11. Legal & Static Pages

- `/privacy-policy` → Privacy Policy (hardcoded HTML)
- `/refund-policy` → Refund Policy (hardcoded HTML)
- `/terms-conditions` → Terms & Conditions (hardcoded HTML)
- `/payment-process` → Payment guide + bank details (hardcoded)
- `/why-china` → Marketing content (hardcoded)
- `/about-china` → Country info (hardcoded)
- `/faqs` → FAQ page with category grouping (hardcoded or seeded)
- `/updates` → News/updates page (hardcoded or uses Blog posts)
- `/instructor` → Partner/instructor intro page (hardcoded)

---

## Authentication & Authorization

**Public Access:**
- All pages except `/user/dashboard` are publicly accessible (no auth required)
- Sign-in/registration pages use existing auth from Plan 01

**Student Flow:**
- `/register` → Create account → Auto-login → `/user/dashboard`
- `/sign-in` → Login → Redirect to `/user/dashboard`
- Session: JWT httpOnly cookie (15min access token + 7-day refresh)

**Partner Flow:**
- `/partner-register` → Create account → Account starts INACTIVE → Cannot access dashboard until admin activates
- `/partner-sign-in` → Login → If inactive: show "Please contact administrator to activate" + blur dashboard
- Admin activation: Via Plan 03 admin panel (/admin/partners)

**Admin Access:**
- Admin login already implemented (Plan 01)
- Can manage catalogs, blog, events, galleries (via admin panel)

---

## Testing Strategy

**Unit Tests:**
- Utility functions (date formatting, price calculations, filtering logic)
- Validation schemas (Zod validators for forms)

**Integration Tests:**
- All public API endpoints (list, detail, search, filters)
- Form submission endpoints (consultation, contact, newsletter)
- Filter combinations (e.g., course filter with multiple criteria)

**E2E Tests (Manual/Playwright):**
- Homepage loads correctly
- Catalog pages load with filters working
- Search autocomplete functions
- Filters combine correctly (e.g., degree + language + price range)
- Forms submit without errors
- Pagination works correctly
- Mobile responsive layout works
- Floating buttons visible and clickable

**Performance Tests:**
- Homepage Lighthouse score (target: >80)
- Catalog page load time (with/without filters)
- Carousel performance

**Target:** 150+ total tests (88 existing + 52 admin + 20+ public tests)

---

## Data Requirements

### Seed Data

For launch, need to populate:
- **Universities**: 73 universities with name, logo, banner, world rank, location, student count, tags, provinces, intakes, deadlines
- **Courses**: 500+ courses with full details (degree, language, major, fees, ratings, popularity)
- **Scholarships**: 700+ scholarships with full details
- **Blog Posts**: 10-20 sample blog posts with different categories
- **Events**: 5-10 sample events
- **Services**: 9 hardcoded service pages
- **FAQs**: 20-30 sample FAQs grouped by category
- **Offices**: 12+ office records with addresses, phones, maps

Seed script: `scripts/seed-public-data.ts`

---

## What's NOT Included (Plan 04b/Future)

- Admin editing of public page content (hardcoded in code, not admin panel)
- Advanced analytics dashboard
- Marketing automation (email campaigns, user behavior tracking)
- Multi-language support (i18n) - only Google Translate widget for now
- Wishlist persistence (saved to user profile)
- Recommendation engine
- Chat support (only Tawk.to widget)

---

## Summary

**Plan 04: Public Marketing Website** is a comprehensive, polished public site with:
- Dynamic catalogs for universities, courses, scholarships (filtered, searchable)
- Static content pages (services, about, legal, FAQs)
- Public forms for consultation, contact, newsletter
- Blog section with categorization
- Events & notices feeds
- Office management with maps + galleries
- Professional header/footer with navigation + language switcher + floating CTAs
- Mobile-responsive design with hamburger menu
- Reuse of auth & dashboards from previous plans
- Minimal database additions (4 new models)
- Clean, modern custom design
