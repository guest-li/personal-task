"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    country: "",
    role: "",
    status: "",
  });

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch(`/api/v1/admin/users/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setFormData({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          gender: data.user.gender || "",
          country: data.user.country || "",
          role: data.user.role || "",
          status: data.user.status || "",
        });
      } else {
        setError("Failed to load user");
      }
      setLoading(false);
    }
    fetchUser();
  }, [params.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch(`/api/v1/admin/users/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert("User updated successfully");
      router.push("/admin/users");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to save user");
    }
    setSaving(false);
  };

  const handleDeactivate = async () => {
    if (!confirm("Are you sure? This will suspend the user.")) return;

    const res = await fetch(`/api/v1/admin/users/${params.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      alert("User suspended");
      router.push("/admin/users");
    } else {
      setError("Failed to deactivate user");
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!user) return <div className="text-center py-8 text-red-600">User not found</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Edit User</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="bg-white rounded-lg shadow p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full border border-gray-300 rounded px-4 py-2 bg-gray-100 text-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country
          </label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
          >
            <option value="student">Student</option>
            <option value="counselor">Counselor</option>
            <option value="admin">Admin</option>
            <option value="partner">Partner</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/users")}
            className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeactivate}
            className="ml-auto bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Deactivate
          </button>
        </div>
      </form>
    </div>
  );
}
