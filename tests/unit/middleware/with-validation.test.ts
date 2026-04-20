// tests/unit/middleware/with-validation.test.ts
import { describe, it, expect } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { withValidation } from "@/server/middleware/with-validation";
import { z } from "zod";

const testSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

describe("withValidation", () => {
  it("passes validated body to handler", async () => {
    const handler = withValidation(testSchema, async (_req, ctx) => {
      return NextResponse.json({ email: ctx.body.email });
    });

    const req = new NextRequest("http://localhost/api/test", {
      method: "POST",
      body: JSON.stringify({ email: "a@b.com", name: "Test" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await handler(req, { params: {} });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.email).toBe("a@b.com");
  });

  it("returns 400 on invalid body", async () => {
    const handler = withValidation(testSchema, async () => NextResponse.json({}));

    const req = new NextRequest("http://localhost/api/test", {
      method: "POST",
      body: JSON.stringify({ email: "not-an-email" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await handler(req, { params: {} });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid request");
  });

  it("returns 400 on missing body", async () => {
    const handler = withValidation(testSchema, async () => NextResponse.json({}));
    const req = new NextRequest("http://localhost/api/test", { method: "POST" });
    const res = await handler(req, { params: {} });
    expect(res.status).toBe(400);
  });
});
