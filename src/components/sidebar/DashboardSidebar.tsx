"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Briefcase,
  ClipboardList,
  FileText,
  GraduationCap,
  HandCoins,
  LayoutDashboard,
  Rocket,
  Settings,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type DashboardLink = {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

type DashboardGroup = {
  label: string;
  links: DashboardLink[];
};

const PRIMARY_LINKS: DashboardLink[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Monitor your workspace in one place.",
  },
];

const DASHBOARD_GROUPS: DashboardGroup[] = [
  {
    label: "Career Workspace",
    links: [
      { label: "Resume", href: "/dashboard/resume", icon: FileText },
      { label: "Cover Letters", href: "/dashboard/cover-letter", icon: BookOpen },
      { label: "Applications", href: "/dashboard/applications", icon: ClipboardList },
      { label: "Interview Prep", href: "/dashboard/interview-prep", icon: Users },
      { label: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
    ],
  },
  {
    label: "Academic Pipeline",
    links: [
      { label: "Scholarships", href: "/dashboard/scholarships", icon: GraduationCap },
      { label: "Grants", href: "/dashboard/grants", icon: HandCoins },
      { label: "Admissions", href: "/dashboard/admissions", icon: Rocket },
    ],
  },
];

const UTILITY_LINKS: DashboardLink[] = [
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function DashboardNavItem({
  link,
  active,
  onNavigate,
}: {
  link: DashboardLink;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = link.icon;

  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-3 rounded-[1.3rem] border px-3.5 py-3",
        active
          ? "border-primary/25 bg-primary/10 text-foreground shadow-[0_18px_40px_-30px_rgba(20,184,166,0.45)]"
          : "border-transparent text-muted-foreground hover:border-border/80 hover:bg-accent/65 hover:text-foreground"
      )}
      >
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-2xl",
            active ? "bg-primary/15 text-primary" : "bg-background/55 text-muted-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
        </span>

      <span className="min-w-0">
        <span className="block text-sm font-semibold">{link.label}</span>
        {link.description ? (
          <span className="block truncate text-xs text-muted-foreground">
            {link.description}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

export function DashboardNavigation({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname() ?? "/dashboard";

  return (
    <nav className={cn("space-y-6", className)}>
      <div className="space-y-2">
        {PRIMARY_LINKS.map((link) => (
          <DashboardNavItem
            key={link.href}
            link={link}
            active={isActivePath(pathname, link.href)}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      {DASHBOARD_GROUPS.map((group) => (
        <div key={group.label} className="space-y-2">
          <p className="px-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {group.label}
          </p>
          <div className="space-y-1.5">
            {group.links.map((link) => (
              <DashboardNavItem
                key={link.href}
                link={link}
                active={isActivePath(pathname, link.href)}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="space-y-1.5 border-t border-border/70 pt-5">
        {UTILITY_LINKS.map((link) => (
          <DashboardNavItem
            key={link.href}
            link={link}
            active={isActivePath(pathname, link.href)}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </nav>
  );
}

export function DashboardSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[302px] flex-col border-r border-border/70 bg-background/45 px-4 py-5 backdrop-blur-2xl lg:flex">
      <div className="flex items-center gap-3 px-3">
        <span className="flex size-11 items-center justify-center rounded-[1.35rem] bg-[linear-gradient(135deg,rgba(45,212,191,0.9),rgba(14,165,233,0.85))] text-sm font-bold text-slate-950 shadow-[0_14px_36px_-18px_rgba(20,184,166,0.8)]">
          LP
        </span>
        <div>
          <p className="text-base font-semibold tracking-tight">LaunchPath</p>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Dashboard
          </p>
        </div>
      </div>

      <DashboardNavigation className="mt-8 flex-1 overflow-y-auto pr-1" />

      <div className="mt-6 rounded-[1.5rem] border border-border/80 bg-card/80 p-4">
        <p className="text-sm font-semibold">Keep momentum high</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Save one resume version, one cover letter draft, and one next step for each
          application to keep the pipeline easy to review.
        </p>
      </div>
    </aside>
  );
}
