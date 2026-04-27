import { prisma } from "@/server/db";
import { hashPassword } from "@/server/auth/password";
import type { User, Application, Event, Role, ApplicationStatus, Prisma } from "@prisma/client";
import type {
  CreateCourseInput,
  UpdateCourseInput,
  CreateScholarshipInput,
  UpdateScholarshipInput,
} from "@/server/validators/admin";

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

// ── Universities ──────────────────────────────────────────────────────────

interface UniversityFilters {
  search?: string;
  province?: string;
}

export async function listUniversitiesAdmin(
  page: number,
  limit: number,
  filters: UniversityFilters,
) {
  const skip = (page - 1) * limit;
  const where: Prisma.UniversityWhereInput = {};
  if (filters.search) where.name = { contains: filters.search, mode: "insensitive" };
  if (filters.province) where.province = filters.province;

  const [items, total] = await Promise.all([
    prisma.university.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.university.count({ where }),
  ]);

  return {
    universities: items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getUniversityDetailAdmin(id: string) {
  return prisma.university.findUnique({ where: { id } });
}

export async function createUniversityAdmin(data: Prisma.UniversityCreateInput) {
  try {
    return await prisma.university.create({ data });
  } catch (error: any) {
    if (error.code === "P2002") throw new Error("Slug already exists");
    throw error;
  }
}

export async function updateUniversityAdmin(
  id: string,
  data: Prisma.UniversityUpdateInput,
) {
  try {
    return await prisma.university.update({ where: { id }, data });
  } catch (error: any) {
    if (error.code === "P2002") throw new Error("Slug already exists");
    throw error;
  }
}

export async function deleteUniversityAdmin(id: string) {
  return prisma.university.delete({ where: { id } });
}

// ── Courses ───────────────────────────────────────────────────────────────

interface CourseFilters {
  search?: string;
  degree?: string;
  universityId?: string;
}

export async function listCoursesAdmin(
  page: number,
  limit: number,
  filters: CourseFilters,
) {
  const skip = (page - 1) * limit;
  const where: Prisma.CourseWhereInput = {};
  if (filters.search) where.name = { contains: filters.search, mode: "insensitive" };
  if (filters.degree) where.degree = filters.degree;
  if (filters.universityId) where.universityId = filters.universityId;

  const [items, total] = await Promise.all([
    prisma.course.findMany({
      where,
      include: { university: { select: { id: true, name: true } } },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.course.count({ where }),
  ]);

  return {
    courses: items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getCourseDetailAdmin(id: string) {
  return prisma.course.findUnique({
    where: { id },
    include: { university: { select: { id: true, name: true } } },
  });
}

export async function createCourseAdmin(data: CreateCourseInput) {
  try {
    const { universityId, ...rest } = data;
    return await prisma.course.create({
      data: {
        ...rest,
        university: { connect: { id: universityId } },
      },
      include: { university: { select: { id: true, name: true } } },
    });
  } catch (error: any) {
    if (error.code === "P2002") throw new Error("Slug already exists");
    throw error;
  }
}

export async function updateCourseAdmin(id: string, data: UpdateCourseInput) {
  try {
    const { universityId, ...rest } = data;
    const updateData: Prisma.CourseUpdateInput = rest;
    if (universityId) {
      updateData.university = { connect: { id: universityId } };
    }
    return await prisma.course.update({
      where: { id },
      data: updateData,
      include: { university: { select: { id: true, name: true } } },
    });
  } catch (error: any) {
    if (error.code === "P2002") throw new Error("Slug already exists");
    throw error;
  }
}

export async function deleteCourseAdmin(id: string) {
  return prisma.course.delete({ where: { id } });
}

// ── Scholarships ──────────────────────────────────────────────────────────

interface ScholarshipFilters {
  search?: string;
  type?: string;
  degree?: string;
}

export async function listScholarshipsAdmin(
  page: number,
  limit: number,
  filters: ScholarshipFilters,
) {
  const skip = (page - 1) * limit;
  const where: Prisma.ScholarshipWhereInput = {};
  if (filters.search) where.name = { contains: filters.search, mode: "insensitive" };
  if (filters.type) where.type = filters.type;
  if (filters.degree) where.degree = filters.degree;

  const [items, total] = await Promise.all([
    prisma.scholarship.findMany({
      where,
      include: { university: { select: { id: true, name: true } } },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.scholarship.count({ where }),
  ]);

  return {
    scholarships: items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getScholarshipDetailAdmin(id: string) {
  return prisma.scholarship.findUnique({
    where: { id },
    include: { university: { select: { id: true, name: true } } },
  });
}

export async function createScholarshipAdmin(data: CreateScholarshipInput) {
  try {
    const { universityId, ...rest } = data;
    return await prisma.scholarship.create({
      data: {
        ...rest,
        university: { connect: { id: universityId } },
      },
      include: { university: { select: { id: true, name: true } } },
    });
  } catch (error: any) {
    if (error.code === "P2002") throw new Error("Slug already exists");
    throw error;
  }
}

export async function updateScholarshipAdmin(
  id: string,
  data: UpdateScholarshipInput,
) {
  try {
    const { universityId, ...rest } = data;
    const updateData: Prisma.ScholarshipUpdateInput = rest;
    if (universityId) {
      updateData.university = { connect: { id: universityId } };
    }
    return await prisma.scholarship.update({
      where: { id },
      data: updateData,
      include: { university: { select: { id: true, name: true } } },
    });
  } catch (error: any) {
    if (error.code === "P2002") throw new Error("Slug already exists");
    throw error;
  }
}

export async function deleteScholarshipAdmin(id: string) {
  return prisma.scholarship.delete({ where: { id } });
}

// ── Blog Posts ────────────────────────────────────────────────────────────

interface BlogPostFilters {
  search?: string;
  published?: boolean;
  category?: string;
}

export async function listBlogPostsAdmin(
  page: number,
  limit: number,
  filters: BlogPostFilters,
) {
  const skip = (page - 1) * limit;
  const where: Prisma.BlogPostWhereInput = {};
  if (filters.search) where.title = { contains: filters.search, mode: "insensitive" };
  if (filters.published !== undefined) {
    where.published = filters.published;
  }
  if (filters.category) where.category = filters.category;

  const [items, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return {
    blogPosts: items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getBlogPostDetailAdmin(id: string) {
  return prisma.blogPost.findUnique({ where: { id } });
}

export async function createBlogPostAdmin(data: Prisma.BlogPostCreateInput) {
  try {
    // If published is true and publishedAt is not provided, set it to now
    const finalData = {
      ...data,
      ...(data.published === true && !data.publishedAt && { publishedAt: new Date() }),
    };
    return await prisma.blogPost.create({ data: finalData });
  } catch (error: any) {
    if (error.code === "P2002") throw new Error("Slug already exists");
    throw error;
  }
}

export async function updateBlogPostAdmin(id: string, data: Prisma.BlogPostUpdateInput) {
  try {
    // If published is being set to true and publishedAt is not provided, set it to now
    const finalData = {
      ...data,
      ...(data.published === true && data.publishedAt === undefined && { publishedAt: new Date() }),
    };
    return await prisma.blogPost.update({ where: { id }, data: finalData });
  } catch (error: any) {
    if (error.code === "P2002") throw new Error("Slug already exists");
    throw error;
  }
}

export async function deleteBlogPostAdmin(id: string) {
  return prisma.blogPost.delete({ where: { id } });
}
