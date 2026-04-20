import { prisma } from "@/server/db";
import type { ApplicationStatus, FundType } from "@prisma/client";

interface CreateApplicationInput {
  userId: string;
  programName: string;
  universityName: string;
  degree?: string;
  language?: string;
  fundType?: FundType;
}

interface ListOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  fundType?: FundType;
  status?: ApplicationStatus;
  search?: string;
  university?: string;
  degree?: string;
}

async function generateApplicationCode(): Promise<string> {
  const today = new Date();
  const dateStr =
    today.getFullYear().toString() +
    (today.getMonth() + 1).toString().padStart(2, "0") +
    today.getDate().toString().padStart(2, "0");

  const prefix = `APP-${dateStr}-`;

  const latest = await prisma.application.findFirst({
    where: { applicationCode: { startsWith: prefix } },
    orderBy: { applicationCode: "desc" },
  });

  let seq = 1;
  if (latest) {
    const lastSeq = parseInt(latest.applicationCode.split("-")[2]);
    seq = lastSeq + 1;
  }

  return `${prefix}${seq.toString().padStart(3, "0")}`;
}

export async function createApplication(input: CreateApplicationInput) {
  const applicationCode = await generateApplicationCode();

  return prisma.application.create({
    data: {
      applicationCode,
      userId: input.userId,
      programName: input.programName,
      universityName: input.universityName,
      degree: input.degree ?? null,
      language: input.language ?? null,
      fundType: input.fundType ?? "self_funded",
    },
  });
}

export async function listApplications(userId: string, options: ListOptions) {
  const where: Record<string, unknown> = { userId };

  if (options.fundType) where.fundType = options.fundType;
  if (options.status) where.status = options.status;
  if (options.university) where.universityName = { contains: options.university, mode: "insensitive" };
  if (options.degree) where.degree = { contains: options.degree, mode: "insensitive" };
  if (options.search) {
    where.OR = [
      { programName: { contains: options.search, mode: "insensitive" } },
      { universityName: { contains: options.search, mode: "insensitive" } },
      { applicationCode: { contains: options.search, mode: "insensitive" } },
    ];
  }

  const orderBy: Record<string, string> = {};
  const sortField = options.sortBy ?? "appliedAt";
  orderBy[sortField] = options.sortOrder ?? "desc";

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      orderBy,
      skip: (options.page - 1) * options.limit,
      take: options.limit,
    }),
    prisma.application.count({ where }),
  ]);

  return {
    applications,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: Math.ceil(total / options.limit),
    },
  };
}

export async function cancelApplication(applicationId: string, userId: string) {
  const app = await prisma.application.findFirst({
    where: { id: applicationId, userId },
  });

  if (!app) throw new Error("Application not found");
  if (app.status !== "pending") throw new Error("Only pending applications can be cancelled");

  return prisma.application.update({
    where: { id: applicationId },
    data: { status: "cancelled" },
  });
}

export async function getDashboardStats(userId: string) {
  const apps = await prisma.application.findMany({ where: { userId } });

  const totalApplications = apps.length;
  const applicationFeesPaid = apps.reduce((sum, a) => sum + Number(a.applicationFeePaid), 0);
  const serviceCharge = apps.reduce((sum, a) => sum + Number(a.serviceCharge), 0);
  const serviceChargePaid = apps.reduce((sum, a) => sum + Number(a.serviceChargePaid), 0);

  return {
    totalApplications,
    applicationFeesPaid,
    serviceCharge,
    serviceChargePaid,
  };
}

export async function getApplicationHistory(userId: string) {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const apps = await prisma.application.findMany({
    where: { userId, appliedAt: { gte: twelveMonthsAgo } },
    select: { appliedAt: true, status: true },
  });

  const months: Record<string, { applications: number; approved: number }> = {};
  for (const app of apps) {
    const key = `${app.appliedAt.getFullYear()}-${(app.appliedAt.getMonth() + 1).toString().padStart(2, "0")}`;
    if (!months[key]) months[key] = { applications: 0, approved: 0 };
    months[key].applications++;
    if (app.status === "approved") months[key].approved++;
  }

  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month, ...data }));
}
