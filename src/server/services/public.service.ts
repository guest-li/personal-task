import { prisma } from "@/server/db";

// ==================== University Query Functions ====================

export async function listUniversities(
  page: number,
  limit: number,
  filters: any,
) {
  const where: any = {};
  if (filters.province) where.province = filters.province;
  if (filters.tags && filters.tags.length > 0) {
    where.tags = { hasSome: filters.tags };
  }
  if (filters.search) {
    where.name = { contains: filters.search, mode: "insensitive" };
  }

  const [universities, total] = await Promise.all([
    prisma.university.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.university.count({ where }),
  ]);

  return {
    universities,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getUniversityDetail(id: string) {
  return prisma.university.findUnique({ where: { id } });
}

// ==================== Course Query Functions ====================

export async function listCourses(
  page: number,
  limit: number,
  filters: any,
) {
  const where: any = {};
  if (filters.degree) where.degree = filters.degree;
  if (filters.language) where.language = filters.language;
  if (filters.major)
    where.major = { contains: filters.major, mode: "insensitive" };
  if (filters.universityId) where.universityId = filters.universityId;
  if (filters.intake) where.intake = filters.intake;
  if (filters.province) where.province = filters.province;
  if (filters.city) where.city = filters.city;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { major: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      include: { university: { select: { id: true, name: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.course.count({ where }),
  ]);

  return {
    courses,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getCourseDetail(id: string) {
  return prisma.course.findUnique({
    where: { id },
    include: { university: true },
  });
}

export async function getCourseBySlug(slug: string) {
  return prisma.course.findUnique({
    where: { slug },
    include: { university: true },
  });
}

// ==================== Scholarship Query Functions ====================

export async function listScholarships(
  page: number,
  limit: number,
  filters: any,
) {
  const where: any = {};
  if (filters.type) where.type = filters.type;
  if (filters.degree) where.degree = filters.degree;
  if (filters.language) where.language = filters.language;
  if (filters.major)
    where.major = { contains: filters.major, mode: "insensitive" };
  if (filters.province) where.province = filters.province;
  if (filters.city) where.city = filters.city;
  if (filters.search)
    where.name = { contains: filters.search, mode: "insensitive" };

  const [scholarships, total] = await Promise.all([
    prisma.scholarship.findMany({
      where,
      include: { university: { select: { id: true, name: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.scholarship.count({ where }),
  ]);

  return {
    scholarships,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// ==================== Blog Post Query Functions ====================

export async function listBlogPosts(
  page: number,
  limit: number,
  filters: any,
) {
  const where: any = { published: true };
  if (filters.category) where.category = filters.category;
  if (filters.topic) where.topic = filters.topic;
  if (filters.search)
    where.title = { contains: filters.search, mode: "insensitive" };

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy:
        filters.sort === "likes" ? { viewCount: "desc" } : { publishedAt: "desc" },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return {
    posts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getBlogBySlug(slug: string) {
  return prisma.blogPost.findUnique({ where: { slug } });
}
