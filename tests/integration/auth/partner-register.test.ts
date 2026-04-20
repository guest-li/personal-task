import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/v1/auth/partner-register/route";
import { cleanDatabase, testPrisma } from "../../helpers/db";

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/v1/auth/partner-register", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/v1/auth/partner-register", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it("registers a partner with inactive status", async () => {
    const res = await POST(makeRequest({
      name: "Partner Corp",
      email: "partner@example.com",
      password: "securepass123",
      confirmPassword: "securepass123",
      gender: "male",
      country: "Bangladesh",
    }));

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.user.role).toBe("partner");
    expect(body.user.status).toBe("inactive");

    const dbUser = await testPrisma.user.findUnique({
      where: { email: "partner@example.com" },
    });
    expect(dbUser).not.toBeNull();
    expect(dbUser!.status).toBe("inactive");
    expect(dbUser!.role).toBe("partner");
  });

  it("does not set auth cookies (inactive account)", async () => {
    const res = await POST(makeRequest({
      name: "Partner2",
      email: "partner2@example.com",
      password: "securepass123",
      confirmPassword: "securepass123",
      gender: "female",
      country: "Thailand",
    }));

    expect(res.status).toBe(201);
    const cookies = res.headers.getSetCookie();
    expect(cookies.length).toBe(0);
  });

  it("returns 400 when required fields missing", async () => {
    const res = await POST(makeRequest({
      name: "Incomplete",
      email: "inc@example.com",
      password: "securepass123",
      confirmPassword: "securepass123",
    }));
    expect(res.status).toBe(400);
  });

  it("returns 409 for duplicate email", async () => {
    await POST(makeRequest({
      name: "First",
      email: "dup@example.com",
      password: "securepass123",
      confirmPassword: "securepass123",
      gender: "male",
      country: "China",
    }));

    const res = await POST(makeRequest({
      name: "Second",
      email: "dup@example.com",
      password: "securepass456",
      confirmPassword: "securepass456",
      gender: "male",
      country: "China",
    }));

    expect(res.status).toBe(409);
  });
});
