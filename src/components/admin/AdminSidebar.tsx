"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/applications", label: "Applications", icon: "📋" },
  { href: "/admin/events", label: "Events", icon: "📅" },
  { href: "/admin/partners", label: "Partners", icon: "🤝" },
  { href: "/admin/notifications", label: "Notifications", icon: "🔔" },
  { href: "/admin/universities", label: "Universities", icon: "🏛️" },
  { href: "/admin/courses", label: "Courses", icon: "📚" },
  { href: "/admin/scholarships", label: "Scholarships", icon: "🎓" },
  { href: "/admin/blog-posts", label: "Blog Posts", icon: "📝" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-800 text-white">
      <div className="p-6">
        <h2 className="text-xl font-bold">Admin Panel</h2>
      </div>

      <nav className="space-y-2 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-slate-700"
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
