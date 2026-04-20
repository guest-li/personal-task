"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email") }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Request failed");
        return;
      }

      setSent(true);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Forgot Password</h1>

        {sent ? (
          <div className="rounded bg-green-50 p-4 text-sm text-green-700">
            If an account with that email exists, a password reset link has been sent.
            Check your inbox.
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            <p className="mb-4 text-sm text-gray-600">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input id="email" name="email" type="email" required
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>

              <button type="submit" disabled={loading}
                className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        )}

        <p className="mt-4 text-center text-sm text-gray-600">
          <a href="/sign-in" className="text-blue-600 hover:underline">Back to Sign In</a>
        </p>
      </div>
    </main>
  );
}
