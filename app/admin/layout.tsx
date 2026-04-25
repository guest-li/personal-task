import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ReactNode } from "react";
import { verifyAccessToken } from "@/server/auth/jwt";
import { AUTH_COOKIE } from "@/server/auth/constants";

export default async function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE.ACCESS_TOKEN)?.value;

  if (!token) {
    redirect("/sign-in");
  }

  let user;
  try {
    user = verifyAccessToken(token);
  } catch {
    redirect("/sign-in");
  }

  if (!user || user.role !== "admin") {
    redirect("/sign-in");
  }

  return <AdminLayout user={user}>{children}</AdminLayout>;
}
