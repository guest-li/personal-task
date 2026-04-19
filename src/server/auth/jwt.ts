import jwt from "jsonwebtoken";
import type { TokenPayload } from "@/types/auth";
import { TOKEN_EXPIRY } from "./constants";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-me-32chars!";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret-change-me-32chars";

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: TOKEN_EXPIRY.ACCESS,
  });
}

export function signRefreshToken(payload: TokenPayload, rememberMe = false): string {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: rememberMe ? TOKEN_EXPIRY.REMEMBER_ME_REFRESH : TOKEN_EXPIRY.REFRESH,
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
}
