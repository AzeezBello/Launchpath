"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  GraduationCap,
  HandCoins,
  Settings,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Users,
  Rocket,
} from "lucide-react";
import { useState } from "react";

export function DashboardSidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const toggleMenu = (key: string) =>
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));

  const menuSections = [
    {
      title: "Dashboard",
      items: [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "Career Tools",
      items: [
        { name: "Resume", href: "/dashboard/resume", icon: FileText },
        { name: "Cover Letter", href: "/dashboard/cover-letter", icon: BookOpen },
        { name: "Interview Prep", href: "/dashboard/interview-prep", icon: Users },
        { name: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
      ],
    },
    {
      title: "Academic Resources",
      items: [
        { name: "Scholarships", href: "/dashboard/scholarships", icon: GraduationCap },
        { name: "Grants", href: "/dashboard/grants", icon: HandCoins },
        { name: "Admissions", href: "/dashboard/admissions", icon: Rocket },
      ],
    },
    {
      title: "System",
      items: [
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside className="glass min-h-screen w-64 p-6 border-r border-white/10 flex flex-col justify-between backdrop-blur-lg bg-white/10">
      {/* Logo Section */}
      <div>
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-white tracking-tight">LaunchPath</h2>
          <p className="text-xs text-gray-400">Empower your journey 🚀</p>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-6">
          {menuSections.map((section) => (
            <div key={section.title}>
              <p className="text-xs uppercase text-gray-400 mb-2 px-3">{section.title}</p>
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-white/25 text-white shadow-md"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} LaunchPath</p>
      </div>
    </aside>
  );
}
