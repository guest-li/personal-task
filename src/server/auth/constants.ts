export const AUTH_COOKIE = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
} as const;

export const TOKEN_EXPIRY = {
  ACCESS: "15m",
  REFRESH: "7d",
  REMEMBER_ME_REFRESH: "30d",
} as const;

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
