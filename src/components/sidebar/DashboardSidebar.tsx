"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  Bookmark,
  Briefcase,
  ClipboardList,
  FileText,
  PenLine,
  GraduationCap,
  HandCoins,
  LayoutDashboard,
  Rocket,
  Settings,
  UserCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type DashboardLink = {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  tourId?: string;
};

type DashboardGroup = {
  label: string;
  tourId?: string;
  links: DashboardLink[];
};

const PRIMARY_LINKS: DashboardLink[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Command center & metrics",
    tourId: "nav-overview",
  },
];

const DASHBOARD_GROUPS: DashboardGroup[] = [
  {
    label: "Career Workspace",
    tourId: "nav-career",
    links: [
      { label: "Resume", href: "/dashboard/resume", icon: FileText },
      { label: "Cover Letters", href: "/dashboard/cover-letter", icon: BookOpen },
      { label: "Applications", href: "/dashboard/applications", icon: ClipboardList },
      { label: "Interview Prep", href: "/dashboard/interview-prep", icon: Users },
      { label: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
      { label: "Saved", href: "/dashboard/saved", icon: Bookmark, tourId: "nav-saved" },
    ],
  },
  {
    label: "Academic Pipeline",
    tourId: "nav-academic",
    links: [
      { label: "Scholarships", href: "/dashboard/scholarships", icon: GraduationCap },
      { label: "Grants", href: "/dashboard/grants", icon: HandCoins },
      { label: "Admissions", href: "/dashboard/admissions", icon: Rocket },
      { label: "Essays", href: "/dashboard/essays", icon: PenLine },
      { label: "Recommenders", href: "/dashboard/recommenders", icon: UserCheck },
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
  layoutScope = "desktop",
}: {
  link: DashboardLink;
  active: boolean;
  onNavigate?: () => void;
  layoutScope?: string;
}) {
  const Icon = link.icon;

  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      data-tour={link.tourId}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 scale-100 active:scale-[0.985] transition-[color,scale] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:bg-accent/55 hover:text-foreground"
      )}
    >
      {active && (
        <motion.span
          layoutId={`sidebar-active-${layoutScope}`}
          transition={{ type: "spring", duration: 0.32, bounce: 0.08 }}
          className="pointer-events-none absolute inset-0 rounded-xl border border-primary/25 bg-primary/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]"
        />
      )}

      <span
        className={cn(
          "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
          active
            ? "border-primary/20 bg-primary/15 text-primary"
            : "border-border/60 bg-background/60 text-muted-foreground group-hover:border-border group-hover:text-foreground"
        )}
      >
        <Icon className="size-4" />
      </span>

      <span className="relative z-10 min-w-0">
        <span className="block text-xs font-semibold leading-tight">{link.label}</span>
        {link.description ? (
          <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
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
  layoutScope = "desktop",
}: {
  className?: string;
  onNavigate?: () => void;
  layoutScope?: string;
}) {
  const pathname = usePathname() ?? "/dashboard";

  return (
    <nav className={cn("space-y-5", className)} aria-label="Workspace navigation">
      <div className="space-y-1">
        {PRIMARY_LINKS.map((link) => (
          <DashboardNavItem
            key={link.href}
            link={link}
            active={isActivePath(pathname, link.href)}
            onNavigate={onNavigate}
            layoutScope={layoutScope}
          />
        ))}
      </div>

      {DASHBOARD_GROUPS.map((group) => (
        <div key={group.label} data-tour={group.tourId} className="space-y-1.5">
          <p className="px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/85">
            {group.label}
          </p>
          <div className="space-y-0.5">
            {group.links.map((link) => (
              <DashboardNavItem
                key={link.href}
                link={link}
                active={isActivePath(pathname, link.href)}
                onNavigate={onNavigate}
                layoutScope={layoutScope}
              />
            ))}
          </div>
        </div>
      ))}

      <Separator className="my-3" />

      <div className="space-y-0.5">
        {UTILITY_LINKS.map((link) => (
          <DashboardNavItem
            key={link.href}
            link={link}
            active={isActivePath(pathname, link.href)}
            onNavigate={onNavigate}
            layoutScope={layoutScope}
          />
        ))}
      </div>
    </nav>
  );
}

export function DashboardSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[268px] shrink-0 flex-col border-r border-border/75 bg-card/55 px-3.5 py-5 backdrop-blur-xl lg:flex">
      <Link
        href="/"
        data-tour="sidebar-brand"
        className="group flex items-center gap-3 rounded-xl px-2.5 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex size-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#3B82F6,#10B981)] font-display text-xs font-bold text-slate-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35),0_6px_16px_-4px_rgba(59,130,246,0.5)] scale-100 transition-transform duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.03]">
          LP
        </span>
        <div>
          <p className="font-display text-sm font-semibold tracking-tight leading-none">
            LaunchPath
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground leading-none">
            Workspace OS
          </p>
        </div>
      </Link>

      <DashboardNavigation className="mt-6 flex-1 overflow-y-auto pr-1" layoutScope="desktop" />

      <div className="mt-4 rounded-xl border border-border/80 bg-background/60 p-3.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-foreground">Pipeline cadence</p>
          <span className="size-1.5 rounded-full bg-success" aria-hidden />
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Attach one tailored resume and one cover letter per role to keep submission velocity high.
        </p>
      </div>
    </aside>
  );
}
