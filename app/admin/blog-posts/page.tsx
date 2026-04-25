"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function BlogPostsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; published?: string };
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [deleting, setDeleting] = useState<string | null>(null);

  const page = parseInt(searchParams.page || "1", 10);
  const search = searchParams.search || "";
  const published = searchParams.published || "";

  useEffect(() => {
    fetchBlogPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, published]);

  const fetchBlogPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      if (search) params.append("search", search);
      if (published) params.append("published", published);

      const response = await fetch(`/api/v1/admin/blog-posts?${params}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to load blog posts");
      }

      const data = await response.json();
      setBlogPosts(data.blogPosts || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError("Failed to load blog posts. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This action cannot be undone.`)) return;

    setDeleting(id);
    try {
      const response = await fetch(`/api/v1/admin/blog-posts/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBlogPosts(blogPosts.filter((p) => p.id !== id));
      } else {
        alert("Failed to delete blog post. Please try again.");
      }
    } catch (err) {
      alert("Error deleting blog post. Please try again.");
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFilterUrl = (filter: string) => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (filter) params.append("published", filter);
    return `?${params.toString()}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
        <Link
          href="/admin/blog-posts/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Blog Post
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col gap-4">
          {/* Status Filter Buttons */}
          <div className="flex gap-2">
            <Link
              href={getFilterUrl("")}
              className={`px-4 py-2 rounded ${
                !published
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              All
            </Link>
            <Link
              href={getFilterUrl("true")}
              className={`px-4 py-2 rounded ${
                published === "true"
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Published
            </Link>
            <Link
              href={getFilterUrl("false")}
              className={`px-4 py-2 rounded ${
                published === "false"
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Draft
            </Link>
          </div>

          {/* Search Form */}
          <form method="get" className="flex gap-4">
            <input
              type="text"
              name="search"
              placeholder="Search by title"
              defaultValue={search}
              className="border border-gray-300 rounded px-3 py-2 flex-1"
            />
            {published && <input type="hidden" name="published" value={published} />}
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-blue-800">
          Loading blog posts...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
          {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-gray-900">
                  Title
                </th>
                <th className="text-left px-6 py-3 font-semibold text-gray-900">
                  Category
                </th>
                <th className="text-left px-6 py-3 font-semibold text-gray-900">
                  Topic
                </th>
                <th className="text-left px-6 py-3 font-semibold text-gray-900">
                  Status
                </th>
                <th className="text-left px-6 py-3 font-semibold text-gray-900">
                  Date
                </th>
                <th className="text-left px-6 py-3 font-semibold text-gray-900">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {blogPosts.map((post: any) => (
                <tr key={post.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-900">{post.title}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {post.category}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {post.topic}
                  </td>
                  <td className="px-6 py-3 text-sm">
                    {post.published ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Published
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {post.published ? formatDate(post.publishedAt) : "Draft"}
                  </td>
                  <td className="px-6 py-3 flex gap-2">
                    <Link
                      href={`/admin/blog-posts/${post.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id, post.title)}
                      disabled={deleting === post.id}
                      className="text-red-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {deleting === post.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {blogPosts.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              No blog posts found.
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            {pagination.page > 1 && (
              <Link
                href={`?page=${pagination.page - 1}${search ? `&search=${search}` : ""}${published ? `&published=${published}` : ""}`}
                className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
              >
                Previous
              </Link>
            )}
            {pagination.page < pagination.totalPages && (
              <Link
                href={`?page=${pagination.page + 1}${search ? `&search=${search}` : ""}${published ? `&published=${published}` : ""}`}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
