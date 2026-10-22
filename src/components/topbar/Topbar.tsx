"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { DashboardNavigation } from "@/components/sidebar/DashboardSidebar";
import { UserDropdown } from "@/components/user/UserDropdown";
import { ThemeToggle } from "@/components/theme-toggle";

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
    path: "/dashboard/recommenders",
    title: "Recommenders",
    description: "Who is writing your reference letters, when they are due, and what is still outstanding.",
  },
  {
    path: "/dashboard/essays",
    title: "Essays",
    description: "Draft personal statements and scholarship essays against their prompts and word limits.",
  },
  {
    path: "/dashboard/opportunities",
    title: "Opportunity",
    description: "Everything we know about this opportunity, and the actions to take on it.",
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
    <header className="sticky top-0 z-30 border-b border-border/75 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                aria-label="Open dashboard navigation"
              >
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[84vw] max-w-xs p-0">
              <SheetHeader className="border-b border-border/75 px-5 pb-4 pt-5 text-left">
                <SheetTitle className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#3B82F6,#10B981)] font-display text-[11px] font-bold text-slate-950">
                    LP
                  </span>
                  LaunchPath
                </SheetTitle>
                <SheetDescription>
                  Navigate the workspace across career and academic tools.
                </SheetDescription>
              </SheetHeader>
              <DashboardNavigation
                className="px-4 py-4 overflow-y-auto"
                layoutScope="mobile"
                onNavigate={() => setMobileNavOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Workspace
              </span>
              <span className="text-border">/</span>
              <h1 className="truncate font-display text-base font-semibold tracking-tight sm:text-lg">
                {meta.title}
              </h1>
            </div>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              {meta.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Separator orientation="vertical" className="hidden h-5 sm:block" />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
