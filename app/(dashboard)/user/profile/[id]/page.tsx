"use client";

import { useEffect, useState } from "react";
import FileUpload from "@/components/forms/FileUpload";
import PasswordInput from "@/components/forms/PasswordInput";

interface ProfileData {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  gender: string | null;
  country: string | null;
  avatar: string | null;
  studentProfile: {
    bio: string | null;
    passportNid: string | null;
    qualification: string | null;
    interestedMajor: string | null;
    lastAcademicResult: string | null;
    experience: string | null;
    language: string | null;
    address: string | null;
  } | null;
}

interface Certificate {
  id: string;
  name: string;
  fileUrl: string;
}

export default function EditProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordErr, setPasswordErr] = useState("");

  useEffect(() => {
    fetch("/api/v1/users/me")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data.user);
        setCertificates(data.user.certificates ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      phone: form.get("phone") || undefined,
      gender: form.get("gender") || undefined,
      country: form.get("country") || undefined,
      bio: form.get("bio") || undefined,
      passportNid: form.get("passportNid") || undefined,
      qualification: form.get("qualification") || undefined,
      interestedMajor: form.get("interestedMajor") || undefined,
      lastAcademicResult: form.get("lastAcademicResult") || undefined,
      experience: form.get("experience") || undefined,
      language: form.get("language") || undefined,
      address: form.get("address") || undefined,
    };

    try {
      const res = await fetch("/api/v1/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Update failed");
        return;
      }
      const data = await res.json();
      setProfile(data.user);
      setMessage("Profile updated successfully");
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/v1/users/avatar", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      setProfile((prev) => prev ? { ...prev, avatar: data.avatar } : prev);
    }
  }

  async function handleCertUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/v1/users/certificates", { method: "POST", body: form });
    if (res.ok) {
      const data = await res.json();
      setCertificates((prev) => [...prev, data.certificate]);
      (e.target as HTMLFormElement).reset();
    }
  }

  async function handleDeleteCert(id: string) {
    if (!confirm("Delete this certificate?")) return;
    const res = await fetch(`/api/v1/users/certificates/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCertificates((prev) => prev.filter((c) => c.id !== id));
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordMsg("");
    setPasswordErr("");

    const form = new FormData(e.currentTarget);
    const body = {
      currentPassword: form.get("currentPassword"),
      newPassword: form.get("newPassword"),
      confirmPassword: form.get("confirmPassword"),
    };

    try {
      const res = await fetch("/api/v1/users/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        setPasswordErr(data.error ?? "Password change failed");
        return;
      }
      setPasswordMsg("Password changed successfully");
      (e.target as HTMLFormElement).reset();
    } catch {
      setPasswordErr("Network error");
    }
  }

  if (loading) return <div className="text-gray-500">Loading profile...</div>;
  if (!profile) return <div className="text-red-500">Failed to load profile</div>;

  const sp = profile.studentProfile;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Personal Information</h2>

        <div className="mb-6">
          <FileUpload
            onUpload={handleAvatarUpload}
            accept="image/jpeg,image/png,image/webp"
            maxSizeMB={5}
            preview={profile.avatar}
            label="Profile Photo"
          />
        </div>

        {message && <div className="mb-4 rounded bg-green-50 p-3 text-sm text-green-700">{message}</div>}
        {error && <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleProfileSubmit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input id="name" name="name" type="text" required defaultValue={profile.name}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input id="email" type="email" disabled value={profile.email}
              className="mt-1 block w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-gray-500" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Mobile</label>
            <input id="phone" name="phone" type="tel" defaultValue={profile.phone ?? ""}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
            <select id="gender" name="gender" defaultValue={profile.gender ?? ""}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="passportNid" className="block text-sm font-medium text-gray-700">Passport/NID</label>
            <input id="passportNid" name="passportNid" type="text" defaultValue={sp?.passportNid ?? ""}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="qualification" className="block text-sm font-medium text-gray-700">Qualification</label>
            <select id="qualification" name="qualification" defaultValue={sp?.qualification ?? ""}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none">
              <option value="">Select</option>
              <option value="high_school">High School</option>
              <option value="bachelor">Bachelor</option>
              <option value="master">Master</option>
            </select>
          </div>
          <div>
            <label htmlFor="interestedMajor" className="block text-sm font-medium text-gray-700">Interested Major</label>
            <input id="interestedMajor" name="interestedMajor" type="text" defaultValue={sp?.interestedMajor ?? ""}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="lastAcademicResult" className="block text-sm font-medium text-gray-700">Last Academic Result</label>
            <input id="lastAcademicResult" name="lastAcademicResult" type="text" defaultValue={sp?.lastAcademicResult ?? ""}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="experience" className="block text-sm font-medium text-gray-700">Experience</label>
            <input id="experience" name="experience" type="text" defaultValue={sp?.experience ?? ""}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700">Language</label>
            <input id="language" name="language" type="text" defaultValue={sp?.language ?? ""}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
            <input id="address" name="address" type="text" defaultValue={sp?.address ?? ""}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">About / Details</label>
            <textarea id="bio" name="bio" rows={4} defaultValue={sp?.bio ?? ""}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
          </div>

          <div className="sm:col-span-2">
            <button type="submit" disabled={saving}
              className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Certificates</h2>

        {certificates.length > 0 && (
          <div className="mb-4 space-y-2">
            {certificates.map((cert) => (
              <div key={cert.id} className="flex items-center justify-between rounded border p-3">
                <div>
                  <span className="font-medium">{cert.name}</span>
                  <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="ml-2 text-sm text-blue-600 hover:underline">
                    View
                  </a>
                </div>
                <button onClick={() => handleDeleteCert(cert.id)}
                  className="text-red-500 hover:text-red-700">X</button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleCertUpload} className="flex items-end gap-3">
          <div className="flex-1">
            <label htmlFor="certName" className="block text-sm font-medium text-gray-700">Certificate Name</label>
            <input id="certName" name="name" type="text" required
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
          </div>
          <div className="flex-1">
            <label htmlFor="certFile" className="block text-sm font-medium text-gray-700">Certificate File</label>
            <input id="certFile" name="file" type="file" required accept="image/*,.pdf"
              className="mt-1 block w-full text-sm" />
          </div>
          <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">+</button>
        </form>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Change Password</h2>

        {passwordMsg && <div className="mb-4 rounded bg-green-50 p-3 text-sm text-green-700">{passwordMsg}</div>}
        {passwordErr && <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{passwordErr}</div>}

        <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-4">
          <PasswordInput id="currentPassword" name="currentPassword" label="Current Password" required />
          <PasswordInput id="newPassword" name="newPassword" label="New Password" required minLength={8} />
          <PasswordInput id="confirmPassword" name="confirmPassword" label="Confirm Password" required minLength={8} />
          <button type="submit" className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}
