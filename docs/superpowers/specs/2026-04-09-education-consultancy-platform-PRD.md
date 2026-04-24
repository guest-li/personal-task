# Education Consultancy Platform — Product Requirements Document (PRD)

## 1. Product Overview

### 1.1 Background
Reverse-engineered from [shikshasewa.com](https://shikshasewa.com/) and [malishaedu.com](https://malishaedu.com/), both education consultancy platforms connecting students with international university opportunities. This spec defines a similar single-tenant platform combining the best features of both — including student accounts, partner system, CRM workflow, admin panel, scholarship catalog, events system, and multi-language support.

### 1.2 Vision
A full-featured education consultancy platform providing end-to-end support — from university discovery through visa approval — for students pursuing international higher education.

### 1.3 Target Users
- **Students** in Nepal seeking to study abroad (primarily China, UK, Italy, Australia, Denmark)
- **Consultancy staff** (counselors, admins) managing student pipelines
- **Partners** (external collaborators providing student guidance and document review)

### 1.4 Tech Stack
Single-service architecture: one Next.js app hosts both the UI and the REST API (route handlers). See HLD for full details.

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) — UI pages + API route handlers in one process |
| UI | React 18, Tailwind CSS, SWR |
| API | Next.js route handlers under `app/api/v1/**/route.ts` |
| ORM | Prisma |
| Database | PostgreSQL |
| Cache/Sessions | Redis |
| Auth | JWT + refresh tokens (httpOnly cookies), bcrypt, Google OAuth |
| Validation | Zod |
| File Storage | AWS S3 in prod, local disk in dev |
| Email | Nodemailer + SMTP (SendGrid) |
| Rich Text Editor | TipTap |
| i18n | next-intl (English + Nepali) |
| Live Chat | Tawk.to (embedded widget) |
| Testing | Vitest, Playwright |
| Deployment | Docker single-container, Nginx reverse proxy |

---

## 2. Phasing Strategy

### Phase 1 — MVP
- Public marketing site (home, about, services, team, country guides, contact)
- University & program catalog with advanced search/filter (typeahead autocomplete, hierarchical geo filter, intake-based filtering, tuition range sliders, sort by top picks/popular/fastest/rating/rank)
- University application deadline countdown + time-gated "Apply Now"
- Scholarship catalog with dedicated listing page and filters (type, degree level, university, classification)
- Student registration & login (email/password + Google OAuth) with gender, country, mobile (intl format)
- Partner registration (direct signup → inactive until admin activates)
- Forgot password flow (email-based reset for all 3 roles)
- 3 separate login pages: student (`/sign-in`), partner (`/partner-sign-in`), admin (`/login`)
- "Stay logged in for 30 days" option on login
- Free consultation booking form
- Blog/news section with categories and tags
- Notice board for announcements (service updates, job posts, program launches)
- Events system (listing page, detail pages with dates/location/registration)
- Authorization/accreditation gallery (official letters from partner universities, lightbox viewer)
- Activity/photo gallery (past events, campus visits, student arrivals, lightbox with justified layout)
- Newsletter subscription (email signup)
- Multi-language support (English + Nepali) via next-intl
- Legal/policy pages (Privacy Policy, Refund Policy, Terms & Conditions)
- Multiple office locations (dedicated page per office with map, contact info)
- External resource links section (government scholarship portals, ranking sites, immigration portals)
- Payment process page (documented payment methods, bank details, supported payment channels)
- Live chat widget (Tawk.to integration)
- Sticky floating action buttons ("Apply Now" + "Get Free Consultation" on viewport edge)
- Admin panel for full content management
- Basic student dashboard (profile, saved universities/programs, submitted inquiries)
- Email notifications (consultation confirmation, welcome email, newsletter)
- Partner application flow (visitor applies, admin approves/rejects)
- Partner dashboard (view assigned students, provide guidance, review documents)

### Phase 2 — CRM & Tracking
- Internal CRM for counselors (assign students, manage pipeline stages)
- Student application tracking (status updates visible to students)
- Document upload & management with partner/counselor feedback
- Counselor-student-partner messaging
- SMS notifications
- Online payment integration (WeChat Pay, PayPal, bank transfer)

### Phase 3 — Advanced Features
- Chatbot (AI-powered Q&A)
- Advanced analytics & reporting dashboard
- Scholarship matching engine
- Currency switcher for international fee display

---

## 3. User Roles & Permissions

### 3.1 Visitor (unauthenticated)
- Browse all public pages (including scholarships, events, galleries, notice board)
- Search/filter universities, programs, and scholarships
- Submit free consultation form
- Submit partner application
- Subscribe to newsletter
- View contact info and office locations
- Switch language (English/Nepali)

### 3.2 Student (authenticated)
- Everything Visitor can do, plus:
- Register at `/register` (name, mobile with intl country code, country, email, gender, password, confirm password, reCAPTCHA, T&C checkbox)
- Login at `/sign-in` (email + password, Google OAuth, "Stay logged in 30 days" checkbox, forgot password link)
- Personal dashboard with profile management
- Save/bookmark universities and programs
- Track submitted consultation requests
- **Phase 2:** Upload documents, view application status, message counselor/partner

### 3.3 Counselor (staff)
- Access admin panel (limited scope)
- View assigned students
- **Phase 2:** Update application stages, upload notes, communicate with students

### 3.4 Admin (super user)
- Full admin panel access
- CRUD all content: universities, programs, scholarships, country guides, services, team, blog, FAQ, testimonials, events, notices, galleries, office locations, legal pages, external links
- Manage all users (students, counselors, admins, partners)
- View and manage consultation submissions
- Manage newsletter subscribers
- Activate/deactivate partner accounts (partners register as inactive, admin activates)
- **Phase 2:** Assign students to counselors/partners, manage CRM pipeline
- **Phase 3:** View analytics, manage payments

### 3.5 Partner (external collaborator)
- **How they join:** Visitors register directly at `/partner-register` (name, email, gender, country, password); account starts **inactive** until admin activates
- Personal partner dashboard
- View students assigned to them by admin/counselor
- Provide personalized guidance to assigned students
- Assist students in identifying suitable universities and programs
- Review and provide feedback on application materials (essays, resumes, recommendation letters)
- Track their own activity (students helped, feedback given)
- **Cannot:** manage platform content, access CRM pipeline, or directly accept students
- Compensation managed offline (no in-platform payments for partners)

---

## 4. Data Model

### 4.1 Public Content

#### University
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | String | Required |
| continent | String | e.g., "Asia" |
| country | String | Required |
| state_province | String | e.g., "Jiangsu" |
| city | String | Required |
| logo | String | URL to image |
| campus_photo | String | URL to image |
| description | Text | Rich text |
| website | String | External URL |
| world_rank | String | Supports ranges like "301-400" |
| students_enrolled | Integer | e.g., 1300 |
| application_deadline | DateTime | Drives countdown timer |
| tags | String[] | e.g., ["Double First Class", "CSCA Required"] |
| display_order | Integer | For manual sorting |
| is_featured | Boolean | Show on homepage |
| created_at | DateTime | |
| updated_at | DateTime | |

Derived field: `application_open` = `now < application_deadline`

#### Program
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| university_id | UUID | FK -> University |
| name | String | Required |
| degree_level | Enum | bachelor, master, phd, mbbs, diploma, language, foundation |
| duration | String | e.g., "4 years", "4.5 years" |
| language | String | English, Chinese, Bilingual |
| tuition_fee | Decimal | Numeric amount |
| accommodation_fee | Decimal | Nullable |
| currency | String | USD, CNY, EUR |
| intake_month | String | e.g., "September", "March" |
| intake_year | Integer | e.g., 2026 |
| description | Text | |
| is_free | Boolean | Scholarship/free programs |
| popularity_score | Integer | For "Most Popular" sorting |
| rating | Decimal | For "Highest Rating" sorting |
| admission_speed | Enum | fast, normal, slow — for "Fastest Admissions" sort |
| created_at | DateTime | |
| updated_at | DateTime | |

#### Country Guide
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| country | String | Required, unique |
| slug | String | URL-friendly, unique |
| why_study | Text | Rich text section |
| student_life | Text | Rich text section |
| visa_requirements | Text | Rich text section |
| tuition_costs | Text | Rich text section |
| work_opportunities | Text | Rich text section |
| top_universities | Text | Rich text section |
| hero_image | String | URL |
| created_at | DateTime | |
| updated_at | DateTime | |

#### Service
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| title | String | |
| description | Text | |
| icon | String | Icon name or URL |
| display_order | Integer | |

#### Team Member
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | String | |
| role | String | Job title |
| photo | String | URL |
| bio | Text | Optional |
| social_links | JSON | { facebook, linkedin, etc. } |
| display_order | Integer | |

#### Blog Post
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| title | String | |
| slug | String | Unique |
| content | Text | Rich text (TipTap) |
| excerpt | Text | Short summary |
| author_id | UUID | FK -> User |
| featured_image | String | URL |
| category | String | |
| tags | String[] | |
| status | Enum | draft, published |
| published_at | DateTime | |
| created_at | DateTime | |
| updated_at | DateTime | |

#### FAQ
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| question | String | |
| answer | Text | |
| category | String | |
| display_order | Integer | |

#### Testimonial
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| student_name | String | |
| photo | String | URL |
| country_studied | String | |
| quote | Text | |
| display_order | Integer | |

#### Scholarship
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | String | Scholarship name |
| university_id | UUID | FK -> University, nullable (government scholarships are not university-specific) |
| type | Enum | government, university, provincial, belt_and_road, merit, need_based |
| classification | String | e.g., "Type A", "Type B" — for filtering |
| degree_levels | String[] | Applicable levels: bachelor, master, phd, etc. |
| coverage | Enum | full_tuition, partial_tuition, stipend, full_ride |
| description | Text | Rich text |
| eligibility | Text | Rich text |
| application_url | String | External link, nullable |
| deadline | DateTime | Nullable |
| is_active | Boolean | |
| created_at | DateTime | |
| updated_at | DateTime | |

#### Event
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| title | String | |
| slug | String | Unique |
| description | Text | Rich text |
| type | Enum | expo, conference, campus_interview, webinar, meetup |
| location_type | Enum | in_china, overseas, online |
| venue | String | Physical location or "Online" |
| start_date | DateTime | |
| end_date | DateTime | |
| featured_image | String | URL |
| registration_url | String | External link, nullable |
| is_featured | Boolean | |
| status | Enum | upcoming, ongoing, completed |
| created_at | DateTime | |
| updated_at | DateTime | |

#### Notice
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| title | String | |
| content | Text | Rich text |
| type | Enum | service_update, event_notification, job_post, program_announcement, general |
| is_pinned | Boolean | Show at top |
| published_at | DateTime | |
| created_at | DateTime | |
| updated_at | DateTime | |

#### Gallery Album
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| title | String | e.g., "Campus Visit 2026", "Belt and Road Conference" |
| type | Enum | authorization, activity |
| description | Text | |
| cover_image | String | URL |
| display_order | Integer | |
| created_at | DateTime | |

#### Gallery Image
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| album_id | UUID | FK -> Gallery Album |
| image_url | String | S3 URL |
| caption | String | |
| display_order | Integer | |
| created_at | DateTime | |

#### Office Location
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | String | e.g., "Head Office", "Dhaka Branch" |
| country | String | |
| city | String | |
| address | Text | Full street address |
| phone | String | |
| email | String | |
| map_lat | Decimal | For embedded map |
| map_lng | Decimal | |
| office_hours | String | e.g., "Sun-Fri, 9AM-5PM" |
| is_head_office | Boolean | |
| display_order | Integer | |
| created_at | DateTime | |

#### Newsletter Subscriber
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| email | String | Unique |
| is_active | Boolean | For unsubscribe |
| subscribed_at | DateTime | |
| unsubscribed_at | DateTime | Nullable |

#### External Resource Link
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| title | String | e.g., "Chinese Government Scholarship" |
| url | String | External URL |
| category | Enum | government, ranking, immigration, scholarship, other |
| icon | String | Icon name or URL |
| display_order | Integer | |

#### Legal Page
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| title | String | e.g., "Privacy Policy" |
| slug | String | Unique, e.g., "privacy-policy" |
| content | Text | Rich text (TipTap) |
| updated_at | DateTime | |

#### Payment Method Info
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| method_name | String | e.g., "Bank Transfer (CNY)", "WeChat Pay" |
| details | Text | Rich text — account numbers, instructions |
| icon | String | Payment method logo |
| display_order | Integer | |
| is_active | Boolean | |

### 4.2 Users & Auth

#### User
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| email | String | Unique |
| password_hash | String | Nullable (Google OAuth users) |
| name | String | |
| phone | String | With country code (intl format) |
| gender | Enum | male, female, other |
| country | String | From country dropdown (195+ countries) |
| continent | String | Auto-derived or selected |
| role | Enum | student, counselor, admin, partner |
| avatar | String | URL |
| google_id | String | Nullable, for OAuth |
| status | Enum | active, inactive, suspended |
| created_at | DateTime | |
| updated_at | DateTime | |

> **Note (from malishaedu reference):** `status` now includes `inactive` — used for newly registered partners awaiting admin activation. Students default to `active`; partners default to `inactive`.

#### Student Profile
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK -> User, unique |
| passport_nid | String | Passport or National ID number |
| qualification | Enum | high_school, bachelor, master |
| interested_major | String | |
| last_academic_result | String | |
| experience | String | Work/academic experience |
| language | String | Preferred language |
| preferred_countries | String[] | |
| address | String | Full address |
| bio | Text | "About" free-text description |

#### Certificate (Student)
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK -> User |
| name | String | Certificate name |
| file_url | String | Uploaded file URL (S3/local) |
| created_at | DateTime | |

> **Note (from malishaedu reference):** Students can upload multiple certificates (name + file pairs) via their Edit Profile page. The "+" button adds more rows.

#### Partner Profile
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK -> User, unique |
| qualifications | Text | |
| experience | Text | |
| specialization_areas | String[] | |
| level | Enum | beginner, intermediate, advanced, expert |
| bio | Text | |

> **Note (from malishaedu reference):** Partner registration is simplified — visitors register directly at `/partner-register` (name, email, gender, country, password). Account is created with `status: inactive`. Admin activates the account (no separate "Partner Application" entity needed). The partner level/tier system (Beginner → Expert) is managed by admin.

#### ~~Partner Application~~ (REMOVED)

> **Replaced by:** Direct partner registration + admin activation flow. Partners register via `/partner-register` → account created with `User.status = inactive` → admin activates via Users management page. This is simpler than the original "apply → review → create account" flow and matches the malishaedu reference implementation.

### 4.3 Interactions

#### Consultation Request
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| student_name | String | |
| email | String | |
| phone | String | |
| qualification | String | |
| interested_major | String | |
| last_academic_result | String | |
| status | Enum | new, contacted, closed |
| assigned_counselor_id | UUID | FK -> User, nullable |
| notes | Text | Internal notes |
| user_id | UUID | FK -> User, nullable (if logged in) |
| created_at | DateTime | |
| updated_at | DateTime | |

#### Saved University
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK -> User |
| university_id | UUID | FK -> University |
| created_at | DateTime | |

Unique constraint: (user_id, university_id)

#### Saved Program
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK -> User |
| program_id | UUID | FK -> Program |
| created_at | DateTime | |

Unique constraint: (user_id, program_id)

### 4.4 Phase 2 Entities

#### Application
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| application_code | String | Unique, auto-generated (e.g. "APP-2026-0001") |
| student_id | UUID | FK -> User |
| university_id | UUID | FK -> University |
| program_id | UUID | FK -> Program |
| fund_type | String | Scholarship/self-funded/etc. (filter in dashboard) |
| status | Enum | draft, submitted, under_review, accepted, rejected, visa_processing, visa_approved, enrolled |
| application_fee | Decimal | Fee amount for this application |
| application_fee_paid | Boolean | Default false |
| service_charge | Decimal | Service charge amount |
| service_charge_paid | Boolean | Default false |
| assigned_counselor_id | UUID | FK -> User, nullable |
| assigned_partner_id | UUID | FK -> User, nullable |
| notes | Text | |
| created_at | DateTime | |
| updated_at | DateTime | |

> **Note (from malishaedu reference):** Student dashboard shows 4 financial stat cards (Applications count, Total Applications Fees Paid, Total Service Charge, Total Service Charge Paid) — these aggregate from the fee fields above.

#### Document
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| application_id | UUID | FK -> Application |
| uploaded_by | UUID | FK -> User |
| type | Enum | essay, resume, recommendation, transcript, passport, visa, other |
| file_url | String | S3 URL |
| file_name | String | Original filename |
| status | Enum | uploaded, under_review, feedback_given, approved |
| feedback | Text | From partner/counselor |
| feedback_by | UUID | FK -> User, nullable |
| created_at | DateTime | |
| updated_at | DateTime | |

#### Message
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| sender_id | UUID | FK -> User |
| receiver_id | UUID | FK -> User |
| application_id | UUID | FK -> Application, nullable |
| content | Text | |
| is_read | Boolean | Default false |
| created_at | DateTime | |

---

## 5. Page Structure & Features

### 5.1 Public Pages

#### Home Page
- Hero image carousel with CTA buttons ("Book Free Consultation", "Apply Now"); "Apply Now" navigates to the Programs page with filters open
- Plain keyword course search bar (no typeahead/autocomplete) with intake period selector; submits to Programs page
- Stats counter section (+5 years experience, +1000 students, +230 university cooperations)
- Featured universities grid with countdown timer cards
- City-based university quick filters (popular cities)
- Services overview (6 cards with icons)
- Upcoming events preview (next 3 events)
- Latest blog posts (3 most recent)
- Testimonials slider (Swiper.js with autoplay)
- "Why Choose Us" section
- Newsletter subscription form
- CTA banner for free consultation
- **Sticky floating buttons**: "Apply Now" + "Get Free Consultation" fixed on right viewport edge (collapsible); "Apply Now" navigates to the Programs page with filters open
- **Live chat widget**: Tawk.to embedded in bottom-right corner

#### Universities Page
- Grid of university cards showing:
  - Campus photo + logo
  - Application deadline countdown (days, hours, minutes)
  - "Apply Now" button (visible only when deadline hasn't passed); navigates to the Programs page pre-filtered to this university
  - World rank
  - Location (city, country)
  - Students enrolled count
  - Tags/badges
- Search by university name (typeahead autocomplete)
- **Hierarchical geo filter**: continent > country > state/province > city (cascading dropdowns)
- Filter by: rank range, deadline status (open/closed), tags
- Sort by: rank, name, deadline

#### Programs Page
- List/grid of program cards
- **Typeahead autocomplete** search by program name
- Filter by: university, degree level, language, intake period (month + year), is_free
- **Range sliders** for: tuition fees, accommodation fees
- **Sort by**: Our Top Picks, Most Popular, Fastest Admissions, Highest Rating, Top Ranked, tuition (low-high)
- Pagination with result count
- "Clear all filters" button

#### Program Detail Page
- Full program info (description, tuition, duration, intake, language)
- Parent university card with link
- "Apply Now" button (gated by university deadline); submits application to this specific program
- "Save" button (authenticated students)
- Related programs from same university

#### About Us Page
- Mission and vision statements
- Core values (integrity, student-centric, excellence, collaboration)
- Company story/background
- Stats section

#### Services Page
- 6 service cards with icons and descriptions:
  1. Student Screening
  2. University Application Assistance
  3. Documentation Guidance
  4. Interview Assistance
  5. Scholarship Assistance
  6. Visa Lodgement
- CTA to book free consultation

#### Team Page
- Grid of team member cards (photo, name, role)
- Optional bio on hover/click

#### Country Guide Pages (China, UK, Italy, Australia, Denmark)
- Why study in [country]
- Student life
- Visa requirements
- Tuition costs (by degree level)
- Work opportunities (during and post-study)
- Top universities in the country

#### Blog Page
- Post listing with featured image, title, excerpt, date, category
- Category and tag filtering
- Individual post page with full content, author, date, related posts
- Sidebar: recent posts, categories, tags

#### Contact Page
- Contact form (name, email, subject, message)
- Embedded Google Map
- Address: Kalikastan Marg, DilliBazar, Kathmandu, Nepal
- Phone, email, social links
- Office hours: Sunday - Friday, 9:00 AM - 5:00 PM

#### Free Consultation Page
- Form fields: full name, email, contact number, qualification (dropdown), interested major, last academic result
- Submit button
- Confirmation message/email on submission

#### Become a Partner Page (`/partner-register`)
- Registration form: name, email, gender (dropdown), country (dropdown), password, confirm password
- reCAPTCHA verification
- Terms & Conditions checkbox
- Submit → account created as **inactive** → "Your account is inactive" message
- Link to partner sign-in for existing partners

#### FAQ Page
- Questions grouped by category
- Expandable accordion UI

#### Scholarships Page
- Dedicated scholarship catalog listing
- Filter by: scholarship type (government/university/provincial/merit/need-based), degree level, university, classification (A-G), coverage (full/partial)
- Scholarship cards showing: name, university (if applicable), type, coverage, deadline, "Apply" button
- Detail view with full eligibility criteria and application instructions

#### Events Page
- Event listing with cards showing: title, date, location, type badge, featured image
- Filter by: type (expo/conference/interview/webinar), location type (in China/overseas/online), status (upcoming/ongoing/completed)
- "Show More" pagination
- Event detail page with: full description, date/time, venue, registration link/button, embedded map for physical events

#### Notice Board Page
- Chronological list of announcements
- Cards with: circular date badge (day + month), title, type tag
- Filter by type (service update, event, job post, program announcement)

#### Authorization & Accreditation Page
- Image gallery of official authorization letters from partner universities
- Justified/masonry layout with lightbox zoom
- University name caption per image

#### Activity Gallery Page
- Photo gallery of past events, campus visits, MOU signings, student arrivals
- Albums grouped by event/activity
- Justified layout with lightGallery lightbox (zoom + thumbnail navigation)
- Album detail view with all photos

#### Office Locations Page
- List/grid of all office locations
- Each office card: name, city, country, address, phone, email
- Individual office page: full details + embedded Google Map
- Head office highlighted

#### Payment Process Page
- Documented payment methods with instructions
- Bank transfer details (account numbers, bank names, SWIFT codes)
- Digital payment options (with logos)
- Step-by-step payment guide

#### Legal Pages (Privacy Policy, Refund Policy, Terms & Conditions)
- Rich text content pages
- Admin-editable via CMS
- Accessible from footer links

#### External Resources Section (Footer)
- Quick links to government scholarship portals (CSC, CSCSE)
- University ranking sites (QS, Shanghai, Leiden)
- Immigration portals
- Admin-manageable link list

### 5.2 Student Dashboard (`/user/dashboard`)

**Top Bar:** Sidebar toggle (hamburger) | Global search | Notification bell with count badge | User avatar + name

**Sidebar Navigation:** Dashboard | My Application | My Events | Edit Profile | Notification

| Page | Features |
|---|---|
| Dashboard (Overview) | 4 stat cards (Applications, Total Applications Fees Paid, Total Service Charge, Total Service Charge Paid) + Applications History line chart (Applications vs Approved over ~30 days) + Summary chart (Applications / Service Charge / Application fee) |
| My Application | Data table (SL, Application Code, Program Name, University, Status, Action — all sortable). Filters: Fund Type + Status dropdowns. Export: Excel / PDF / Print buttons. Search box. Pagination. |
| My Events | Data table (SL, Event Name, Start Date, End Date, Price, Order Date, Payment Status, Action — all sortable). Export: Excel / PDF / Print. Search. Pagination. Note: events can be paid (Price + Payment Status columns). |
| Edit Profile | 3 sections: (1) Personal Info — profile photo drag-drop upload + 11 fields (Name, Email, Mobile, Gender, Passport/NID, Qualification, Experience, Language, Continent, Country, Address, About textarea). (2) Certificates — Certificate Name + Certificate File upload + "+" button to add multiple. (3) Change Password — Current/New/Confirm with eye toggle + Update button. |
| Notification | Notification inbox page |
| Saved Universities | List with countdown status, remove option |
| Saved Programs | List with key info, remove option |
| My Consultations | Submitted requests with status (new/contacted/closed) |
| **Phase 2:** Documents | Upload/manage, view feedback |
| **Phase 2:** Messages | Chat with counselor/partner |

### 5.3 Partner Dashboard (`/user/dashboard` — role-detected)

**Top Bar:** Same as student (hamburger, search, notification bell, avatar + name)

**Sidebar Navigation:** Dashboard | My Application | Apply For New | Notification

> **Note:** Partners share `/user/dashboard` URL with students — system detects role and shows different sidebar and content. Partners do NOT have My Events or Edit Profile in sidebar.

| Page | Features |
|---|---|
| Dashboard (Overview) | 5 stat cards (Applications, Total Applications Fees Paid, Total Service Charge, Total Service Charge Paid, **Your Level: Beginner**) + Applications History line chart + Summary chart |
| My Application | Enhanced version of student table with same columns + **Manage Fields** button (customize visible columns) + **Manage Filters** button + 2 extra filter dropdowns. Export: Excel / PDF / Print. |
| Apply For New | Links to `/list/all-universities` — allows partner to submit new applications (not in student sidebar) |
| Notification | Notification inbox page |
| **Inactive Gate** | Full-screen overlay: "Your account is inactive — Please contact the administrator to activate your account." All dashboard content blurred behind it until admin activates. |
| Assigned Students | List with student profiles and application details |
| Document Review | View uploaded docs, provide written feedback on essays/resumes/recommendations |
| Guidance Notes | Recommend universities & programs for specific students |
| **Phase 2:** Messages | Communicate with assigned students |

### 5.4 Admin Panel (`/admin`)

| Page | Features |
|---|---|
| Dashboard | Key metrics (total students, consultations, partner applications, subscribers), recent activity feed |
| Universities | CRUD with all fields including deadline, tags, ranking, campus photo, logo, geo hierarchy |
| Programs | CRUD linked to universities, with popularity/rating/admission speed fields |
| Scholarships | CRUD scholarships with type, classification, coverage, eligibility |
| Country Guides | CRUD with rich text editor (TipTap) for each section |
| Services | CRUD with icon selection and display ordering |
| Team | CRUD team members with photo upload |
| Blog | CRUD with rich text editor, categories, tags, draft/publish toggle |
| Events | CRUD events with type, dates, venue, registration URL, status management |
| Notices | CRUD announcements with type tagging and pin/unpin |
| FAQ | CRUD with category grouping and ordering |
| Testimonials | CRUD student testimonials |
| Galleries | CRUD albums (authorization + activity types), upload/reorder images, captions |
| Office Locations | CRUD offices with address, contact info, map coordinates |
| Legal Pages | CRUD rich text legal/policy pages |
| Payment Methods | CRUD payment method info (bank details, digital payment instructions) |
| External Links | CRUD external resource links with categories |
| Newsletter | View subscribers, export list, manage active/inactive status |
| Users | List all users, change roles, suspend/activate accounts |
| Consultations | View submissions, update status, assign counselor, add internal notes |
| Partner Accounts | Activate/deactivate partners (registered as inactive), manage partner levels (Beginner/Intermediate/Advanced/Expert) |
| **Phase 2:** CRM Pipeline | Kanban board for application stages, drag-drop status changes, assign counselors/partners |
| **Phase 2:** Payments | Payment history, fee structure management |
| **Phase 3:** Analytics | Charts for traffic, conversions, applications by country/program |
