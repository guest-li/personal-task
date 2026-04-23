"use client";
import { useState } from "react";

export default function NotificationsPage() {
  const [form, setForm] = useState({
    title: "",
    message: "",
    targetRole: "",
    targetUserIds: [] as string[],
  });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "targetRole") {
      setForm({ ...form, targetRole: value });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/v1/admin/notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        message: form.message,
        targetRole: form.targetRole || undefined,
      }),
    });

    if (res.ok) {
      setSuccess("Notification sent successfully!");
      setForm({ title: "", message: "", targetRole: "", targetUserIds: [] });
    } else {
      setError("Failed to send notification");
    }
    setSending(false);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Send Notification
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow p-6 space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Notification title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            rows={4}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Notification message"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Target Audience
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="targetRole"
                value=""
                onChange={handleChange}
                checked={form.targetRole === ""}
                className="mr-2"
              />
              <span>Send to All Users</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="targetRole"
                value="student"
                onChange={handleChange}
                checked={form.targetRole === "student"}
                className="mr-2"
              />
              <span>Students Only</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="targetRole"
                value="partner"
                onChange={handleChange}
                checked={form.targetRole === "partner"}
                className="mr-2"
              />
              <span>Partners Only</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="targetRole"
                value="admin"
                onChange={handleChange}
                checked={form.targetRole === "admin"}
                className="mr-2"
              />
              <span>Admins Only</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={sending}
          className="w-full bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 font-medium"
        >
          {sending ? "Sending..." : "Send Notification"}
        </button>
      </form>
    </div>
  );
}
