"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TopBarProps {
  userName: string;
  userAvatar: string | null;
  unreadCount: number;
  sidebarCollapsed: boolean;
  onSidebarToggle: () => void;
}

export default function TopBar({
  userName,
  userAvatar,
  unreadCount,
  sidebarCollapsed,
  onSidebarToggle,
}: TopBarProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.push("/sign-in");
  }

  return (
    <header
      className={`fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6 transition-all duration-300 ${
        sidebarCollapsed ? "left-16" : "left-60"
      }`}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onSidebarToggle}
          className="rounded p-1 text-gray-600 hover:bg-gray-100 lg:hidden"
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <input
          type="text"
          placeholder="Search..."
          className="hidden w-64 rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none sm:block"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/user/notification")}
          className="relative rounded p-1 text-gray-600 hover:bg-gray-100"
        >
          🔔
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded p-1 hover:bg-gray-100"
          >
            {userAvatar ? (
              <img src={userAvatar} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm text-white">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="hidden text-sm text-gray-700 sm:block">{userName}</span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded border bg-white py-1 shadow-lg">
              <button
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
