import { prisma } from "@/server/db";
import { hashPassword } from "@/server/auth/password";
import type { User, Application, Event } from "@prisma/client";

// User Admin
export async function createUserAdmin(
  email: string,
  password: string,
  name: string,
  role: string,
) {
  const hash = await hashPassword(password);
  return prisma.user.create({
    data: {
      email,
      passwordHash: hash,
      name,
      role: role as any,
      status: "active",
    },
  });
}

export async function updateUserAdmin(id: string, data: any) {
  return prisma.user.update({ where: { id }, data });
}

export async function deactivateUserAdmin(id: string) {
  return prisma.user.update({
    where: { id },
    data: { status: "suspended" },
  });
}

export async function listUsersAdmin(page: number, limit: number, filters: any) {
  const where: any = {};
  if (filters.role) where.role = filters.role;
  if (filters.status) where.status = filters.status;
  if (filters.search) {
    where.OR = [
      { email: { contains: filters.search, mode: "insensitive" } },
      { name: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getUserDetailAdmin(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

// Application Admin
export async function approveApplicationAdmin(
  id: string,
  status: string,
  note?: string,
) {
  const app = await prisma.application.update({
    where: { id },
    data: { status: status as any },
    include: { user: true },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId: app.userId,
      title: `Application ${status}`,
      message:
        status === "approved"
          ? `Your application to ${app.universityName} has been approved!`
          : `Your application to ${app.universityName} was not approved.`,
    },
  });

  return app;
}

export async function listApplicationsAdmin(
  page: number,
  limit: number,
  filters: any,
) {
  const where: any = {};
  if (filters.status) where.status = filters.status;
  if (filters.search) {
    where.OR = [
      { applicationCode: { contains: filters.search, mode: "insensitive" } },
      { programName: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [apps, total] = await Promise.all([
    prisma.application.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { appliedAt: "desc" },
    }),
    prisma.application.count({ where }),
  ]);

  return {
    applications: apps,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getApplicationDetailAdmin(id: string) {
  return prisma.application.findUnique({
    where: { id },
    include: { user: true },
  });
}

// Event Admin
export async function createEventAdmin(data: any) {
  return prisma.event.create({ data });
}

export async function updateEventAdmin(id: string, data: any) {
  return prisma.event.update({ where: { id }, data });
}

export async function deleteEventAdmin(id: string) {
  // Cascade delete event registrations
  await prisma.eventRegistration.deleteMany({ where: { eventId: id } });
  return prisma.event.delete({ where: { id } });
}

export async function listEventsAdmin(
  page: number,
  limit: number,
  filters: any,
) {
  const where: any = {};
  if (filters.status) where.status = filters.status;
  if (filters.search)
    where.name = { contains: filters.search, mode: "insensitive" };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { startDate: "desc" },
    }),
    prisma.event.count({ where }),
  ]);

  return {
    events,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getEventDetailAdmin(id: string) {
  return prisma.event.findUnique({ where: { id } });
}

// Partner Admin
export async function approvePartnerAdmin(userId: string, approved: boolean) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status: approved ? "active" : "suspended" },
    include: { partnerProfile: true },
  });

  if (approved) {
    await prisma.notification.create({
      data: {
        userId,
        title: "Partner Application Approved",
        message:
          "Your partner application has been approved. You can now help students!",
      },
    });
  }

  return user;
}

export async function listPendingPartnersAdmin(page: number, limit: number) {
  const [partners, total] = await Promise.all([
    prisma.user.findMany({
      where: { role: "partner", status: "inactive" },
      include: { partnerProfile: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.count({
      where: { role: "partner", status: "inactive" },
    }),
  ]);

  return {
    partners,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Notifications
export async function sendNotificationAdmin(
  title: string,
  message: string,
  targetRole?: string,
  targetUserIds?: string[],
) {
  let userIds: string[] = [];

  if (targetUserIds && targetUserIds.length > 0) {
    userIds = targetUserIds;
  } else if (targetRole) {
    const users = await prisma.user.findMany({
      where: { role: targetRole as any },
      select: { id: true },
    });
    userIds = users.map((u) => u.id);
  } else {
    const users = await prisma.user.findMany({
      select: { id: true },
    });
    userIds = users.map((u) => u.id);
  }

  const notifications = await Promise.all(
    userIds.map((uid) =>
      prisma.notification.create({
        data: { userId: uid, title, message },
      }),
    ),
  );

  return {
    createdCount: notifications.length,
    notificationIds: notifications.map((n) => n.id),
  };
}
