"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UniversityDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    logo: "",
    banner: "",
    worldRank: "",
    location: "",
    studentCount: "",
    tags: "",
    intake: "",
    province: "",
  });

  useEffect(() => {
    if (params?.id) {
      fetch(`/api/v1/admin/universities/${params.id}`)
        .then((r) => r.json())
        .then((d) => {
          setForm({
            name: d.university.name,
            slug: d.university.slug,
            logo: d.university.logo || "",
            banner: d.university.banner || "",
            worldRank: d.university.worldRank ? String(d.university.worldRank) : "",
            location: d.university.location || "",
            studentCount: d.university.studentCount ? String(d.university.studentCount) : "",
            tags: d.university.tags ? (Array.isArray(d.university.tags) ? d.university.tags.join(", ") : d.university.tags) : "",
            intake: d.university.intake || "",
            province: d.university.province || "",
          });
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to load university");
          setLoading(false);
        });
    }
  }, [params?.id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const submitData = {
      ...form,
      worldRank: form.worldRank ? parseInt(form.worldRank, 10) : null,
      studentCount: form.studentCount ? parseInt(form.studentCount, 10) : null,
      tags: form.tags
        ? form.tags.split(",").map(t => t.trim()).filter(t => t)
        : [],
    };

    const res = await fetch(`/api/v1/admin/universities/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submitData),
    });
    if (res.ok) {
      router.push("/admin/universities");
    } else {
      setError("Failed to save");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this university?")) return;
    const res = await fetch(`/api/v1/admin/universities/${params.id}`, {
      method: "DELETE",
    });
    if (res.ok) router.push("/admin/universities");
    else setError("Failed to delete");
  };

  if (loading) return <div className="py-8 text-gray-600">Loading...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit University</h1>
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
            Name *
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
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
            Logo (URL)
          </label>
          <input
            type="text"
            name="logo"
            value={form.logo}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Banner (URL)
          </label>
          <input
            type="text"
            name="banner"
            value={form.banner}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            World Rank
          </label>
          <input
            type="number"
            name="worldRank"
            value={form.worldRank}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Student Count
          </label>
          <input
            type="number"
            name="studentCount"
            value={form.studentCount}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="e.g., research, engineering, global"
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Intake
          </label>
          <input
            type="text"
            name="intake"
            value={form.intake}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Province
          </label>
          <input
            type="text"
            name="province"
            value={form.province}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
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
            onClick={() => router.push("/admin/universities")}
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
