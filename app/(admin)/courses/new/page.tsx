"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CourseCreatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    degree: "",
    language: "",
    major: "",
    universityId: "",
    intake: "",
    tuition: "",
    accommodation: "",
    serviceCharge: "",
    rating: "",
    tags: "",
    province: "",
    city: "",
  });

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
      tuition: form.tuition ? parseFloat(form.tuition) : null,
      accommodation: form.accommodation ? parseFloat(form.accommodation) : null,
      serviceCharge: form.serviceCharge ? parseFloat(form.serviceCharge) : null,
      rating: form.rating ? parseFloat(form.rating) : null,
      tags: form.tags
        ? form.tags.split(",").map(t => t.trim()).filter(t => t)
        : [],
    };

    const res = await fetch("/api/v1/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submitData),
    });
    if (res.ok) {
      router.push("/admin/courses");
    } else {
      setError("Failed to save");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Course</h1>
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
            Degree *
          </label>
          <select
            name="degree"
            value={form.degree}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 px-3 py-2 rounded"
          >
            <option value="">Select a degree</option>
            <option value="Bachelor">Bachelor</option>
            <option value="Master">Master</option>
            <option value="PhD">PhD</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Language *
          </label>
          <select
            name="language"
            value={form.language}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 px-3 py-2 rounded"
          >
            <option value="">Select a language</option>
            <option value="English">English</option>
            <option value="Chinese">Chinese</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Major *
          </label>
          <input
            type="text"
            name="major"
            value={form.major}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            University ID *
          </label>
          <input
            type="text"
            name="universityId"
            value={form.universityId}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Intake *
          </label>
          <input
            type="text"
            name="intake"
            value={form.intake}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tuition *
          </label>
          <input
            type="number"
            name="tuition"
            value={form.tuition}
            onChange={handleChange}
            step="0.01"
            required
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Accommodation *
          </label>
          <input
            type="number"
            name="accommodation"
            value={form.accommodation}
            onChange={handleChange}
            step="0.01"
            required
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Charge *
          </label>
          <input
            type="number"
            name="serviceCharge"
            value={form.serviceCharge}
            onChange={handleChange}
            step="0.01"
            required
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rating
          </label>
          <input
            type="number"
            name="rating"
            value={form.rating}
            onChange={handleChange}
            step="0.01"
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
            placeholder="e.g., popular, new, scholarship"
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            name="city"
            value={form.city}
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
            Create
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/courses")}
            className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
