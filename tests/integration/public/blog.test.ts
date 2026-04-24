import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as GET_LIST } from "@/app/api/v1/public/blog/route";
import { GET as GET_DETAIL } from "@/app/api/v1/public/blog/[slug]/route";
import { cleanDatabase, testPrisma } from "../../helpers/db";

function makePublicRequest(
  method: "GET" = "GET",
  url: string,
) {
  return new NextRequest(url, { method });
}

describe("Public Blog API", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe("GET /api/v1/public/blog", () => {
    it("should return empty list when no published posts exist", async () => {
      // Create an unpublished post
      await testPrisma.blogPost.create({
        data: {
          title: "Draft Post",
          slug: "draft-post",
          content: "This is unpublished",
          category: "News",
          topic: "General",
          published: false,
        },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/blog");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.posts)).toBe(true);
      expect(body.posts.length).toBe(0);
      expect(body.pagination.total).toBe(0);
    });

    it("should only return published posts", async () => {
      await testPrisma.blogPost.create({
        data: {
          title: "Published Post 1",
          slug: "published-1",
          content: "Published content",
          category: "News",
          topic: "General",
          published: true,
          publishedAt: new Date(),
        },
      });
      await testPrisma.blogPost.create({
        data: {
          title: "Draft Post",
          slug: "draft",
          content: "Draft content",
          category: "News",
          topic: "General",
          published: false,
        },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/blog");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.posts.length).toBe(1);
      expect(body.posts[0].title).toBe("Published Post 1");
    });

    it("should list blog posts with default pagination", async () => {
      for (let i = 0; i < 15; i++) {
        await testPrisma.blogPost.create({
          data: {
            title: `Blog Post ${i}`,
            slug: `blog-post-${i}`,
            content: `Content ${i}`,
            category: "News",
            topic: "General",
            published: true,
            publishedAt: new Date(),
          },
        });
      }

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/blog");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.posts)).toBe(true);
      expect(body.posts.length).toBeLessThanOrEqual(10);
      expect(body.pagination.total).toBe(15);
      expect(body.pagination.totalPages).toBe(2);
    });

    it("should respect custom pagination parameters", async () => {
      for (let i = 0; i < 25; i++) {
        await testPrisma.blogPost.create({
          data: {
            title: `Post ${i}`,
            slug: `post-${i}`,
            content: `Content ${i}`,
            category: "News",
            topic: "General",
            published: true,
            publishedAt: new Date(),
          },
        });
      }

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/blog?page=2&limit=8");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.posts.length).toBeLessThanOrEqual(8);
      expect(body.pagination.page).toBe(2);
      expect(body.pagination.limit).toBe(8);
      expect(body.pagination.total).toBe(25);
    });

    it("should filter by category", async () => {
      await testPrisma.blogPost.create({
        data: {
          title: "News Post",
          slug: "news-post",
          content: "News content",
          category: "News",
          topic: "General",
          published: true,
          publishedAt: new Date(),
        },
      });
      await testPrisma.blogPost.create({
        data: {
          title: "Guide Post",
          slug: "guide-post",
          content: "Guide content",
          category: "Guide",
          topic: "Tips",
          published: true,
          publishedAt: new Date(),
        },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/blog?category=News");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.posts.length).toBe(1);
      expect(body.posts[0].category).toBe("News");
    });

    it("should filter by topic", async () => {
      await testPrisma.blogPost.create({
        data: {
          title: "Visa Topic Post",
          slug: "visa-post",
          content: "Visa content",
          category: "Guide",
          topic: "Visa",
          published: true,
          publishedAt: new Date(),
        },
      });
      await testPrisma.blogPost.create({
        data: {
          title: "University Topic Post",
          slug: "university-post",
          content: "University content",
          category: "Guide",
          topic: "University",
          published: true,
          publishedAt: new Date(),
        },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/blog?topic=Visa");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.posts.length).toBe(1);
      expect(body.posts[0].topic).toBe("Visa");
    });

    it("should search by title", async () => {
      await testPrisma.blogPost.create({
        data: {
          title: "Complete Guide to Beijing Universities",
          slug: "beijing-guide",
          content: "Content about Beijing",
          category: "Guide",
          topic: "Universities",
          published: true,
          publishedAt: new Date(),
        },
      });
      await testPrisma.blogPost.create({
        data: {
          title: "Shanghai Tips",
          slug: "shanghai-tips",
          content: "Tips for Shanghai",
          category: "Tips",
          topic: "General",
          published: true,
          publishedAt: new Date(),
        },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/blog?search=Beijing");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.posts.length).toBe(1);
      expect(body.posts[0].title).toContain("Beijing");
    });

    it("should search case-insensitively", async () => {
      await testPrisma.blogPost.create({
        data: {
          title: "Important Announcement",
          slug: "important",
          content: "Important content",
          category: "News",
          topic: "General",
          published: true,
          publishedAt: new Date(),
        },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/blog?search=important");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.posts.length).toBe(1);
      expect(body.posts[0].title.toLowerCase()).toContain("important");
    });

    it("should sort by latest by default", async () => {
      const post1 = await testPrisma.blogPost.create({
        data: {
          title: "Older Post",
          slug: "older",
          content: "Content",
          category: "News",
          topic: "General",
          published: true,
          publishedAt: new Date("2024-01-01"),
        },
      });
      const post2 = await testPrisma.blogPost.create({
        data: {
          title: "Newer Post",
          slug: "newer",
          content: "Content",
          category: "News",
          topic: "General",
          published: true,
          publishedAt: new Date("2024-12-31"),
        },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/blog");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.posts[0].slug).toBe("newer");
      expect(body.posts[1].slug).toBe("older");
    });

    it("should sort by viewCount (likes) when specified", async () => {
      await testPrisma.blogPost.create({
        data: {
          title: "Low Views Post",
          slug: "low-views",
          content: "Content",
          category: "News",
          topic: "General",
          viewCount: 10,
          published: true,
          publishedAt: new Date(),
        },
      });
      await testPrisma.blogPost.create({
        data: {
          title: "High Views Post",
          slug: "high-views",
          content: "Content",
          category: "News",
          topic: "General",
          viewCount: 100,
          published: true,
          publishedAt: new Date(),
        },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/blog?sort=likes");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.posts[0].viewCount).toBeGreaterThanOrEqual(body.posts[1].viewCount);
    });

    it("should combine multiple filters", async () => {
      await testPrisma.blogPost.create({
        data: {
          title: "News Visa Guide",
          slug: "news-visa",
          content: "Visa news",
          category: "News",
          topic: "Visa",
          published: true,
          publishedAt: new Date(),
        },
      });
      await testPrisma.blogPost.create({
        data: {
          title: "Tips Visa Guide",
          slug: "tips-visa",
          content: "Visa tips",
          category: "Tips",
          topic: "Visa",
          published: true,
          publishedAt: new Date(),
        },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/blog?category=News&topic=Visa");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.posts.length).toBe(1);
      expect(body.posts[0].category).toBe("News");
      expect(body.posts[0].topic).toBe("Visa");
    });

    it("should return empty result when no matches found", async () => {
      await testPrisma.blogPost.create({
        data: {
          title: "Existing Post",
          slug: "existing",
          content: "Content",
          category: "News",
          topic: "General",
          published: true,
          publishedAt: new Date(),
        },
      });

      const req = makePublicRequest("GET", "http://localhost/api/v1/public/blog?search=NonExistent");
      const res = await GET_LIST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.posts.length).toBe(0);
      expect(body.pagination.total).toBe(0);
    });
  });

  describe("GET /api/v1/public/blog/:slug", () => {
    it("should return blog post detail", async () => {
      const post = await testPrisma.blogPost.create({
        data: {
          title: "Detailed Blog Post",
          slug: "detailed-blog",
          content: "This is detailed content about the blog",
          category: "Guide",
          topic: "University",
          published: true,
          publishedAt: new Date(),
          viewCount: 5,
          featuredImage: "https://example.com/image.jpg",
        },
      });

      const req = makePublicRequest("GET", `http://localhost/api/v1/public/blog/${post.slug}`);
      const res = await GET_DETAIL(req, { params: { slug: post.slug } });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.post).toBeDefined();
      expect(body.post.slug).toBe("detailed-blog");
      expect(body.post.title).toBe("Detailed Blog Post");
      expect(body.post.content).toContain("detailed content");
    });

    it("should increment viewCount on each fetch", async () => {
      const post = await testPrisma.blogPost.create({
        data: {
          title: "View Counter Post",
          slug: "view-counter",
          content: "Content",
          category: "News",
          topic: "General",
          published: true,
          publishedAt: new Date(),
          viewCount: 0,
        },
      });

      const req1 = makePublicRequest("GET", `http://localhost/api/v1/public/blog/${post.slug}`);
      const res1 = await GET_DETAIL(req1, { params: { slug: post.slug } });
      const body1 = await res1.json();
      expect(body1.post.viewCount).toBe(0); // Returns old value before increment

      const req2 = makePublicRequest("GET", `http://localhost/api/v1/public/blog/${post.slug}`);
      const res2 = await GET_DETAIL(req2, { params: { slug: post.slug } });
      const body2 = await res2.json();
      expect(body2.post.viewCount).toBe(1); // Returns old value, but database has 2 now
    });

    it("should return 404 for non-existent post", async () => {
      const req = makePublicRequest("GET", "http://localhost/api/v1/public/blog/non-existent");
      const res = await GET_DETAIL(req, { params: { slug: "non-existent" } });
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    it("should include all post fields", async () => {
      const post = await testPrisma.blogPost.create({
        data: {
          title: "Full Detail Post",
          slug: "full-detail",
          content: "This is the full content of the blog post with all details",
          featuredImage: "https://example.com/featured.jpg",
          category: "Guide",
          topic: "Visa",
          viewCount: 42,
          published: true,
          publishedAt: new Date("2024-06-15"),
        },
      });

      const req = makePublicRequest("GET", `http://localhost/api/v1/public/blog/${post.slug}`);
      const res = await GET_DETAIL(req, { params: { slug: post.slug } });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.post.slug).toBe("full-detail");
      expect(body.post.featuredImage).toBe("https://example.com/featured.jpg");
      expect(body.post.category).toBe("Guide");
      expect(body.post.topic).toBe("Visa");
      expect(body.post.published).toBe(true);
    });
  });
});
