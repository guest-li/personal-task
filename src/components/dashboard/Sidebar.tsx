"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

interface SidebarProps {
  role: string;
  userId: string;
  collapsed: boolean;
  onToggle: () => void;
}

const studentLinks = (userId: string) => [
  { href: "/user/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/user/my-application", label: "My Application", icon: "📄" },
  { href: "/user/my-event", label: "My Events", icon: "📅" },
  { href: `/user/profile/${userId}`, label: "Edit Profile", icon: "👤" },
  { href: "/user/notification", label: "Notification", icon: "🔔" },
];

const partnerLinks = () => [
  { href: "/user/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/", label: "Apply For New", icon: "➕" },
  { href: "/user/my-application", label: "My Application", icon: "📄" },
  { href: "/user/notification", label: "Notification", icon: "🔔" },
];

export default function Sidebar({ role, userId, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const links = role === "partner" ? partnerLinks() : studentLinks(userId);

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 z-40 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && <span className="text-lg font-bold">EduConsult</span>}
        <button
          onClick={onToggle}
          className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
      </div>

      <nav className="mt-4 space-y-1 px-2">
        {links.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
