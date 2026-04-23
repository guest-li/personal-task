import { prisma } from "@/server/db";
import { hashPassword } from "@/server/auth/password";
import type { User, Application, Event, Role, ApplicationStatus, Prisma } from "@prisma/client";

// Filter interfaces
interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
}

interface ApplicationFilters {
  status?: string;
  search?: string;
}

interface EventFilters {
  status?: string;
  search?: string;
}

// User Admin
export async function createUserAdmin(
  email: string,
  password: string,
  name: string,
  role: string,
) {
  try {
    const hash = await hashPassword(password);
    return await prisma.user.create({
      data: {
        email,
        passwordHash: hash,
        name,
        role: role as Role,
        status: "active",
      },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new Error("Email already exists");
    }
    throw error;
  }
}

export async function updateUserAdmin(id: string, data: Prisma.UserUpdateInput) {
  try {
    return await prisma.user.update({ where: { id }, data });
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new Error("User not found");
    }
    throw error;
  }
}

export async function deactivateUserAdmin(id: string) {
  try {
    return await prisma.user.update({
      where: { id },
      data: { status: "suspended" },
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new Error("User not found");
    }
    throw error;
  }
}

export async function listUsersAdmin(page: number, limit: number, filters: UserFilters) {
  try {
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
  } catch (error) {
    throw error;
  }
}

export async function getUserDetailAdmin(id: string) {
  try {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        gender: true,
        country: true,
        role: true,
        status: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    throw error;
  }
}

// Application Admin
export async function approveApplicationAdmin(
  id: string,
  status: string,
  note?: string,
) {
  try {
    const app = await prisma.application.update({
      where: { id },
      data: { status: status as ApplicationStatus },
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
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new Error("Application not found");
    }
    throw error;
  }
}

export async function listApplicationsAdmin(
  page: number,
  limit: number,
  filters: ApplicationFilters,
) {
  try {
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
  } catch (error) {
    throw error;
  }
}

export async function getApplicationDetailAdmin(id: string) {
  try {
    return await prisma.application.findUnique({
      where: { id },
      include: { user: true },
    });
  } catch (error) {
    throw error;
  }
}

// Event Admin
export async function createEventAdmin(data: Prisma.EventCreateInput) {
  try {
    return await prisma.event.create({ data });
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new Error("Event with this name already exists");
    }
    throw error;
  }
}

export async function updateEventAdmin(id: string, data: Prisma.EventUpdateInput) {
  try {
    return await prisma.event.update({ where: { id }, data });
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new Error("Event not found");
    }
    throw error;
  }
}

export async function deleteEventAdmin(id: string) {
  try {
    // Cascade delete event registrations
    await prisma.eventRegistration.deleteMany({ where: { eventId: id } });
    return await prisma.event.delete({ where: { id } });
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new Error("Event not found");
    }
    throw error;
  }
}

export async function listEventsAdmin(
  page: number,
  limit: number,
  filters: EventFilters,
) {
  try {
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
  } catch (error) {
    throw error;
  }
}

export async function getEventDetailAdmin(id: string) {
  try {
    return await prisma.event.findUnique({ where: { id } });
  } catch (error) {
    throw error;
  }
}

// Partner Admin
export async function approvePartnerAdmin(userId: string, approved: boolean) {
  try {
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
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new Error("User not found");
    }
    throw error;
  }
}

export async function listPendingPartnersAdmin(page: number, limit: number) {
  try {
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
  } catch (error) {
    throw error;
  }
}

// Notifications
export async function sendNotificationAdmin(
  title: string,
  message: string,
  targetRole?: string,
  targetUserIds?: string[],
) {
  try {
    let userIds: string[] = [];

    if (targetUserIds && targetUserIds.length > 0) {
      userIds = targetUserIds;
    } else if (targetRole) {
      const users = await prisma.user.findMany({
        where: { role: targetRole as Role },
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
  } catch (error) {
    throw error;
  }
}
