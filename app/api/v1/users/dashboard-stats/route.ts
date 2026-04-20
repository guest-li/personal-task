import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthContext } from "@/server/middleware/with-auth";
import { getDashboardStats, getApplicationHistory } from "@/server/services/application.service";
import { prisma } from "@/server/db";

export const GET = withAuth(async (_req: NextRequest, { user }: AuthContext) => {
  const stats = await getDashboardStats(user.sub);
  const applicationHistory = await getApplicationHistory(user.sub);

  const response: Record<string, unknown> = {
    stats: {
      ...stats,
    },
    charts: {
      applicationHistory,
      summary: {
        applications: stats.totalApplications,
        serviceCharge: stats.serviceCharge,
        applicationFees: stats.applicationFeesPaid,
      },
    },
  };

  if (user.role === "partner") {
    const partnerProfile = await prisma.partnerProfile.findUnique({
      where: { userId: user.sub },
    });
    (response.stats as Record<string, unknown>).partnerLevel =
      partnerProfile?.level ?? "beginner";
  }

  return NextResponse.json(response);
});
