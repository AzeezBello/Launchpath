"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DashboardNavigation } from "@/components/sidebar/DashboardSidebar";
import { UserDropdown } from "@/components/user/UserDropdown";

const ROUTE_META = [
  {
    path: "/dashboard/cover-letter/history",
    title: "Letter History",
    description: "Review saved drafts, compare versions, and reopen strong applications.",
  },
  {
    path: "/dashboard/cover-letter",
    title: "Cover Letters",
    description: "Generate tailored drafts and keep them tied to the right role.",
  },
  {
    path: "/dashboard/interview-prep",
    title: "Interview Prep",
    description: "Practice answers, key stories, and talking points before interviews.",
  },
  {
    path: "/dashboard/scholarships",
    title: "Scholarships",
    description: "Track fit, deadlines, and requirements for your best funding options.",
  },
  {
    path: "/dashboard/admissions",
    title: "Admissions",
    description: "Keep schools, status, and required materials in a single place.",
  },
  {
    path: "/dashboard/applications",
    title: "Applications",
    description: "See what is in progress, what is blocked, and what is due next.",
  },
  {
    path: "/dashboard/settings",
    title: "Settings",
    description: "Adjust account details, notifications, and workspace preferences.",
  },
  {
    path: "/dashboard/resume",
    title: "Resume Builder",
    description: "Shape role-specific resume versions without losing your source material.",
  },
  {
    path: "/dashboard/jobs",
    title: "Jobs",
    description: "Review curated matches and move strong roles into your pipeline.",
  },
  {
    path: "/dashboard/grants",
    title: "Grants",
    description: "Watch open funding opportunities and keep deadlines within view.",
  },
  {
    path: "/dashboard",
    title: "Overview",
    description: "A high-level view of activity across jobs, funding, and applications.",
  },
];

function getRouteMeta(pathname: string) {
  return (
    ROUTE_META.find(
      (route) => pathname === route.path || pathname.startsWith(`${route.path}/`)
    ) ?? ROUTE_META[ROUTE_META.length - 1]
  );
}

export function Topbar() {
  const pathname = usePathname() ?? "/dashboard";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const meta = getRouteMeta(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/65 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <button
                className="inline-flex size-10 items-center justify-center rounded-full border border-border/80 bg-card/70 lg:hidden"
                aria-label="Open dashboard navigation"
              >
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[86vw] max-w-sm px-0">
              <SheetHeader className="border-b border-border/70 px-5 pb-4 pt-6 text-left">
                <SheetTitle>LaunchPath</SheetTitle>
                <SheetDescription>
                  Navigate the workspace across career and academic tools.
                </SheetDescription>
              </SheetHeader>
              <DashboardNavigation
                className="px-4 py-5"
                onNavigate={() => setMobileNavOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              LaunchPath
            </p>
            <h1 className="truncate text-xl font-semibold">{meta.title}</h1>
            <p className="hidden text-sm text-muted-foreground sm:block">
              {meta.description}
            </p>
          </div>
        </div>

        <UserDropdown />
      </div>
    </header>
  );
}
