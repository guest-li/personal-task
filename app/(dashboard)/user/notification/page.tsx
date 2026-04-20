"use client";

import { useEffect, useState, useCallback } from "react";

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 10, total: 0, totalPages: 0,
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(pagination.page),
      limit: String(pagination.limit),
    });
    const res = await fetch(`/api/v1/notifications?${params}`);
    const data = await res.json();
    setNotifications(data.notifications);
    setPagination(data.pagination);
    setUnreadCount(data.unreadCount);
    setLoading(false);
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function handleMarkRead(id: string) {
    const res = await fetch("/api/v1/notifications/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });
    if (res.ok) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  }

  async function handleMarkAllRead() {
    const res = await fetch("/api/v1/notifications/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    if (res.ok) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-sm font-normal text-white">
              {unreadCount}
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-500">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-lg border p-4 shadow-sm ${
                n.isRead ? "bg-white" : "border-blue-200 bg-blue-50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                    )}
                    <h3 className="font-semibold text-gray-900">{n.title}</h3>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{n.message}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="ml-4 text-xs text-blue-600 hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page <= 1}
                  className="rounded border px-3 py-1 text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="rounded border px-3 py-1 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
