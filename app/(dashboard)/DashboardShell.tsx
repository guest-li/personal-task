"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import InactiveOverlay from "@/components/dashboard/InactiveOverlay";

interface DashboardShellProps {
  userId: string;
  userName: string;
  userAvatar: string | null;
  userRole: string;
  userStatus: string;
  unreadCount: number;
  children: React.ReactNode;
}

export default function DashboardShell({
  userId,
  userName,
  userAvatar,
  userRole,
  userStatus,
  unreadCount,
  children,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored === "true") setCollapsed(true);
  }, []);

  function toggleSidebar() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  }

  const isInactivePartner = userRole === "partner" && userStatus === "inactive";

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        role={userRole}
        userId={userId}
        collapsed={collapsed}
        onToggle={toggleSidebar}
      />
      <TopBar
        userName={userName}
        userAvatar={userAvatar}
        unreadCount={unreadCount}
        sidebarCollapsed={collapsed}
        onSidebarToggle={toggleSidebar}
      />
      <main
        className={`pt-16 transition-all duration-300 ${
          collapsed ? "ml-16" : "ml-60"
        }`}
      >
        <div className="p-6">
          {isInactivePartner ? <InactiveOverlay /> : children}
        </div>
      </main>
    </div>
  );
}
