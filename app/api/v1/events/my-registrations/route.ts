import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthContext } from "@/server/middleware/with-auth";
import { prisma } from "@/server/db";

export const GET = withAuth(async (req: NextRequest, { user }: AuthContext) => {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "10")));
  const search = url.searchParams.get("search") ?? undefined;

  const where: Record<string, unknown> = { userId: user.sub };

  if (search) {
    where.event = { name: { contains: search, mode: "insensitive" } };
  }

  const [registrations, total] = await Promise.all([
    prisma.eventRegistration.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            price: true,
            category: true,
          },
        },
      },
      orderBy: { orderDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.eventRegistration.count({ where }),
  ]);

  return NextResponse.json({
    registrations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});
