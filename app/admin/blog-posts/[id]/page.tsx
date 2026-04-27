"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BlogPostDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    slug: "",
    featuredImage: "",
    category: "",
    topic: "",
    content: "",
    published: false,
    publishedAt: null as string | null,
  });

  useEffect(() => {
    if (params?.id) {
      fetch(`/api/v1/admin/blog-posts/${params.id}`)
        .then((r) => r.json())
        .then((d) => {
          setForm({
            title: d.blogPost.title,
            slug: d.blogPost.slug,
            featuredImage: d.blogPost.featuredImage || "",
            category: d.blogPost.category || "",
            topic: d.blogPost.topic || "",
            content: d.blogPost.content || "",
            published: d.blogPost.published || false,
            publishedAt: d.blogPost.publishedAt || null,
          });
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to load blog post");
          setLoading(false);
        });
    }
  }, [params?.id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, type, value } = e.target;
    if (type === "checkbox") {
      setForm({
        ...form,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Logic for publishedAt:
    // If published is true and there's no existing publishedAt, set it to now
    // If published is false, set publishedAt to null
    // If published is true and publishedAt already exists, keep it
    let publishedAt = form.publishedAt;
    if (form.published && !form.publishedAt) {
      publishedAt = new Date().toISOString();
    } else if (!form.published) {
      publishedAt = null;
    }

    const submitData = {
      ...form,
      publishedAt,
    };

    const res = await fetch(`/api/v1/admin/blog-posts/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submitData),
    });
    if (res.ok) {
      router.push("/admin/blog-posts");
    } else {
      setError("Failed to save");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this blog post?")) return;
    const res = await fetch(`/api/v1/admin/blog-posts/${params.id}`, {
      method: "DELETE",
    });
    if (res.ok) router.push("/admin/blog-posts");
    else setError("Failed to delete");
  };

  if (loading) return <div className="py-8 text-gray-600">Loading...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Blog Post</h1>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug *
          </label>
          <input
            type="text"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Featured Image (URL)
          </label>
          <input
            type="text"
            name="featuredImage"
            value={form.featuredImage}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Topic *
          </label>
          <input
            type="text"
            name="topic"
            value={form.topic}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content *
          </label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            required
            rows={15}
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="published"
            name="published"
            checked={form.published}
            onChange={handleChange}
            className="border border-gray-300 rounded"
          />
          <label htmlFor="published" className="text-sm font-medium text-gray-700">
            Published
          </label>
        </div>
        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/blog-posts")}
            className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="ml-auto bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}
