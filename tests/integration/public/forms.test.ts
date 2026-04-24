import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as POST_CONSULTATION } from "@/app/api/v1/public/consultation/route";
import { POST as POST_CONTACT } from "@/app/api/v1/public/contact/route";
import { POST as POST_NEWSLETTER } from "@/app/api/v1/public/newsletter/route";
import { cleanDatabase } from "../../helpers/db";

function makeFormRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/v1/public/form", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

function makeConsultationRequest(body: Record<string, unknown>) {
  return makeFormRequest(body);
}

function makeContactRequest(body: Record<string, unknown>) {
  return makeFormRequest(body);
}

function makeNewsletterRequest(body: Record<string, unknown>) {
  return makeFormRequest(body);
}

describe("Public Forms API", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe("POST /api/v1/public/consultation", () => {
    it("should accept valid consultation form", async () => {
      const req = makeConsultationRequest({
        name: "John Doe",
        phone: "9841234567",
        email: "john@example.com",
        interestedMajor: "Engineering",
        interestedDegree: "Master",
        academicResult: "3.5 GPA",
      });

      const res = await POST_CONSULTATION(req);
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.message).toBeDefined();
    });

    it("should accept consultation form with minimal fields", async () => {
      const req = makeConsultationRequest({
        name: "Jane Smith",
        phone: "9841234567",
      });

      const res = await POST_CONSULTATION(req);
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
    });

    it("should reject missing name", async () => {
      const req = makeConsultationRequest({
        phone: "9841234567",
        email: "test@example.com",
      });

      const res = await POST_CONSULTATION(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    it("should reject missing phone", async () => {
      const req = makeConsultationRequest({
        name: "Test User",
        email: "test@example.com",
      });

      const res = await POST_CONSULTATION(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    it("should reject empty name", async () => {
      const req = makeConsultationRequest({
        name: "",
        phone: "9841234567",
      });

      const res = await POST_CONSULTATION(req);
      expect(res.status).toBe(400);
    });

    it("should reject phone shorter than 10 digits", async () => {
      const req = makeConsultationRequest({
        name: "Test User",
        phone: "98412345",
      });

      const res = await POST_CONSULTATION(req);
      expect(res.status).toBe(400);
    });

    it("should accept optional email field", async () => {
      const req = makeConsultationRequest({
        name: "User Without Email",
        phone: "9841234567",
        interestedMajor: "Business",
      });

      const res = await POST_CONSULTATION(req);
      expect(res.status).toBe(201);
    });

    it("should reject invalid email format", async () => {
      const req = makeConsultationRequest({
        name: "Test User",
        phone: "9841234567",
        email: "not-an-email",
      });

      const res = await POST_CONSULTATION(req);
      expect(res.status).toBe(400);
    });

    it("should reject invalid JSON", async () => {
      const req = new NextRequest("http://localhost/api/v1/public/consultation", {
        method: "POST",
        body: "{ invalid json",
        headers: { "Content-Type": "application/json" },
      });

      const res = await POST_CONSULTATION(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain("Invalid JSON");
    });

    it("should accept optional academic and degree fields", async () => {
      const req = makeConsultationRequest({
        name: "Student",
        phone: "9841234567",
        interestedDegree: "Bachelor",
        academicResult: "Grade A",
      });

      const res = await POST_CONSULTATION(req);
      expect(res.status).toBe(201);
      expect((await res.json()).success).toBe(true);
    });
  });

  describe("POST /api/v1/public/contact", () => {
    it("should accept valid contact form", async () => {
      const req = makeContactRequest({
        name: "John Doe",
        phone: "9841234567",
        email: "john@example.com",
        userType: "student",
        organization: "ABC School",
        preferredDate: "2024-06-15",
        preferredTime: "10:00 AM",
        reason: "Inquiring about programs",
      });

      const res = await POST_CONTACT(req);
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
    });

    it("should accept contact form with minimal fields", async () => {
      const req = makeContactRequest({
        name: "Jane Smith",
        phone: "9841234567",
        email: "jane@example.com",
        userType: "instructor",
      });

      const res = await POST_CONTACT(req);
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
    });

    it("should reject missing name", async () => {
      const req = makeContactRequest({
        phone: "9841234567",
        email: "test@example.com",
        userType: "student",
      });

      const res = await POST_CONTACT(req);
      expect(res.status).toBe(400);
    });

    it("should reject missing phone", async () => {
      const req = makeContactRequest({
        name: "Test User",
        email: "test@example.com",
        userType: "student",
      });

      const res = await POST_CONTACT(req);
      expect(res.status).toBe(400);
    });

    it("should reject missing email", async () => {
      const req = makeContactRequest({
        name: "Test User",
        phone: "9841234567",
        userType: "student",
      });

      const res = await POST_CONTACT(req);
      expect(res.status).toBe(400);
    });

    it("should reject missing userType", async () => {
      const req = makeContactRequest({
        name: "Test User",
        phone: "9841234567",
        email: "test@example.com",
      });

      const res = await POST_CONTACT(req);
      expect(res.status).toBe(400);
    });

    it("should reject invalid userType", async () => {
      const req = makeContactRequest({
        name: "Test User",
        phone: "9841234567",
        email: "test@example.com",
        userType: "invalid_type",
      });

      const res = await POST_CONTACT(req);
      expect(res.status).toBe(400);
    });

    it("should accept valid userType values", async () => {
      for (const type of ["student", "instructor", "company"]) {
        const req = makeContactRequest({
          name: "Test User",
          phone: "9841234567",
          email: "test@example.com",
          userType: type,
        });

        const res = await POST_CONTACT(req);
        expect(res.status).toBe(201);
      }
    });

    it("should reject invalid email format", async () => {
      const req = makeContactRequest({
        name: "Test User",
        phone: "9841234567",
        email: "invalid-email",
        userType: "student",
      });

      const res = await POST_CONTACT(req);
      expect(res.status).toBe(400);
    });

    it("should reject phone shorter than 10 digits", async () => {
      const req = makeContactRequest({
        name: "Test User",
        phone: "98412345",
        email: "test@example.com",
        userType: "student",
      });

      const res = await POST_CONTACT(req);
      expect(res.status).toBe(400);
    });

    it("should accept optional organization field", async () => {
      const req = makeContactRequest({
        name: "User",
        phone: "9841234567",
        email: "test@example.com",
        userType: "company",
        organization: "Tech Company Ltd",
      });

      const res = await POST_CONTACT(req);
      expect(res.status).toBe(201);
    });

    it("should accept optional preferredDate field", async () => {
      const req = makeContactRequest({
        name: "User",
        phone: "9841234567",
        email: "test@example.com",
        userType: "student",
        preferredDate: "2024-07-01",
      });

      const res = await POST_CONTACT(req);
      expect(res.status).toBe(201);
    });

    it("should accept optional preferredTime field", async () => {
      const req = makeContactRequest({
        name: "User",
        phone: "9841234567",
        email: "test@example.com",
        userType: "student",
        preferredTime: "2:00 PM",
      });

      const res = await POST_CONTACT(req);
      expect(res.status).toBe(201);
    });

    it("should accept optional reason field", async () => {
      const req = makeContactRequest({
        name: "User",
        phone: "9841234567",
        email: "test@example.com",
        userType: "student",
        reason: "Want to inquire about scholarship opportunities",
      });

      const res = await POST_CONTACT(req);
      expect(res.status).toBe(201);
    });

    it("should reject invalid JSON", async () => {
      const req = new NextRequest("http://localhost/api/v1/public/contact", {
        method: "POST",
        body: "{ invalid",
        headers: { "Content-Type": "application/json" },
      });

      const res = await POST_CONTACT(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain("Invalid JSON");
    });

    it("should return proper error structure with validation details", async () => {
      const req = makeContactRequest({
        name: "User",
        // missing required fields
      });

      const res = await POST_CONTACT(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });
  });

  describe("POST /api/v1/public/newsletter", () => {
    it("should accept valid newsletter subscription", async () => {
      const req = makeNewsletterRequest({
        email: "subscriber@example.com",
      });

      const res = await POST_NEWSLETTER(req);
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.message).toBeDefined();
    });

    it("should reject missing email", async () => {
      const req = makeNewsletterRequest({});

      const res = await POST_NEWSLETTER(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    it("should reject invalid email format", async () => {
      const req = makeNewsletterRequest({
        email: "not-an-email",
      });

      const res = await POST_NEWSLETTER(req);
      expect(res.status).toBe(400);
    });

    it("should reject empty email", async () => {
      const req = makeNewsletterRequest({
        email: "",
      });

      const res = await POST_NEWSLETTER(req);
      expect(res.status).toBe(400);
    });

    it("should accept multiple valid email formats", async () => {
      const emails = [
        "simple@example.com",
        "user+tag@example.co.uk",
        "first.last@example.org",
        "123@example.com",
      ];

      for (const email of emails) {
        const req = makeNewsletterRequest({ email });
        const res = await POST_NEWSLETTER(req);
        expect(res.status).toBe(201);
      }
    });

    it("should reject invalid JSON", async () => {
      const req = new NextRequest("http://localhost/api/v1/public/newsletter", {
        method: "POST",
        body: "{invalid json}",
        headers: { "Content-Type": "application/json" },
      });

      const res = await POST_NEWSLETTER(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain("Invalid JSON");
    });

    it("should have only email field required", async () => {
      const req = makeNewsletterRequest({
        email: "test@example.com",
        extraField: "should be ignored",
        anotherField: 12345,
      });

      const res = await POST_NEWSLETTER(req);
      expect(res.status).toBe(201);
      expect((await res.json()).success).toBe(true);
    });
  });
});
