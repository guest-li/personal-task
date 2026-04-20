export type Role = "student" | "counselor" | "admin" | "partner";

export interface TokenPayload {
  sub: string;       // user ID
  email: string;
  role: Role;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}
