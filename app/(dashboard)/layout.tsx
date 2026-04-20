import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken } from "@/server/auth/jwt";
import { AUTH_COOKIE } from "@/server/auth/constants";
import { prisma } from "@/server/db";
import { getUnreadCount } from "@/server/services/notification.service";
import DashboardShell from "./DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE.ACCESS_TOKEN)?.value;

  if (!token) {
    redirect("/sign-in");
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, avatar: true, role: true, status: true },
  });

  if (!user) {
    redirect("/sign-in");
  }

  const unreadCount = await getUnreadCount(user.id);

  return (
    <DashboardShell
      userId={user.id}
      userName={user.name}
      userAvatar={user.avatar}
      userRole={user.role}
      userStatus={user.status}
      unreadCount={unreadCount}
    >
      {children}
    </DashboardShell>
  );
}
