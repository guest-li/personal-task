import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// Helper functions for generating realistic data
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}

function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomIntake(): string {
  const intakes = ["Fall", "Spring", "Winter", "Summer"];
  return getRandomItem(intakes);
}

function getRandomDegree(): string {
  const degrees = ["Bachelor", "Master", "PhD", "Diploma"];
  return getRandomItem(degrees);
}

function getRandomLanguage(): string {
  const languages = ["English", "Chinese", "Bilingual"];
  return getRandomItem(languages);
}

function getRandomMajor(): string {
  const majors = [
    "Computer Science",
    "Business Administration",
    "Engineering",
    "Medicine",
    "Law",
    "Economics",
    "Psychology",
    "Environmental Science",
    "Data Science",
    "Artificial Intelligence",
    "Finance",
    "Marketing",
    "Nursing",
    "Architecture",
    "Chemistry",
    "Physics",
    "Biology",
    "Accounting",
    "International Relations",
    "Education",
  ];
  return getRandomItem(majors);
}

function getRandomProvince(): string {
  const provinces = [
    "Beijing",
    "Shanghai",
    "Jiangsu",
    "Zhejiang",
    "Guangdong",
    "Shandong",
    "Sichuan",
    "Liaoning",
    "Anhui",
    "Fujian",
    "Hubei",
    "Hunan",
    "Hebei",
    "Heilongjiang",
    "Jilin",
  ];
  return getRandomItem(provinces);
}

function getRandomCity(province: string): string {
  const cities: { [key: string]: string[] } = {
    Beijing: ["Beijing"],
    Shanghai: ["Shanghai"],
    Jiangsu: ["Nanjing", "Suzhou", "Wuxi"],
    Zhejiang: ["Hangzhou", "Ningbo", "Jiaxing"],
    Guangdong: ["Guangzhou", "Shenzhen", "Zhuhai"],
    Shandong: ["Jinan", "Qingdao", "Yantai"],
    Sichuan: ["Chengdu", "Mianyang"],
    Liaoning: ["Shenyang", "Dalian"],
    Anhui: ["Hefei", "Wuhu"],
    Fujian: ["Fuzhou", "Xiamen"],
    Hubei: ["Wuhan", "Yichang"],
    Hunan: ["Changsha", "Zhuzhou"],
    Hebei: ["Shijiazhuang", "Tangshan"],
    Heilongjiang: ["Harbin", "Daqing"],
    Jilin: ["Changchun", "Jilin"],
  };
  const provinceCities = cities[province] || ["Main City"];
  return getRandomItem(provinceCities);
}

function getRandomScholarshipType(): string {
  const types = [
    "Merit-based",
    "Need-based",
    "Full Tuition",
    "Partial Tuition",
    "Housing",
    "Stipend",
    "Research",
  ];
  return getRandomItem(types);
}

function getRandomBlogCategory(): string {
  const categories = ["News", "Guides", "Tips", "Student Stories", "Updates"];
  return getRandomItem(categories);
}

function getRandomBlogTopic(): string {
  const topics = [
    "Admission",
    "Visa",
    "Study Abroad",
    "University Life",
    "Scholarships",
    "Career",
    "Language",
    "Culture",
  ];
  return getRandomItem(topics);
}

// Data arrays
const universityNames = [
  "Tsinghua University",
  "Peking University",
  "Zhejiang University",
  "Fudan University",
  "Shanghai Jiao Tong University",
  "University of Science and Technology of China",
  "Nanjing University",
  "Wuhan University",
  "Xiamen University",
  "Harbin Institute of Technology",
  "Xi'an Jiaotong University",
  "Northwestern Polytechnical University",
  "Beijing University of Posts and Telecommunications",
  "Dalian University of Technology",
  "Beihang University",
  "Sun Yat-sen University",
  "Huazhong University of Science and Technology",
  "Shandong University",
  "Jilin University",
  "Tianjin University",
  "Chongqing University",
  "University of Electronic Science and Technology of China",
  "Tongji University",
  "Shanghai University",
  "East China Normal University",
  "Nankai University",
  "Sichuan University",
  "Nanjing University of Science and Technology",
  "Beijing Jiaotong University",
  "Nanjing Southeast University",
  "University of Shanghai for Science and Technology",
  "Jiangnan University",
  "Chang'an University",
  "Beijing Normal University",
  "East China University of Science and Technology",
  "China Agricultural University",
  "Beijing University of Chemical Technology",
  "Wuhan University of Technology",
  "Hefei University of Technology",
  "South China University of Technology",
  "Lanzhou University",
  "Zhengzhou University",
  "Xidian University",
  "Inner Mongolia University",
  "Ningxia University",
  "Ocean University of China",
  "Taiyuan University of Technology",
  "Hohai University",
  "Nanchang University",
  "University of Science and Technology Beijing",
  "Shijiazhuang Tiedao University",
  "Central China Normal University",
  "Central South University",
  "Huazhong Agricultural University",
  "Central South University of Forestry and Technology",
  "Wuhan University of Technology",
  "Yangtze University",
  "Southwest University",
  "Chongqing University of Posts and Telecommunications",
  "Kunming University of Science and Technology",
  "Yunnan University",
  "Guizhou University",
  "Xinjiang University",
  "Qinghai University",
  "Tibet University",
  "Ningxia Medical University",
  "Guangzhou University",
  "Shenzhen University",
  "Jinan University",
  "South China Agricultural University",
  "Guangxi University",
];

const courseNameAdjectives = [
  "Advanced",
  "Comprehensive",
  "Applied",
  "Theoretical",
  "Practical",
  "Modern",
  "Innovative",
  "International",
];

const blogTitles = [
  "Top Universities for Study Abroad in 2026",
  "Your Complete Guide to Visa Application Process",
  "How to Choose the Right University for You",
  "Scholarship Opportunities for International Students",
  "Life as an International Student: What to Expect",
  "Best Practices for Successful University Applications",
  "Understanding International Education Systems",
  "Career Pathways After International Studies",
  "COVID-19: Adapting to Distance Learning",
  "Campus Life at Leading Universities",
  "Preparing for English Proficiency Tests",
  "Financial Planning for Study Abroad",
  "Making the Most of Your Exchange Program",
  "Networking Tips for International Students",
  "Overcoming Culture Shock",
  "How to Write a Compelling Personal Statement",
  "Part-time Work Options for International Students",
  "Accommodation Guide for Students",
  "Health Insurance for International Students",
  "Post-graduation Visa Options",
];

const blogContent = [
  "Studying abroad is an incredible opportunity to expand your horizons and gain international experience. In this comprehensive guide, we explore the best practices, timing considerations, and strategic approaches to make your dream of studying at a world-class university a reality.",
  "The journey to studying internationally involves many steps and requires careful planning. From selecting universities to preparing documents, each phase is crucial. This article walks you through the essential processes and provides practical tips to ensure success.",
  "International education opens doors to amazing career opportunities and personal growth. Discover how thousands of students have successfully navigated the application process and are now thriving in their chosen fields of study.",
  "Scholarships can significantly reduce the financial burden of international education. Learn about various scholarship types, eligibility requirements, and application strategies that can help you secure funding for your studies.",
  "Living in a new country comes with unique challenges and exciting opportunities. From finding accommodation to building friendships, this guide covers everything you need to know to make your transition smooth.",
  "Your university application is your chance to stand out. Learn how to craft a compelling narrative that reflects your unique strengths and aspirations.",
  "Understanding the education systems in different countries is vital for making informed decisions. Compare curricula, teaching methods, and outcomes across various institutions.",
  "The skills you develop during your international studies are valuable in today's global job market. Learn how to leverage your education for career success.",
  "Distance learning has become an important part of modern education. Discover strategies to stay engaged and successful in your courses.",
  "Campus life is more than just attending classes. Explore the vibrant communities and opportunities available at leading universities worldwide.",
  "Language proficiency tests are often required for international study. Learn preparation strategies for IELTS, TOEFL, and other exams.",
  "Budgeting is essential for international students. Understand tuition costs, living expenses, and ways to manage your finances effectively.",
  "Exchange programs provide unique opportunities to study in different countries. Learn how to make the most of this experience.",
  "Building a professional network during your studies can benefit you throughout your career. Discover effective networking strategies.",
  "Cultural adjustment is a normal part of studying abroad. Learn coping strategies and ways to embrace your new environment.",
  "Your personal statement is a critical component of your application. Understand what universities are looking for and how to present your best self.",
  "Many universities allow international students to work part-time. Explore available opportunities and important regulations.",
  "Finding suitable accommodation is one of your first priorities. Learn about various housing options near universities.",
  "Health coverage is essential for international students. Understand what insurance you need and how to obtain it.",
  "After graduation, you may be able to extend your stay in the country. Learn about post-graduation visa options and career pathways.",
];

async function clearExistingData() {
  console.log("Clearing existing public data...");
  await prisma.blogPost.deleteMany({});
  await prisma.scholarship.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.university.deleteMany({});
  console.log("✓ Cleared existing data\n");
}

async function seedUniversities(): Promise<string[]> {
  console.log(`Creating ${universityNames.length} universities...`);

  const universities = await Promise.all(
    universityNames.map((name, index) => {
      const province = getRandomProvince();
      const city = getRandomCity(province);
      const worldRank = generateRandomNumber(1, 500);
      const studentCount = generateRandomNumber(10000, 100000);

      const tags = getRandomItems(
        [
          "top-10",
          "top-50",
          "research",
          "engineering",
          "business",
          "liberal-arts",
          "funded",
          "merit-based",
          "international",
          "accredited",
        ],
        generateRandomNumber(2, 5)
      );

      return prisma.university.create({
        data: {
          name,
          slug: generateSlug(`${name}-${index}`),
          logo: `https://via.placeholder.com/200x100?text=${encodeURIComponent(name.split(" ")[0])}`,
          banner: `https://via.placeholder.com/1200x300?text=${encodeURIComponent(name)}`,
          worldRank,
          location: city,
          studentCount,
          tags,
          intake: getRandomIntake(),
          deadline: new Date(2026, 6, 31), // July 31, 2026
          province,
        },
      });
    })
  );

  console.log(`✓ Created ${universities.length} universities\n`);
  return universities.map((u) => u.id);
}

async function seedCourses(universityIds: string[]) {
  console.log("Creating 500+ courses...");

  const coursesPerUniversity = Math.floor(500 / universityIds.length) + 1;
  let totalCourses = 0;

  const courseNames = [
    "Computer Science",
    "Software Engineering",
    "Data Science",
    "Artificial Intelligence",
    "Machine Learning",
    "Cybersecurity",
    "Business Administration",
    "Finance",
    "Marketing",
    "International Business",
    "Mechanical Engineering",
    "Electrical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Biomedical Engineering",
    "Medicine",
    "Nursing",
    "Public Health",
    "Psychology",
    "Economics",
  ];

  for (const universityId of universityIds) {
    const courses: Prisma.CourseCreateManyInput[] = [];
    const numCourses = generateRandomNumber(
      coursesPerUniversity - 2,
      coursesPerUniversity + 2
    );

    for (let i = 0; i < numCourses; i++) {
      const baseName = getRandomItem(courseNames);
      const adjective = getRandomItem(courseNameAdjectives);
      const courseName = `${adjective} ${baseName}`;
      const degree = getRandomDegree();
      const language = getRandomLanguage();
      const major = getRandomMajor();
      const province = getRandomProvince();
      const city = getRandomCity(province);

      const tuition = generateRandomNumber(5000, 50000) + Math.random();
      const accommodation = generateRandomNumber(2000, 15000) + Math.random();
      const serviceCharge = generateRandomNumber(500, 2000) + Math.random();
      const rating = parseFloat((generateRandomNumber(35, 50) / 10).toFixed(1));
      const popularity = generateRandomNumber(10, 500);

      const tags = getRandomItems(
        [
          "popular",
          "newly-offered",
          "high-demand",
          "scholarship-available",
          "english-taught",
          "industry-focused",
          "research-oriented",
          "practice-oriented",
        ],
        generateRandomNumber(2, 4)
      );

      courses.push({
        name: courseName,
        slug: generateSlug(`${courseName}-${degree}-${universityId.slice(0, 8)}`),
        degree,
        language,
        major,
        universityId,
        intake: getRandomIntake(),
        tuition: tuition.toString(),
        accommodation: accommodation.toString(),
        serviceCharge: serviceCharge.toString(),
        rating,
        popularity,
        tags,
        province,
        city,
      });
    }

    const created = await prisma.course.createMany({
      data: courses,
      skipDuplicates: true,
    });

    totalCourses += created.count;
  }

  console.log(`✓ Created ${totalCourses} courses\n`);
}

async function seedScholarships(universityIds: string[]) {
  console.log("Creating 700+ scholarships...");

  const scholarshipsPerUniversity = Math.floor(700 / universityIds.length) + 1;
  let totalScholarships = 0;

  const scholarshipNamePrefixes = [
    "Merit Excellence",
    "Global Leaders",
    "Future Innovators",
    "Academic Excellence",
    "International Achievement",
    "Diversity",
    "Talent Recognition",
    "Excellence Award",
    "Opportunity",
    "Scholar",
  ];

  for (const universityId of universityIds) {
    const scholarships: Prisma.ScholarshipCreateManyInput[] = [];
    const numScholarships = generateRandomNumber(
      scholarshipsPerUniversity - 3,
      scholarshipsPerUniversity + 3
    );

    for (let i = 0; i < numScholarships; i++) {
      const prefix = getRandomItem(scholarshipNamePrefixes);
      const degree = getRandomDegree();
      const major = getRandomMajor();
      const scholarshipName = `${prefix} ${degree} Scholarship - ${major}`;
      const scholarshipType = getRandomScholarshipType();
      const language = getRandomLanguage();
      const province = getRandomProvince();
      const city = getRandomCity(province);

      let tuition: number;
      let accommodation: number;

      // Vary funding based on scholarship type
      if (scholarshipType === "Full Tuition") {
        tuition = generateRandomNumber(15000, 50000) + Math.random();
        accommodation = generateRandomNumber(5000, 15000) + Math.random();
      } else if (scholarshipType === "Partial Tuition") {
        tuition = generateRandomNumber(5000, 25000) + Math.random();
        accommodation = generateRandomNumber(2000, 8000) + Math.random();
      } else {
        tuition = generateRandomNumber(2000, 15000) + Math.random();
        accommodation = generateRandomNumber(1000, 5000) + Math.random();
      }

      scholarships.push({
        name: scholarshipName,
        slug: generateSlug(
          `${scholarshipName}-${universityId.slice(0, 8)}`
        ),
        type: scholarshipType,
        degree,
        major,
        universityId,
        intake: getRandomIntake(),
        language,
        province,
        city,
        tuition: tuition.toString(),
        accommodation: accommodation.toString(),
      });
    }

    const created = await prisma.scholarship.createMany({
      data: scholarships,
      skipDuplicates: true,
    });

    totalScholarships += created.count;
  }

  console.log(`✓ Created ${totalScholarships} scholarships\n`);
}

async function seedBlogPosts() {
  console.log("Creating 20 blog posts...");

  const blogPosts: Prisma.BlogPostCreateInput[] = [];
  const now = new Date();

  for (let i = 0; i < blogTitles.length; i++) {
    const title = blogTitles[i];
    const category = getRandomBlogCategory();
    const topic = getRandomBlogTopic();
    const content = getRandomItem(blogContent);

    // Publish posts on different dates within the last 90 days
    const daysAgo = generateRandomNumber(1, 90);
    const publishedAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    blogPosts.push({
      title,
      slug: generateSlug(`${title}-${Date.now().toString().slice(-6)}`),
      content,
      featuredImage: `https://via.placeholder.com/800x400?text=${encodeURIComponent(title.slice(0, 30))}`,
      category,
      topic,
      viewCount: generateRandomNumber(50, 5000),
      published: true,
      publishedAt,
    });
  }

  const created = await prisma.blogPost.createMany({
    data: blogPosts,
    skipDuplicates: true,
  });

  console.log(`✓ Created ${created.count} blog posts\n`);
}

async function main() {
  const startTime = Date.now();
  console.log("\n========================================");
  console.log("   Database Seeding - Public Data");
  console.log("========================================\n");

  try {
    // Clear existing data first
    await clearExistingData();

    // Seed universities
    const universityIds = await seedUniversities();

    // Seed courses
    await seedCourses(universityIds);

    // Seed scholarships
    await seedScholarships(universityIds);

    // Seed blog posts
    await seedBlogPosts();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log("========================================");
    console.log("   ✓ Seeding Complete!");
    console.log("========================================");
    console.log(`Total time: ${duration}s`);
    console.log("\nData Summary:");
    console.log(`  • Universities: ${universityIds.length}`);
    console.log(`  • Courses: 500+`);
    console.log(`  • Scholarships: 700+`);
    console.log(`  • Blog Posts: 20`);
    console.log("\n");
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
