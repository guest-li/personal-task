"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ApplicationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/v1/admin/applications/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        setApp(d.application);
        setAdminNote(d.application.adminNote || "");
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load application");
        setLoading(false);
      });
  }, [params.id]);

  const handleApprove = async () => {
    setSaving(true);
    const res = await fetch(`/api/v1/admin/applications/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved", adminNote }),
    });
    if (res.ok) {
      alert("Approved! Notification sent to student.");
      router.push("/admin/applications");
    } else {
      setError("Failed to approve");
    }
    setSaving(false);
  };

  const handleReject = async () => {
    if (!confirm("Reject this application?")) return;
    setSaving(true);
    const res = await fetch(`/api/v1/admin/applications/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "rejected", adminNote }),
    });
    if (res.ok) {
      alert("Rejected! Notification sent to student.");
      router.push("/admin/applications");
    } else {
      setError("Failed to reject");
    }
    setSaving(false);
  };

  if (loading) return <div className="py-8 text-gray-600">Loading...</div>;
  if (!app)
    return (
      <div className="py-8 text-red-600">Application not found</div>
    );

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Application Review
      </h1>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Application Code
            </label>
            <p className="mt-1 font-mono text-sm">{app.applicationCode}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Status
            </label>
            <p className="mt-1 text-lg font-semibold capitalize">{app.status}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Student Name
            </label>
            <p className="mt-1">{app.user.name}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Email
            </label>
            <p className="mt-1">{app.user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Program
            </label>
            <p className="mt-1">{app.programName}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              University
            </label>
            <p className="mt-1">{app.universityName}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Application Fee
            </label>
            <p className="mt-1">${Number(app.applicationFee).toFixed(2)}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Paid
            </label>
            <p className="mt-1">${Number(app.applicationFeePaid).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Admin Note
        </label>
        <textarea
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded px-4 py-2"
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleApprove}
          disabled={saving}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          Approve
        </button>
        <button
          onClick={handleReject}
          disabled={saving}
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
        >
          Reject
        </button>
        <button
          onClick={() => router.push("/admin/applications")}
          className="border border-gray-300 px-6 py-2 rounded hover:bg-gray-50"
        >
          Back
        </button>
      </div>
    </div>
  );
}
