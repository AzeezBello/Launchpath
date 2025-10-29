"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserCircle,
  FileText,
  Briefcase,
  GraduationCap,
  Settings,
} from "lucide-react";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Resume", href: "/dashboard/resume", icon: FileText },
  { name: "Applications", href: "/dashboard/applications", icon: Briefcase },
  { name: "Scholarships", href: "/dashboard/scholarships", icon: GraduationCap },
  { name: "Account", href: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass min-h-screen w-64 p-6 border-r border-white/10 flex flex-col justify-between">
      <div>
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-white tracking-tight">LaunchPath</h2>
          <p className="text-xs text-gray-400">Empower your journey 🚀</p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-white/20 text-white shadow-md"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="text-center text-xs text-gray-500">
        <p>© 2025 LaunchPath</p>
      </div>
    </aside>
  );
}
