import { describe, it, expect } from "vitest";
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from "@/server/auth/jwt";
import type { TokenPayload } from "@/types/auth";

const payload: TokenPayload = {
  sub: "user-123",
  email: "test@example.com",
  role: "student",
};

describe("JWT", () => {
  it("signs and verifies an access token", () => {
    const token = signAccessToken(payload);
    expect(typeof token).toBe("string");

    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe("user-123");
    expect(decoded.email).toBe("test@example.com");
    expect(decoded.role).toBe("student");
  });

  it("signs and verifies a refresh token", () => {
    const token = signRefreshToken(payload);
    const decoded = verifyRefreshToken(token);
    expect(decoded.sub).toBe("user-123");
  });

  it("rejects tampered token", () => {
    const token = signAccessToken(payload);
    expect(() => verifyAccessToken(token + "x")).toThrow();
  });

  it("access and refresh secrets are different", () => {
    const access = signAccessToken(payload);
    expect(() => verifyRefreshToken(access)).toThrow();
  });
});
