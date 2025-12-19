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
  BookOpen,
  Users,
  Rocket,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function DashboardSidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState({
    career: true,
    academics: false,
  });

  const toggleMenu = (key: keyof typeof openMenus) =>
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const navSections = useMemo(
    () => [
      {
        label: "Career Tools",
        key: "career",
        icon: Briefcase,
        links: [
          { name: "Resume", href: "/dashboard/resume", icon: FileText },
          { name: "Cover Letter", href: "/dashboard/cover-letter", icon: BookOpen },
          { name: "Interview Prep", href: "/dashboard/interview-prep", icon: Users },
          { name: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
        ],
      },
      {
        label: "Academic Resources",
        key: "academics",
        icon: GraduationCap,
        links: [
          { name: "Scholarships", href: "/dashboard/scholarships", icon: GraduationCap },
          { name: "Grants", href: "/dashboard/grants", icon: HandCoins },
          { name: "Admissions", href: "/dashboard/admissions", icon: Rocket },
        ],
      },
    ],
    []
  );

  return (
    <aside className="glass min-h-screen w-64 p-6 border-r border-white/10 flex flex-col justify-between backdrop-blur-lg bg-white/10">
      {/* Logo */}
      <div>
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-white tracking-tight">LaunchPath</h2>
          <p className="text-xs text-gray-400">Empower your journey 🚀</p>
        </div>

        <nav className="space-y-4">
          {/* --- Overview --- */}
          <SidebarLink
            href="/dashboard"
            icon={LayoutDashboard}
            label="Overview"
            active={isActive("/dashboard")}
          />

          {/* --- Dynamic Collapsible Sections --- */}
          {navSections.map((section) => (
            <div key={section.key}>
              <button
                onClick={() => toggleMenu(section.key)}
                className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-gray-300 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <section.icon className="w-5 h-5" />
                  <span>{section.label}</span>
                </div>
                {openMenus[section.key] ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {openMenus[section.key] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="ml-8 mt-2 space-y-1"
                  >
                    {section.links.map((link) => (
                      <SidebarLink
                        key={link.href}
                        href={link.href}
                        icon={link.icon}
                        label={link.name}
                        active={isActive(link.href)}
                        compact
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* --- Settings --- */}
          <SidebarLink
            href="/dashboard/settings"
            icon={Settings}
            label="Settings"
            active={isActive("/dashboard/settings")}
          />
        </nav>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 mt-6">
        <p>© {new Date().getFullYear()} LaunchPath</p>
      </div>
    </aside>
  );
}

/* 🔹 Reusable Sidebar Link Component */
function SidebarLink({
  href,
  icon: Icon,
  label,
  active,
  compact = false,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
        active
          ? "bg-white/20 text-white shadow-sm"
          : "text-gray-400 hover:text-white hover:bg-white/10"
      } ${compact ? "text-sm" : "text-base"}`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}
