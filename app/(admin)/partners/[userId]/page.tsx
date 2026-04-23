"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PartnerReviewPage({
  params,
}: {
  params: { userId: string };
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/v1/admin/users/${params.userId}`)
      .then((r) => r.json())
      .then((d) => {
        setUser(d.user);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load user");
        setLoading(false);
      });
  }, [params.userId]);

  const handleApprove = async () => {
    setSaving(true);
    const res = await fetch(
      `/api/v1/admin/partners/applications/${params.userId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true }),
      }
    );
    if (res.ok) {
      alert("Partner approved!");
      router.push("/admin/partners");
    } else {
      setError("Failed to approve");
    }
    setSaving(false);
  };

  const handleReject = async () => {
    if (!confirm("Reject this application?")) return;
    setSaving(true);
    const res = await fetch(
      `/api/v1/admin/partners/applications/${params.userId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: false }),
      }
    );
    if (res.ok) {
      alert("Partner rejected");
      router.push("/admin/partners");
    } else {
      setError("Failed to reject");
    }
    setSaving(false);
  };

  if (loading)
    return <div className="py-8 text-gray-600">Loading...</div>;
  if (!user)
    return (
      <div className="py-8 text-red-600">User not found</div>
    );

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Review Partner Application
      </h1>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      <div className="bg-white rounded-lg shadow p-6 space-y-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700">
            Name
          </label>
          <p className="mt-1">{user.name}</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">
            Email
          </label>
          <p className="mt-1">{user.email}</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">
            Status
          </label>
          <p className="mt-1 capitalize">{user.status}</p>
        </div>
        {user.partnerProfile && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Experience
              </label>
              <p className="mt-1">{user.partnerProfile.experience || "—"}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Bio
              </label>
              <p className="mt-1">{user.partnerProfile.bio || "—"}</p>
            </div>
          </>
        )}
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
          onClick={() => router.push("/admin/partners")}
          className="border border-gray-300 px-6 py-2 rounded hover:bg-gray-50"
        >
          Back
        </button>
      </div>
    </div>
  );
}
