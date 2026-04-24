import { PublicLayout } from "@/components/public/PublicLayout";
import Link from "next/link";

async function getBlogPostDetail(slug: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/v1/public/blog/${slug}`,
      { cache: "no-store" }
    );
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error("Failed to fetch blog post:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getBlogPostDetail(params.slug);
  return {
    title: post?.title || "Blog Post",
    description: post?.content?.substring(0, 160) || "Blog post details",
  };
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPostDetail(params.slug);

  if (!post) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Blog post not found</h1>
            <Link href="/blog" className="text-blue-600 hover:underline mt-4 inline-block">
              Back to Blog
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <Link href="/blog" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Blog
        </Link>

        {post.featuredImage && (
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-96 object-cover rounded-lg mb-8"
          />
        )}

        <article className="max-w-3xl">
          <div className="mb-6">
            <div className="flex gap-2 mb-4">
              <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded">
                {post.category}
              </span>
              {post.topic && (
                <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded">
                  {post.topic}
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

            <div className="flex items-center gap-6 text-sm text-gray-600 pb-6 border-b border-gray-200">
              <span>
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span>Reading time: ~{Math.ceil(post.content.split(" ").length / 200)} min</span>
              <span>👁 {post.viewCount} views</span>
            </div>
          </div>

          <div className="prose max-w-none mb-8">
            <div
              className="text-gray-700 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-bold mb-4">Share this article</h3>
            <div className="flex gap-4">
              <a href="#" className="text-blue-600 hover:underline">
                Share on Facebook
              </a>
              <a href="#" className="text-blue-400 hover:underline">
                Share on Twitter
              </a>
              <a href="#" className="text-blue-700 hover:underline">
                Share on LinkedIn
              </a>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/get-free-consultation"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700"
            >
              Get Free Consultation
            </Link>
          </div>
        </article>
      </div>
    </PublicLayout>
  );
}
