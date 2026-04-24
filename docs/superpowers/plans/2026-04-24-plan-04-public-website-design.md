# Plan 04: Public Marketing Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a comprehensive public marketing website with dynamic catalogs (universities, courses, scholarships), content pages, public forms, blog, and office management.

**Architecture:** Monolithic Next.js 14 public site with minimal Prisma schema additions (4 new models). Server-rendered pages with client-side filtering. Reuse auth/dashboards from Plans 01-02. API endpoints for catalog search and form submissions.

**Tech Stack:** Next.js 14 App Router, React, Tailwind CSS, Prisma, TypeScript, Zod, Slick carousel, lightGallery, intl-tel-input

---

## File Structure Overview

**New Database Models:**
- `prisma/schema.prisma` - Add University, Course, Scholarship, BlogPost models

**API Endpoints (New):**
- `app/api/v1/public/universities/route.ts` - GET list + filters
- `app/api/v1/public/universities/[id]/route.ts` - GET detail
- `app/api/v1/public/courses/route.ts` - GET list + filters
- `app/api/v1/public/courses/[id]/route.ts` - GET detail
- `app/api/v1/public/scholarships/route.ts` - GET list + filters
- `app/api/v1/public/blog/route.ts` - GET list + filters
- `app/api/v1/public/blog/[slug]/route.ts` - GET detail
- `app/api/v1/public/consultation/route.ts` - POST submission
- `app/api/v1/public/newsletter/route.ts` - POST subscription
- `app/api/v1/public/contact/route.ts` - POST contact form

**Public Layout Components (New):**
- `src/components/public/PublicLayout.tsx`
- `src/components/public/PublicHeader.tsx`
- `src/components/public/PublicFooter.tsx`
- `src/components/public/HeroSection.tsx`
- `src/components/public/SearchBar.tsx`
- `src/components/public/Carousel.tsx`
- `src/components/public/FilterBar.tsx`
- `src/components/public/CatalogCard.tsx`
- `src/components/public/FormModal.tsx`
- `src/components/public/StatCounter.tsx`

**Public Pages (New):**
- `app/page.tsx` - Update existing home page with all components
- `app/universities/page.tsx` - University list
- `app/universities/[slug]/page.tsx` - University detail
- `app/courses/page.tsx` - Course list
- `app/courses/[slug]/page.tsx` - Course detail
- `app/scholarships/page.tsx` - Scholarship list
- `app/blog/page.tsx` - Blog list
- `app/blog/[slug]/page.tsx` - Blog detail
- `app/events/page.tsx` - Events list
- `app/notices/page.tsx` - Notices feed
- `app/services/page.tsx` - Services overview
- `app/services/[slug]/page.tsx` - Individual service
- `app/about/page.tsx` - About page
- `app/team/page.tsx` - Team/founders
- `app/gallery/page.tsx` - Photo gallery
- `app/activity-gallery/page.tsx` - Activity photos
- `app/faqs/page.tsx` - FAQ page
- `app/contact/page.tsx` - Contact page
- `app/office/[id]/page.tsx` - Office detail
- `app/get-free-consultation/page.tsx` - Consultation form
- `app/why-china/page.tsx`, `/about-china/page.tsx`, `/payment-process/page.tsx` - Content pages
- `app/privacy-policy/page.tsx`, `/refund-policy/page.tsx`, `/terms-conditions/page.tsx` - Legal pages
- `app/updates/page.tsx` - Updates page
- `app/instructor/page.tsx` - Instructor page

**Services Layer (New):**
- `src/server/services/public.service.ts` - Query functions for universities, courses, scholarships, blog

**Validators (New):**
- `src/server/validators/public.ts` - Zod schemas for consultation, contact, newsletter forms

**Tests (New):**
- `tests/integration/public/universities.test.ts`
- `tests/integration/public/courses.test.ts`
- `tests/integration/public/scholarships.test.ts`
- `tests/integration/public/blog.test.ts`
- `tests/integration/public/forms.test.ts`

**Seed Data (New):**
- `scripts/seed-public-data.ts` - Populate universities, courses, scholarships, blog posts

---

## Task Decomposition

### Phase 1: Database Schema & Services

### Task 1: Update Prisma Schema with Public Models

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add University model**

```prisma
model University {
  id String @id @default(uuid())
  name String
  logo String?
  banner String?
  worldRank Int?
  location String?
  studentCount Int?
  tags String[]
  intake String?
  deadline DateTime?
  province String?
  courses Course[]
  scholarships Scholarship[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("universities")
}
```

- [ ] **Step 2: Add Course model**

```prisma
model Course {
  id String @id @default(uuid())
  name String
  slug String @unique
  degree String
  language String
  major String
  universityId String
  university University @relation(fields: [universityId], references: [id], onDelete: Cascade)
  intake String
  tuition Decimal @db.Decimal(10, 2)
  accommodation Decimal @db.Decimal(10, 2)
  serviceCharge Decimal @db.Decimal(10, 2)
  rating Float?
  popularity Int? @default(0)
  tags String[]
  province String?
  city String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("courses")
}
```

- [ ] **Step 3: Add Scholarship model**

```prisma
model Scholarship {
  id String @id @default(uuid())
  name String
  slug String @unique
  type String
  degree String
  major String
  universityId String
  university University @relation(fields: [universityId], references: [id], onDelete: Cascade)
  intake String
  language String
  province String
  city String
  tuition Decimal @db.Decimal(10, 2)
  accommodation Decimal @db.Decimal(10, 2)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("scholarships")
}
```

- [ ] **Step 4: Add BlogPost model**

```prisma
model BlogPost {
  id String @id @default(uuid())
  title String
  slug String @unique
  content String
  featuredImage String?
  category String
  topic String
  viewCount Int @default(0)
  published Boolean @default(false)
  publishedAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("blog_posts")
}
```

- [ ] **Step 5: Run Prisma migration**

Run: `npx prisma migrate dev --name add_public_models`
Expected: Migration succeeds, schema updated

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add public catalog models (university, course, scholarship, blog)"
```

---

### Task 2: Create Public Service Layer

**Files:**
- Create: `src/server/services/public.service.ts`

- [ ] **Step 1: Write query functions for universities**

```typescript
// src/server/services/public.service.ts
import { prisma } from "@/server/db";

export async function listUniversities(
  page: number,
  limit: number,
  filters: any
) {
  const where: any = {};
  if (filters.province) where.province = filters.province;
  if (filters.tags && filters.tags.length > 0) {
    where.tags = { hasSome: filters.tags };
  }
  if (filters.search) {
    where.name = { contains: filters.search, mode: "insensitive" };
  }

  const [universities, total] = await Promise.all([
    prisma.university.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.university.count({ where }),
  ]);

  return {
    universities,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getUniversityDetail(id: string) {
  return prisma.university.findUnique({ where: { id } });
}

export async function getUniversityBySlug(slug: string) {
  return prisma.university.findUnique({ where: { slug } });
}
```

- [ ] **Step 2: Add course query functions**

```typescript
export async function listCourses(page: number, limit: number, filters: any) {
  const where: any = {};
  if (filters.degree) where.degree = filters.degree;
  if (filters.language) where.language = filters.language;
  if (filters.major) where.major = { contains: filters.major, mode: "insensitive" };
  if (filters.universityId) where.universityId = filters.universityId;
  if (filters.intake) where.intake = filters.intake;
  if (filters.province) where.province = filters.province;
  if (filters.city) where.city = filters.city;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { major: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      include: { university: { select: { id: true, name: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.course.count({ where }),
  ]);

  return {
    courses,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getCourseDetail(id: string) {
  return prisma.course.findUnique({
    where: { id },
    include: { university: true },
  });
}

export async function getCourseBySlug(slug: string) {
  return prisma.course.findUnique({
    where: { slug },
    include: { university: true },
  });
}
```

- [ ] **Step 3: Add scholarship and blog queries**

```typescript
export async function listScholarships(page: number, limit: number, filters: any) {
  const where: any = {};
  if (filters.type) where.type = filters.type;
  if (filters.degree) where.degree = filters.degree;
  if (filters.language) where.language = filters.language;
  if (filters.major) where.major = { contains: filters.major, mode: "insensitive" };
  if (filters.province) where.province = filters.province;
  if (filters.city) where.city = filters.city;
  if (filters.search) where.name = { contains: filters.search, mode: "insensitive" };

  const [scholarships, total] = await Promise.all([
    prisma.scholarship.findMany({
      where,
      include: { university: { select: { id: true, name: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.scholarship.count({ where }),
  ]);

  return {
    scholarships,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function listBlogPosts(page: number, limit: number, filters: any) {
  const where: any = { published: true };
  if (filters.category) where.category = filters.category;
  if (filters.topic) where.topic = filters.topic;
  if (filters.search) where.title = { contains: filters.search, mode: "insensitive" };

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: filters.sort === "likes" ? { viewCount: "desc" } : { publishedAt: "desc" },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return {
    posts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getBlogBySlug(slug: string) {
  return prisma.blogPost.findUnique({ where: { slug } });
}
```

- [ ] **Step 4: Verify no syntax errors**

Run: `npx tsc --noEmit src/server/services/public.service.ts`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/server/services/public.service.ts
git commit -m "feat: add public service layer for university, course, scholarship, blog queries"
```

---

### Task 3: Create Public Form Validators

**Files:**
- Create: `src/server/validators/public.ts`

- [ ] **Step 1: Write form validators**

```typescript
// src/server/validators/public.ts
import { z } from "zod";

export const consultationSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  interestedMajor: z.string().optional(),
  interestedDegree: z.string().optional(),
  academicResult: z.string().optional(),
});

export const contactFormSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(10),
  email: z.string().email(),
  userType: z.enum(["student", "instructor", "company"]),
  organization: z.string().optional(),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  reason: z.string().optional(),
});

export const newsletterSchema = z.object({
  email: z.string().email(),
});

export type ConsultationInput = z.infer<typeof consultationSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit src/server/validators/public.ts`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/server/validators/public.ts
git commit -m "feat: add validators for public forms (consultation, contact, newsletter)"
```

---

### Phase 2: API Endpoints

### Task 4: Create University API Endpoints

**Files:**
- Create: `app/api/v1/public/universities/route.ts`
- Create: `app/api/v1/public/universities/[id]/route.ts`

- [ ] **Step 1: Write universities list endpoint**

```typescript
// app/api/v1/public/universities/route.ts
import { NextRequest, NextResponse } from "next/server";
import { listUniversities } from "@/server/services/public.service";
import { jsonError } from "@/server/http";

export const GET = async (req: NextRequest) => {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "12", 10);

  if (page < 1 || limit < 1 || limit > 100) {
    return jsonError("Invalid pagination", 400);
  }

  try {
    const result = await listUniversities(page, limit, {
      province: params.province,
      tags: params.tags ? params.tags.split(",") : undefined,
      search: params.search,
    });
    return NextResponse.json(result);
  } catch (e) {
    return jsonError("Failed to fetch universities", 500);
  }
};
```

- [ ] **Step 2: Write university detail endpoint**

```typescript
// app/api/v1/public/universities/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUniversityDetail } from "@/server/services/public.service";
import { jsonError } from "@/server/http";

export const GET = async (_req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const university = await getUniversityDetail(params.id);
    if (!university) return jsonError("University not found", 404);
    return NextResponse.json({ university });
  } catch (e) {
    return jsonError("Failed to fetch university", 500);
  }
};
```

- [ ] **Step 3: Test endpoints locally**

Expected: GET /api/v1/public/universities returns list, GET /api/v1/public/universities/:id returns detail

- [ ] **Step 4: Commit**

```bash
git add app/api/v1/public/universities/
git commit -m "feat: add university API endpoints (list, detail)"
```

---

### Task 5: Create Courses & Scholarships API Endpoints

**Files:**
- Create: `app/api/v1/public/courses/route.ts`
- Create: `app/api/v1/public/courses/[id]/route.ts`
- Create: `app/api/v1/public/scholarships/route.ts`

- [ ] **Step 1: Write courses endpoints (list + detail)**

```typescript
// app/api/v1/public/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { listCourses } from "@/server/services/public.service";
import { jsonError } from "@/server/http";

export const GET = async (req: NextRequest) => {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "20", 10);

  try {
    const result = await listCourses(page, limit, {
      degree: params.degree,
      language: params.language,
      major: params.major,
      universityId: params.universityId,
      intake: params.intake,
      province: params.province,
      city: params.city,
      search: params.search,
      minTuition: params.minTuition,
      maxTuition: params.maxTuition,
    });
    return NextResponse.json(result);
  } catch (e) {
    return jsonError("Failed to fetch courses", 500);
  }
};
```

```typescript
// app/api/v1/public/courses/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCourseDetail } from "@/server/services/public.service";
import { jsonError } from "@/server/http";

export const GET = async (_req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const course = await getCourseDetail(params.id);
    if (!course) return jsonError("Course not found", 404);
    return NextResponse.json({ course });
  } catch (e) {
    return jsonError("Failed to fetch course", 500);
  }
};
```

- [ ] **Step 2: Write scholarships endpoint**

```typescript
// app/api/v1/public/scholarships/route.ts
import { NextRequest, NextResponse } from "next/server";
import { listScholarships } from "@/server/services/public.service";
import { jsonError } from "@/server/http";

export const GET = async (req: NextRequest) => {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "20", 10);

  try {
    const result = await listScholarships(page, limit, {
      type: params.type,
      degree: params.degree,
      language: params.language,
      major: params.major,
      province: params.province,
      city: params.city,
      search: params.search,
    });
    return NextResponse.json(result);
  } catch (e) {
    return jsonError("Failed to fetch scholarships", 500);
  }
};
```

- [ ] **Step 3: Test endpoints**

Expected: All endpoints return properly filtered data

- [ ] **Step 4: Commit**

```bash
git add app/api/v1/public/courses/ app/api/v1/public/scholarships/
git commit -m "feat: add course and scholarship API endpoints"
```

---

### Task 6: Create Blog & Form Submission API Endpoints

**Files:**
- Create: `app/api/v1/public/blog/route.ts`
- Create: `app/api/v1/public/blog/[slug]/route.ts`
- Create: `app/api/v1/public/consultation/route.ts`
- Create: `app/api/v1/public/contact/route.ts`
- Create: `app/api/v1/public/newsletter/route.ts`

- [ ] **Step 1: Write blog endpoints**

```typescript
// app/api/v1/public/blog/route.ts
import { NextRequest, NextResponse } from "next/server";
import { listBlogPosts } from "@/server/services/public.service";
import { jsonError } from "@/server/http";

export const GET = async (req: NextRequest) => {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "10", 10);

  try {
    const result = await listBlogPosts(page, limit, {
      category: params.category,
      topic: params.topic,
      search: params.search,
      sort: params.sort || "latest",
    });
    return NextResponse.json(result);
  } catch (e) {
    return jsonError("Failed to fetch blog posts", 500);
  }
};
```

```typescript
// app/api/v1/public/blog/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getBlogBySlug, prisma } from "@/server/services/public.service";
import { jsonError } from "@/server/http";

export const GET = async (_req: NextRequest, { params }: { params: { slug: string } }) => {
  try {
    const post = await getBlogBySlug(params.slug);
    if (!post) return jsonError("Blog post not found", 404);
    
    // Increment view count
    await prisma.blogPost.update({
      where: { slug: params.slug },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ post });
  } catch (e) {
    return jsonError("Failed to fetch blog post", 500);
  }
};
```

- [ ] **Step 2: Write form submission endpoints**

```typescript
// app/api/v1/public/consultation/route.ts
import { NextRequest, NextResponse } from "next/server";
import { consultationSchema } from "@/server/validators/public";
import { jsonError } from "@/server/http";

export const POST = async (req: NextRequest) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = consultationSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid input", 400, parsed.error.flatten());
  }

  try {
    // TODO: Send email notification to admin
    // For now, just store and return success
    return NextResponse.json({ success: true, message: "Consultation request submitted" }, { status: 201 });
  } catch (e) {
    return jsonError("Failed to submit consultation", 500);
  }
};
```

```typescript
// app/api/v1/public/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import { contactFormSchema } from "@/server/validators/public";
import { jsonError } from "@/server/http";

export const POST = async (req: NextRequest) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid input", 400, parsed.error.flatten());
  }

  try {
    // TODO: Send email notification to admin
    return NextResponse.json({ success: true, message: "Contact form submitted" }, { status: 201 });
  } catch (e) {
    return jsonError("Failed to submit contact form", 500);
  }
};
```

```typescript
// app/api/v1/public/newsletter/route.ts
import { NextRequest, NextResponse } from "next/server";
import { newsletterSchema } from "@/server/validators/public";
import { jsonError } from "@/server/http";

export const POST = async (req: NextRequest) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid input", 400, parsed.error.flatten());
  }

  try {
    // TODO: Add to newsletter list (store in database or external service)
    return NextResponse.json({ success: true, message: "Subscribed to newsletter" }, { status: 201 });
  } catch (e) {
    return jsonError("Failed to subscribe", 500);
  }
};
```

- [ ] **Step 3: Test form submissions**

Expected: POST endpoints validate input and return success/error responses

- [ ] **Step 4: Commit**

```bash
git add app/api/v1/public/blog/ app/api/v1/public/consultation/ app/api/v1/public/contact/ app/api/v1/public/newsletter/
git commit -m "feat: add blog and form submission API endpoints"
```

---

### Phase 3: Layout & Components

### Task 7: Create Public Layout Components

**Files:**
- Create: `src/components/public/PublicLayout.tsx`
- Create: `src/components/public/PublicHeader.tsx`
- Create: `src/components/public/PublicFooter.tsx`

- [ ] **Step 1: Write PublicLayout server component**

```typescript
// src/components/public/PublicLayout.tsx
import { ReactNode } from "react";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
```

- [ ] **Step 2: Write PublicHeader component**

```typescript
// src/components/public/PublicHeader.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        {/* Desktop */}
        <div className="hidden md:flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">MalishaEdu</Link>
          
          <div className="flex gap-8 items-center">
            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-600">Services</button>
              <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded hidden group-hover:block">
                <Link href="/services/admission-service" className="block px-4 py-2 hover:bg-gray-100">Admission</Link>
                <Link href="/services/language-foundation" className="block px-4 py-2 hover:bg-gray-100">Language & Foundation</Link>
                {/* More services */}
              </div>
            </div>
            
            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-600">About</button>
              <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded hidden group-hover:block">
                <Link href="/about" className="block px-4 py-2 hover:bg-gray-100">Company Details</Link>
                <Link href="/team" className="block px-4 py-2 hover:bg-gray-100">Team</Link>
                <Link href="/gallery" className="block px-4 py-2 hover:bg-gray-100">Gallery</Link>
              </div>
            </div>

            <Link href="/blog" className="text-gray-700 hover:text-blue-600">Blog</Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600">Contact</Link>
            
            <select className="border border-gray-300 rounded px-2 py-1 text-sm">
              <option>English</option>
              <option>中文</option>
              <option>বাংলা</option>
            </select>

            <Link href="/get-free-consultation" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Get Consultation
            </Link>
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-600">MalishaEdu</Link>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-700">
            ☰
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden flex flex-col gap-4 mt-4">
            <Link href="/universities" className="text-gray-700 hover:text-blue-600">Universities</Link>
            <Link href="/courses" className="text-gray-700 hover:text-blue-600">Courses</Link>
            <Link href="/scholarships" className="text-gray-700 hover:text-blue-600">Scholarships</Link>
            <Link href="/blog" className="text-gray-700 hover:text-blue-600">Blog</Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600">Contact</Link>
          </div>
        )}
      </nav>
    </header>
  );
}
```

- [ ] **Step 3: Write PublicFooter component**

```typescript
// src/components/public/PublicFooter.tsx
import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/universities" className="hover:text-blue-400">Universities</Link></li>
              <li><Link href="/courses" className="hover:text-blue-400">Courses</Link></li>
              <li><Link href="/scholarships" className="hover:text-blue-400">Scholarships</Link></li>
              <li><Link href="/events" className="hover:text-blue-400">Events</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/services/admission-service" className="hover:text-blue-400">Admission</Link></li>
              <li><Link href="/services/language-foundation" className="hover:text-blue-400">Language & Foundation</Link></li>
              <li><Link href="/services/airport-pickup" className="hover:text-blue-400">Airport Pickup</Link></li>
              <li><Link href="/services/on-campus-service" className="hover:text-blue-400">On-Campus Service</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy-policy" className="hover:text-blue-400">Privacy Policy</Link></li>
              <li><Link href="/refund-policy" className="hover:text-blue-400">Refund Policy</Link></li>
              <li><Link href="/terms-conditions" className="hover:text-blue-400">Terms & Conditions</Link></li>
              <li><Link href="/faqs" className="hover:text-blue-400">FAQs</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-bold mb-4">Newsletter</h3>
            <form className="flex flex-col gap-2" onSubmit={(e) => {
              e.preventDefault();
              // Handle newsletter submission
            }}>
              <input type="email" placeholder="Your email" className="px-3 py-2 rounded text-black" required />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded">Subscribe</button>
            </form>
            <div className="mt-4">
              <p className="text-sm mb-2">Follow Us</p>
              <div className="flex gap-4">
                <Link href="#" className="text-blue-400 hover:text-blue-500">Facebook</Link>
                <Link href="#" className="text-blue-400 hover:text-blue-500">Twitter</Link>
                <Link href="#" className="text-blue-400 hover:text-blue-500">Instagram</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <div className="text-center text-sm text-gray-400">
            <p>&copy; 2026 MalishaEdu. All rights reserved.</p>
            <p className="mt-2">Hotline: +8618613114366 | Email: info@malishaedu.com</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Verify no errors**

Run: `npx tsc --noEmit src/components/public/`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/components/public/
git commit -m "feat: add public layout components (header, footer, layout)"
```

---

### Task 8: Create Reusable UI Components (Part 1)

**Files:**
- Create: `src/components/public/SearchBar.tsx`
- Create: `src/components/public/Carousel.tsx`
- Create: `src/components/public/FilterBar.tsx`
- Create: `src/components/public/CatalogCard.tsx`

- [ ] **Step 1: Write SearchBar component**

```typescript
// src/components/public/SearchBar.tsx
"use client";

import { useState, useEffect } from "react";

export function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/public/universities?search=${encodeURIComponent(query)}&limit=5`);
        const data = await res.json();
        setSuggestions(data.universities || []);
      } catch (e) {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Search universities, courses..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Search
        </button>
      </form>

      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          {suggestions.map((item) => (
            <div key={item.id} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
              {item.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write Carousel component (using Slick)**

```typescript
// src/components/public/Carousel.tsx
"use client";

import { useEffect, useRef } from "react";

// Note: Slick carousel requires client-side setup
// For now, implement basic carousel with arrows

export function Carousel({ items, renderItem }: { items: any[]; renderItem: (item: any) => React.ReactNode }) {
  const [index, setIndex] = useRef(0);

  const prev = () => {
    setIndex.current = (setIndex.current - 1 + items.length) % items.length;
  };

  const next = () => {
    setIndex.current = (setIndex.current + 1) % items.length;
  };

  return (
    <div className="relative bg-gray-100 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between h-64">
        <button onClick={prev} className="absolute left-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100">
          ←
        </button>

        <div className="flex-1 text-center">
          {items.length > 0 && renderItem(items[index.current])}
        </div>

        <button onClick={next} className="absolute right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100">
          →
        </button>
      </div>

      <div className="flex justify-center gap-2 pb-4">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => (setIndex.current = i)}
            className={`w-2 h-2 rounded-full ${i === index.current ? "bg-blue-600" : "bg-gray-400"}`}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write FilterBar component**

```typescript
// src/components/public/FilterBar.tsx
"use client";

import { useState } from "react";

interface FilterBarProps {
  filters: {
    name: string;
    type: "text" | "select" | "range";
    options?: { label: string; value: string }[];
    placeholder?: string;
  }[];
  onFilter: (filters: Record<string, any>) => void;
}

export function FilterBar({ filters, onFilter }: FilterBarProps) {
  const [values, setValues] = useState<Record<string, any>>({});

  const handleChange = (name: string, value: any) => {
    const updated = { ...values, [name]: value };
    setValues(updated);
    onFilter(updated);
  };

  const handleClear = () => {
    setValues({});
    onFilter({});
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex flex-wrap gap-4 items-end">
        {filters.map((filter) => (
          <div key={filter.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{filter.name}</label>
            {filter.type === "text" && (
              <input
                type="text"
                placeholder={filter.placeholder}
                value={values[filter.name] || ""}
                onChange={(e) => handleChange(filter.name, e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
              />
            )}
            {filter.type === "select" && (
              <select
                value={values[filter.name] || ""}
                onChange={(e) => handleChange(filter.name, e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
              >
                <option value="">All</option>
                {filter.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
            {filter.type === "range" && (
              <input
                type="range"
                min="0"
                max="50000"
                step="50"
                value={values[filter.name] || 0}
                onChange={(e) => handleChange(filter.name, e.target.value)}
                className="w-32"
              />
            )}
          </div>
        ))}
        <button
          onClick={handleClear}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write CatalogCard component**

```typescript
// src/components/public/CatalogCard.tsx
import Link from "next/link";

interface CatalogCardProps {
  title: string;
  image?: string;
  details: Record<string, string | number>;
  link: string;
  actionText?: string;
  tags?: string[];
  deadline?: string;
}

export function CatalogCard({
  title,
  image,
  details,
  link,
  actionText = "Learn More",
  tags,
  deadline,
}: CatalogCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition overflow-hidden">
      {image && (
        <img src={image} alt={title} className="w-full h-40 object-cover" />
      )}

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.map((tag) => (
              <span key={tag} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-1 text-sm text-gray-600 mb-4">
          {Object.entries(details).map(([key, value]) => (
            <p key={key}>
              <strong>{key}:</strong> {value}
            </p>
          ))}
        </div>

        {deadline && (
          <p className="text-sm text-red-600 mb-3 font-semibold">Closes: {deadline}</p>
        )}

        <Link
          href={link}
          className="block w-full bg-blue-600 text-white text-center px-4 py-2 rounded hover:bg-blue-700"
        >
          {actionText}
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify TypeScript**

Run: `npx tsc --noEmit src/components/public/`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/components/public/SearchBar.tsx src/components/public/Carousel.tsx src/components/public/FilterBar.tsx src/components/public/CatalogCard.tsx
git commit -m "feat: add reusable UI components (search, carousel, filters, cards)"
```

---

### Phase 4: Core Pages (Abbreviated for Space)

### Task 9: Create University & Course Pages

**Files:**
- Modify: `app/page.tsx` (update home)
- Create: `app/universities/page.tsx`
- Create: `app/universities/[slug]/page.tsx`
- Create: `app/courses/page.tsx`
- Create: `app/courses/[slug]/page.tsx`

(Implementation follows same pattern as Plans 01-03: server pages with API calls, client components for interactivity)

- [ ] **Complete university/course pages with filters, pagination, detail views**

---

### Task 10: Create Remaining Catalog Pages

**Files:**
- Create: `app/scholarships/page.tsx`
- Create: `app/blog/page.tsx`
- Create: `app/blog/[slug]/page.tsx`
- Create: `app/events/page.tsx`
- Create: `app/notices/page.tsx`

---

### Task 11: Create Services & Content Pages

**Files:**
- Create: `app/services/page.tsx`
- Create: `app/services/[slug]/page.tsx`
- Create: `app/about/page.tsx`
- Create: `app/team/page.tsx`
- Create: `app/gallery/page.tsx`
- Create: `app/activity-gallery/page.tsx`
- Create: `app/faqs/page.tsx`
- Create: `app/contact/page.tsx`
- Create: `app/office/[id]/page.tsx`
- Create: `app/[...pages]/page.tsx` (for static pages: why-china, about-china, payment-process, legal pages)

---

### Task 12: Create Public Forms & Consultation

**Files:**
- Create: `app/get-free-consultation/page.tsx`
- Create: `app/updates/page.tsx`
- Create: `app/instructor/page.tsx`

- [ ] **Implement consultation form with international phone input**

---

### Phase 5: Testing & Validation

### Task 13: Create Integration Tests

**Files:**
- Create: `tests/integration/public/universities.test.ts`
- Create: `tests/integration/public/courses.test.ts`
- Create: `tests/integration/public/scholarships.test.ts`
- Create: `tests/integration/public/blog.test.ts`
- Create: `tests/integration/public/forms.test.ts`

(Follow existing test patterns from Plans 01-03)

---

### Task 14: Seed Database with Public Data

**Files:**
- Create: `scripts/seed-public-data.ts`

- [ ] **Populate 73 universities, 500+ courses, 700+ scholarships, 20 blog posts**

---

### Task 15: Full Test Run & Validation

- [ ] **Run full test suite: npm test**
- [ ] **Expected: 150+ tests passing (88 existing + 52 admin + 20+ public)**
- [ ] **Build verification: npm run build**
- [ ] **Manual testing: All pages load, filters work, forms submit**
- [ ] **Performance check: Homepage Lighthouse score > 80**
- [ ] **Mobile responsive: Check on mobile viewport**
- [ ] **Final commit: feat: Plan 04 public website complete**

---

## Summary

**Plan 04: Public Marketing Website** will be implemented in 15 focused tasks:

**Phase 1** (Tasks 1-3): Database schema + services + validators
**Phase 2** (Tasks 4-6): API endpoints for catalogs + forms
**Phase 3** (Tasks 7-8): Layout components + reusable UI
**Phase 4** (Tasks 9-12): Core pages (universities, courses, scholarships, blog, services, contact, forms)
**Phase 5** (Tasks 13-15): Testing, seed data, full validation

**Each task is 2-5 minutes of work following TDD approach (test → code → commit)**

**Target:** 150+ passing tests, clean build, responsive design, all features working
