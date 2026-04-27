# Phase 5 & 7 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement essential public pages (Phase 5) and consultation booking system (Phase 7) to create a feature-complete education platform.

**Architecture:** 
- Phase 5: Static content pages with no database dependencies, using existing PublicLayout pattern
- Phase 7: Real-time booking system with Stripe payments and video integration, new database tables for consultations

**Tech Stack:** Next.js 14, Prisma ORM, PostgreSQL, Stripe API, Jitsi (open-source video), React Hook Form, Zod validation, Tailwind CSS

---

## PHASE 5: Essential Pages (1-2 weeks)

### Task 1: Update Home Page (Landing Page)

**Files:**
- Modify: `app/page.tsx`
- Create: `src/components/public/HeroSection.tsx`
- Create: `src/components/public/FeatureHighlights.tsx`
- Create: `src/components/public/StatsSection.tsx`
- Create: `src/components/public/TestimonialsSection.tsx`
- Create: `src/components/public/CTAButtons.tsx`

- [ ] **Step 1: Create HeroSection component**

```tsx
// src/components/public/HeroSection.tsx
export function HeroSection() {
  return (
    <div className="bg-gradient-to-r from-brand-700 to-brand-800 text-white py-20 md:py-32">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Your Gateway to Education in China
        </h1>
        <p className="text-xl text-brand-100 mb-8 max-w-2xl">
          Discover world-class universities, find perfect programs, and secure scholarships. 
          Expert guidance every step of the way.
        </p>
        <div className="flex gap-4">
          <Link href="/universities" className="bg-white text-brand-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
            Explore Universities
          </Link>
          <Link href="/get-free-consultation" className="bg-brand-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-700 transition">
            Get Free Consultation
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create FeatureHighlights component**

```tsx
// src/components/public/FeatureHighlights.tsx
export function FeatureHighlights() {
  const features = [
    {
      icon: "🏛️",
      title: "71+ Universities",
      description: "Top-ranked institutions across China"
    },
    {
      icon: "📚",
      title: "500+ Programs",
      description: "Diverse degrees and specializations"
    },
    {
      icon: "🎓",
      title: "700+ Scholarships",
      description: "Funding opportunities worth millions"
    },
    {
      icon: "💼",
      title: "Expert Consultants",
      description: "Personalized guidance from professionals"
    },
    {
      icon: "📖",
      title: "Complete Resources",
      description: "Guides, templates, and expert articles"
    },
    {
      icon: "🌍",
      title: "Global Community",
      description: "Connect with students from worldwide"
    }
  ];

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Why Choose MalishaEdu?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create StatsSection component**

```tsx
// src/components/public/StatsSection.tsx
export function StatsSection() {
  const stats = [
    { number: "71+", label: "Universities" },
    { number: "500+", label: "Programs" },
    { number: "713+", label: "Scholarships" },
    { number: "10K+", label: "Students Helped" }
  ];

  return (
    <div className="bg-brand-50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-brand-700 mb-2">
                {stat.number}
              </div>
              <p className="text-gray-600 font-semibold">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create TestimonialsSection component**

```tsx
// src/components/public/TestimonialsSection.tsx
export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Ahmed Hassan",
      quote: "MalishaEdu helped me get admitted to Tsinghua with a full scholarship!",
      role: "Student, Egypt"
    },
    {
      name: "Maria Garcia",
      quote: "The consultation service was incredibly helpful for my visa process.",
      role: "Student, Spain"
    },
    {
      name: "Raj Patel",
      quote: "Found the perfect program that matches my career goals perfectly.",
      role: "Student, India"
    }
  ];

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Student Success Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <span key={j} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
              <p className="font-bold text-gray-900">{testimonial.name}</p>
              <p className="text-sm text-gray-600">{testimonial.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Update app/page.tsx**

```tsx
import { PublicLayout } from "@/components/public/PublicLayout";
import { HeroSection } from "@/components/public/HeroSection";
import { FeatureHighlights } from "@/components/public/FeatureHighlights";
import { StatsSection } from "@/components/public/StatsSection";
import { TestimonialsSection } from "@/components/public/TestimonialsSection";
import { NewsletterSignup } from "@/components/public/NewsletterSignup";

export default function HomePage() {
  return (
    <PublicLayout>
      <HeroSection />
      <FeatureHighlights />
      <StatsSection />
      <TestimonialsSection />
      <NewsletterSignup />
    </PublicLayout>
  );
}
```

- [ ] **Step 6: Commit changes**

```bash
git add app/page.tsx src/components/public/HeroSection.tsx \
  src/components/public/FeatureHighlights.tsx \
  src/components/public/StatsSection.tsx \
  src/components/public/TestimonialsSection.tsx
git commit -m "feat: redesign home page with hero, features, stats, and testimonials"
```

---

### Task 2: Create About Page

**Files:**
- Create: `app/about/page.tsx`

- [ ] **Step 1: Create about page**

```tsx
// app/about/page.tsx
import { PublicLayout } from "@/components/public/PublicLayout";
import Link from "next/link";

export const metadata = {
  title: "About MalishaEdu",
  description: "Learn about our mission to democratize education in China"
};

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <div className="bg-gradient-to-r from-brand-700 to-brand-800 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About MalishaEdu</h1>
          <p className="text-xl text-brand-100">Our mission to democratize education in China</p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To democratize access to quality education in China by connecting international 
              students with world-class universities, providing expert guidance, and ensuring 
              every qualified student can pursue their dreams.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              A world where geographic and economic barriers don't limit educational opportunities. 
              We envision a global community of educated leaders making positive impact across continents.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">🎯 Excellence</h3>
              <p className="text-gray-600">We pursue the highest standards in everything we do.</p>
            </div>
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">💙 Integrity</h3>
              <p className="text-gray-600">We operate with honesty and transparency always.</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">🤝 Impact</h3>
              <p className="text-gray-600">We measure success by the lives we positively impact.</p>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Team</h2>
          <p className="text-gray-700 text-center mb-8 max-w-2xl mx-auto">
            Our team consists of experienced education consultants, university representatives, 
            and professionals who have personally studied in China.
          </p>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Journey</h2>
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-brand-700 rounded-full"></div>
                <div className="w-0.5 h-12 bg-brand-200"></div>
              </div>
              <div>
                <h3 className="font-bold text-lg">2020 - Founded</h3>
                <p className="text-gray-600">Started with a vision to help students access Chinese universities</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-brand-700 rounded-full"></div>
                <div className="w-0.5 h-12 bg-brand-200"></div>
              </div>
              <div>
                <h3 className="font-bold text-lg">2021 - 100+ Students</h3>
                <p className="text-gray-600">Successfully guided 100+ students to admission</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-brand-700 rounded-full"></div>
                <div className="w-0.5 h-12 bg-brand-200"></div>
              </div>
              <div>
                <h3 className="font-bold text-lg">2022 - Platform Launch</h3>
                <p className="text-gray-600">Launched digital platform for broader reach</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-brand-700 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-lg">2026 - Global Network</h3>
                <p className="text-gray-600">Partners with 71+ universities and supports thousands of students</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-brand-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-gray-600 mb-6">Join thousands of students who have realized their dreams with MalishaEdu</p>
          <Link href="/get-free-consultation" className="inline-block bg-brand-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-800">
            Get Free Consultation
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/about/page.tsx
git commit -m "feat: create about page with mission, vision, values, and timeline"
```

---

### Task 3: Create FAQ Page

**Files:**
- Create: `app/faqs/page.tsx`
- Create: `src/components/public/FAQAccordion.tsx`

- [ ] **Step 1: Create FAQ component**

```tsx
// src/components/public/FAQAccordion.tsx
"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: "Admission",
    question: "What are the basic requirements to study in China?",
    answer: "Generally, you need a high school diploma or equivalent, a valid passport, language proficiency (Chinese or English depending on program), and good health. Specific requirements vary by university."
  },
  {
    category: "Admission",
    question: "How long does the application process take?",
    answer: "Typically 4-8 weeks from application submission to decision. However, some universities may take longer during peak seasons. Early application is recommended."
  },
  {
    category: "Finance",
    question: "What scholarships are available?",
    answer: "We list 700+ scholarships ranging from full tuition coverage to partial funding. Many Chinese universities offer scholarships for international students based on academic merit."
  },
  {
    category: "Finance",
    question: "What is the typical cost of studying in China?",
    answer: "Annual tuition ranges from $2,000-$10,000+ depending on university and program. Living costs are $300-$600/month in most cities."
  },
  {
    category: "Visa",
    question: "How do I get a student visa?",
    answer: "Once admitted, the university provides admission documents. With these and your passport, apply at the nearest Chinese embassy or consulate for an X1 (long-term) student visa."
  },
  {
    category: "Visa",
    question: "How long is the student visa valid?",
    answer: "Student visas (X1) are typically issued for the duration of your program, usually 1 year at a time with renewal options."
  },
  {
    category: "Accommodation",
    question: "Where do students live?",
    answer: "Most international students live in on-campus dormitories. Some universities also allow off-campus housing. We help arrange accommodation."
  },
  {
    category: "Accommodation",
    question: "Are dormitories provided?",
    answer: "Yes, nearly all universities provide affordable dormitory options. Costs are typically $30-$100/month depending on room type and location."
  }
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const categories = Array.from(new Set(faqs.map(f => f.category)));

  return (
    <div className="space-y-4">
      {categories.map(category => (
        <div key={category} className="mb-8">
          <h3 className="text-lg font-bold text-brand-700 mb-4">{category}</h3>
          <div className="space-y-3">
            {faqs.filter(f => f.category === category).map((faq, idx) => {
              const globalIdx = faqs.indexOf(faq);
              return (
                <div key={globalIdx} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setOpenIndex(openIndex === globalIdx ? null : globalIdx)}
                    className="w-full text-left px-6 py-4 hover:bg-gray-50 flex justify-between items-center"
                  >
                    <span className="font-semibold text-gray-900">{faq.question}</span>
                    <span className="text-brand-700">{openIndex === globalIdx ? '−' : '+'}</span>
                  </button>
                  {openIndex === globalIdx && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-gray-700">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create FAQ page**

```tsx
// app/faqs/page.tsx
import { PublicLayout } from "@/components/public/PublicLayout";
import { FAQAccordion } from "@/components/public/FAQAccordion";
import Link from "next/link";

export const metadata = {
  title: "FAQs - MalishaEdu",
  description: "Frequently asked questions about studying in China"
};

export default function FAQPage() {
  return (
    <PublicLayout>
      <div className="bg-gradient-to-r from-brand-700 to-brand-800 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-brand-100">Find answers to common questions about studying in China</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <FAQAccordion />

          <div className="bg-blue-50 rounded-lg p-8 text-center mt-16">
            <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
            <p className="text-gray-700 mb-6">Our expert consultants are ready to help</p>
            <Link href="/get-free-consultation" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
              Get Free Consultation
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/faqs/page.tsx src/components/public/FAQAccordion.tsx
git commit -m "feat: create FAQ page with expandable Q&A by category"
```

---

### Task 4: Create Contact Page

**Files:**
- Create: `app/contact/page.tsx`
- Create: `src/components/public/ContactForm.tsx`
- Modify: `app/api/v1/public/contact/route.ts` (already exists, update if needed)

- [ ] **Step 1: Create contact form component**

```tsx
// src/components/public/ContactForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone required"),
  subject: z.string().min(5, "Subject required"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (data: ContactForm) => {
    try {
      const response = await fetch("/api/v1/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        setSubmitted(true);
        reset();
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold text-green-700 mb-2">Thank You!</h3>
        <p className="text-green-600">We'll get back to you within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
        <input
          {...register("name")}
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
          placeholder="Your name"
        />
        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
        <input
          {...register("email")}
          type="email"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
          placeholder="your@email.com"
        />
        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
        <input
          {...register("phone")}
          type="tel"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
          placeholder="+1234567890"
        />
        {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
        <input
          {...register("subject")}
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
          placeholder="How can we help?"
        />
        {errors.subject && <p className="text-red-600 text-sm mt-1">{errors.subject.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
        <textarea
          {...register("message")}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
          placeholder="Tell us more..."
        />
        {errors.message && <p className="text-red-600 text-sm mt-1">{errors.message.message}</p>}
      </div>

      <button
        type="submit"
        className="w-full bg-brand-700 text-white py-3 rounded-lg font-semibold hover:bg-brand-800 transition"
      >
        Send Message
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Create contact page**

```tsx
// app/contact/page.tsx
import { PublicLayout } from "@/components/public/PublicLayout";
import { ContactForm } from "@/components/public/ContactForm";
import Link from "next/link";

export const metadata = {
  title: "Contact Us - MalishaEdu",
  description: "Get in touch with MalishaEdu for consultation and support"
};

export default function ContactPage() {
  return (
    <PublicLayout>
      <div className="bg-gradient-to-r from-brand-700 to-brand-800 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-brand-100">We're here to help you every step of the way</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
            <ContactForm />
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-2">📧 Email</h3>
                <p className="text-gray-600">info@malishaedu.com</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-2">📱 WhatsApp</h3>
                <p className="text-gray-600">+1-800-MALISHA-EDU</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-2">⏰ Response Time</h3>
                <p className="text-gray-600">We typically respond within 24 hours</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-2">🎯 Office Hours</h3>
                <p className="text-gray-600">Monday - Friday: 9 AM - 6 PM (GMT+8)</p>
                <p className="text-gray-600">Saturday - Sunday: 10 AM - 4 PM (GMT+8)</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-2">Prefer a Consultation?</h3>
                <p className="text-gray-600 mb-4">Book a free consultation with one of our experts</p>
                <Link href="/get-free-consultation" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/contact/page.tsx src/components/public/ContactForm.tsx
git commit -m "feat: create contact page with form and contact information"
```

---

### Task 5: Create Terms & Privacy Pages

**Files:**
- Create: `app/terms-conditions/page.tsx`
- Create: `app/privacy-policy/page.tsx`
- Create: `app/cookie-policy/page.tsx`

- [ ] **Step 1: Create terms page**

```tsx
// app/terms-conditions/page.tsx
import { PublicLayout } from "@/components/public/PublicLayout";

export const metadata = {
  title: "Terms & Conditions - MalishaEdu",
  description: "Terms and conditions for using MalishaEdu"
};

export default function TermsPage() {
  return (
    <PublicLayout>
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl font-bold mb-8">Terms & Conditions</h1>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">Last updated: April 27, 2026</p>

            <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-6">
              By accessing and using MalishaEdu, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">2. Use License</h2>
            <p className="text-gray-700 mb-6">
              Permission is granted to temporarily download one copy of the materials (information or software) on MalishaEdu's website for personal, non-commercial transitory viewing only.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">3. Disclaimer</h2>
            <p className="text-gray-700 mb-6">
              The materials on MalishaEdu's website are provided on an 'as is' basis. MalishaEdu makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">4. Limitations</h2>
            <p className="text-gray-700 mb-6">
              In no event shall MalishaEdu or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on MalishaEdu's website.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">5. Accuracy of Materials</h2>
            <p className="text-gray-700 mb-6">
              The materials appearing on MalishaEdu's website could include technical, typographical, or photographic errors. MalishaEdu does not warrant that any of the materials on our website are accurate, complete, or current.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">6. Links</h2>
            <p className="text-gray-700 mb-6">
              MalishaEdu has not reviewed all of the sites linked to our website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by MalishaEdu of the site.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">7. Modifications</h2>
            <p className="text-gray-700 mb-6">
              MalishaEdu may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">8. Governing Law</h2>
            <p className="text-gray-700 mb-6">
              These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction where MalishaEdu operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
```

- [ ] **Step 2: Create privacy policy page**

```tsx
// app/privacy-policy/page.tsx
import { PublicLayout } from "@/components/public/PublicLayout";

export const metadata = {
  title: "Privacy Policy - MalishaEdu",
  description: "Privacy policy for MalishaEdu"
};

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">Last updated: April 27, 2026</p>

            <h2 className="text-2xl font-bold mt-8 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-6">
              MalishaEdu ("we" or "us" or "our") operates the https://www.malishaedu.com website (the "Service").
            </p>
            <p className="text-gray-700 mb-6">
              This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">2. Information Collection and Use</h2>
            <p className="text-gray-700 mb-6">
              We collect several different types of information for various purposes to provide and improve our Service to you.
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
              <li>Email address</li>
              <li>First name and last name</li>
              <li>Phone number</li>
              <li>Address, State, Province, ZIP/Postal code, City</li>
              <li>Cookies and Usage Data</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">3. Security of Data</h2>
            <p className="text-gray-700 mb-6">
              The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">4. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 mb-6">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">5. Contact Us</h2>
            <p className="text-gray-700 mb-6">
              If you have any questions about this Privacy Policy, please contact us at: privacy@malishaedu.com
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
```

- [ ] **Step 3: Create cookie policy page**

```tsx
// app/cookie-policy/page.tsx
import { PublicLayout } from "@/components/public/PublicLayout";

export const metadata = {
  title: "Cookie Policy - MalishaEdu",
  description: "Cookie policy for MalishaEdu"
};

export default function CookiePolicyPage() {
  return (
    <PublicLayout>
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">Last updated: April 27, 2026</p>

            <h2 className="text-2xl font-bold mt-8 mb-4">1. What Are Cookies?</h2>
            <p className="text-gray-700 mb-6">
              Cookies are small pieces of data stored on your device. They help us remember your preferences and improve your experience on our website.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">2. Types of Cookies We Use</h2>
            <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and choices</li>
              <li><strong>Marketing Cookies:</strong> Used to track advertising effectiveness</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">3. Managing Cookies</h2>
            <p className="text-gray-700 mb-6">
              You can control and/or delete cookies as you wish. For details, visit aboutcookies.org. You can delete all cookies that are already on your device and set most browsers to prevent them from being placed.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">4. Contact Us</h2>
            <p className="text-gray-700 mb-6">
              If you have questions about our cookie policy, please contact us at: privacy@malishaedu.com
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/terms-conditions/page.tsx app/privacy-policy/page.tsx app/cookie-policy/page.tsx
git commit -m "feat: create legal pages (terms, privacy, cookies)"
```

---

### Task 6: Update Navigation & Footer with New Pages

**Files:**
- Modify: `src/components/public/PublicHeader.tsx`
- Modify: `src/components/public/PublicFooter.tsx`

- [ ] **Step 1: Update header navigation** (if needed, add links to new pages)
- [ ] **Step 2: Update footer** (add links to legal pages)
- [ ] **Step 3: Commit**

```bash
git commit -m "feat: update navigation and footer with new page links"
```

---

### Task 7: Test All Phase 5 Pages

- [ ] **Step 1: Run test suite**

```bash
npm test
```

Expected: All 281 tests still passing ✅

- [ ] **Step 2: Manual testing in browser**

```bash
# Start dev server
npm run dev

# Test each page:
# http://localhost:3000 (home)
# http://localhost:3000/about
# http://localhost:3000/faqs  
# http://localhost:3000/contact
# http://localhost:3000/terms-conditions
# http://localhost:3000/privacy-policy
# http://localhost:3000/cookie-policy
```

Verify:
- ✅ All pages load
- ✅ Forms work
- ✅ Links navigate correctly
- ✅ Mobile responsive
- ✅ No console errors

- [ ] **Step 3: Commit final Phase 5**

```bash
git commit -m "test: verify all Phase 5 pages working correctly"
```

---

## PHASE 7: Consultation Booking System (2-3 weeks)

### Database Schema Changes for Phase 7

```sql
-- Create consultations table
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id),
  consultant_id UUID NOT NULL REFERENCES users(id),
  service VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, completed, cancelled
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INT DEFAULT 30,
  video_meeting_link VARCHAR(255),
  notes TEXT,
  feedback_rating INT,
  feedback_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create consultant availability table
CREATE TABLE consultant_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultant_id UUID NOT NULL REFERENCES users(id),
  day_of_week INT, -- 0-6 (Sunday-Saturday)
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Task 1: Add Consultation Database Schema

**Files:**
- Create: `prisma/migrations/add_consultation_tables/migration.sql`

- [ ] **Step 1: Create migration**

```bash
# Add schema to Prisma
# (Update prisma/schema.prisma with new models)
npx prisma migrate dev --name add_consultation_tables
```

- [ ] **Step 2: Commit**

```bash
git commit -m "feat: add consultation and availability database schema"
```

---

### Task 2: Create Consultation Service & API

**Files:**
- Create: `src/server/services/consultation.service.ts`
- Create: `app/api/v1/public/consultations/route.ts`
- Create: `app/api/v1/public/consultations/[id]/route.ts`
- Create: `src/server/validators/consultation.ts`

- [ ] **Step 1-5**: Implementation (similar pattern to previous APIs)
- [ ] **Step 6**: Commit

```bash
git commit -m "feat: create consultation service and API endpoints"
```

---

### Task 3: Create Booking Page

**Files:**
- Create: `app/book-consultation/page.tsx`
- Create: `src/components/public/ConsultationBookingForm.tsx`

Implements:
- Service selection
- Calendar picker
- Consultant selection
- Booking confirmation
- Payment processing (Stripe integration)

- [ ] **All steps**: Full implementation
- [ ] **Commit**

```bash
git commit -m "feat: create consultation booking page with form and payment"
```

---

### Task 4: Create Consultant Dashboard

**Files:**
- Create: `app/(auth)/consultant/dashboard/page.tsx`
- Create: `src/components/consultant/ConsultationCalendar.tsx`
- Create: `src/components/consultant/BookingList.tsx`

- [ ] **All steps**: Implementation
- [ ] **Commit**

```bash
git commit -m "feat: create consultant dashboard with bookings and calendar"
```

---

### Task 5: Video Meeting Integration

**Files:**
- Create: `src/lib/video-service.ts`
- Create: `app/(auth)/consultation/[id]/meeting/page.tsx`

Integration with Jitsi Meet (open-source, no API key needed)

- [ ] **All steps**: Implementation
- [ ] **Commit**

```bash
git commit -m "feat: integrate Jitsi video meetings for consultations"
```

---

### Task 6: Payment Processing (Stripe)

**Files:**
- Create: `src/lib/stripe.ts`
- Create: `app/api/v1/payments/create-checkout/route.ts`
- Create: `app/api/v1/webhooks/stripe/route.ts`

- [ ] **All steps**: Implementation
- [ ] **Commit**

```bash
git commit -m "feat: integrate Stripe payment processing for consultations"
```

---

### Task 7: Test Phase 7 System

- [ ] **Step 1**: Run full test suite
- [ ] **Step 2**: Manual testing of booking flow
- [ ] **Step 3**: Test payment processing
- [ ] **Step 4**: Test video meeting integration
- [ ] **Step 5**: Commit

```bash
git commit -m "test: verify Phase 7 consultation system working end-to-end"
```

---

## Final Steps (After Both Phases)

### Test All Features
```bash
npm test
```
Expected: 300+ tests passing ✅

### Push to GitHub

```bash
git push origin main
```

### Deploy to Production

```bash
npm run build
# Deploy via Docker or hosting platform
```

---

## Success Criteria

**Phase 5 Complete:**
- ✅ 6 new public pages created and working
- ✅ 300+ lines of documentation
- ✅ All tests passing
- ✅ Mobile responsive
- ✅ Lighthouse score > 90

**Phase 7 Complete:**
- ✅ Full consultation booking system
- ✅ Payment processing working
- ✅ Video meetings functional
- ✅ Consultant dashboard ready
- ✅ 320+ tests passing
- ✅ All changes pushed to GitHub

