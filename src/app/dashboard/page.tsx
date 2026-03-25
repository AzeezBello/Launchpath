"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BriefcaseBusiness,
  GraduationCap,
  HandCoins,
  Sparkles,
  Users,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ResumeScoreCard } from "@/components/dashboard/ResumeScoreCard";
import { RecommendedJobs } from "@/components/dashboard/RecommendedJobs";
import { RecentApplications } from "@/components/dashboard/RecentApplications";
import { scholarshipData, grantData, jobData, admissionData } from "@/data/opportunities";

type UsagePayload = {
  plan: string;
  limits: {
    coverLettersPerMonth: number;
    resumes: number;
    applications: number;
    interviews: number;
  };
  usage: {
    coverLetters: number;
    resumes: number;
    applications: number;
    interviews: number;
  };
  usagePct: {
    coverLetters: number;
    resumes: number;
    applications: number;
    interviews: number;
  };
};

type ResourceCard = {
  title: string;
  value: number;
  href: string;
  note: string;
  icon: LucideIcon;
};

const EMPTY_USAGE: UsagePayload = {
  plan: "starter",
  limits: {
    coverLettersPerMonth: 20,
    resumes: 5,
    applications: 50,
    interviews: 20,
  },
  usage: {
    coverLetters: 0,
    resumes: 0,
    applications: 0,
    interviews: 0,
  },
  usagePct: {
    coverLetters: 0,
    resumes: 0,
    applications: 0,
    interviews: 0,
  },
};

const QUICK_ACTIONS = [
  {
    title: "Polish your resume",
    body: "Update role-specific experience and save a fresh version.",
    href: "/dashboard/resume",
  },
  {
    title: "Draft a cover letter",
    body: "Generate and tweak a tailored draft for an active role.",
    href: "/dashboard/cover-letter",
  },
  {
    title: "Review applications",
    body: "Check what is due next and unblock stuck submissions.",
    href: "/dashboard/applications",
  },
];

function formatPlanLabel(plan: string) {
  return `${plan.charAt(0).toUpperCase()}${plan.slice(1)}`;
}

function UsageRow({
  label,
  used,
  limit,
  pct,
}: {
  label: string;
  used: number;
  limit: number;
  pct: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">
          {used} / {limit}
        </span>
      </div>
      <Progress value={pct} />
    </div>
  );
}

export default function OverviewPage() {
  const [usage, setUsage] = useState<UsagePayload>(EMPTY_USAGE);
  const [usageLoading, setUsageLoading] = useState(true);

  const resourceCards: ResourceCard[] = [
    {
      title: "Scholarships live",
      value: scholarshipData.length,
      href: "/dashboard/scholarships",
      note: "Funding opportunities with active deadlines.",
      icon: GraduationCap,
    },
    {
      title: "Grants tracked",
      value: grantData.length,
      href: "/dashboard/grants",
      note: "Open grants and support opportunities.",
      icon: HandCoins,
    },
    {
      title: "Jobs curated",
      value: jobData.length,
      href: "/dashboard/jobs",
      note: "Career matches worth reviewing this week.",
      icon: BriefcaseBusiness,
    },
    {
      title: "Admissions programs",
      value: admissionData.length,
      href: "/dashboard/admissions",
      note: "Academic programs with next-step visibility.",
      icon: Users,
    },
  ];

  useEffect(() => {
    const controller = new AbortController();

    async function loadUsage() {
      setUsageLoading(true);

      try {
        const res = await fetch("/api/billing/usage", {
          cache: "no-store",
          signal: controller.signal,
        });
        const payload = await res.json();

        if (!res.ok) {
          throw new Error(payload?.error || "Failed to load usage");
        }

        setUsage(payload?.data || EMPTY_USAGE);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error(error);
        setUsage(EMPTY_USAGE);
      } finally {
        if (!controller.signal.aborted) {
          setUsageLoading(false);
        }
      }
    }

    loadUsage();

    return () => controller.abort();
  }, []);

  const usageSummary = [
    {
      label: "Resumes",
      used: usage.usage.resumes,
      limit: usage.limits.resumes,
      pct: usage.usagePct.resumes,
    },
    {
      label: "Applications",
      used: usage.usage.applications,
      limit: usage.limits.applications,
      pct: usage.usagePct.applications,
    },
    {
      label: "Interviews",
      used: usage.usage.interviews,
      limit: usage.limits.interviews,
      pct: usage.usagePct.interviews,
    },
    {
      label: "Cover letters",
      used: usage.usage.coverLetters,
      limit: usage.limits.coverLettersPerMonth,
      pct: usage.usagePct.coverLetters,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="surface-panel relative overflow-hidden p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl space-y-4">
            <Badge variant="outline" className="w-fit">
              <Sparkles className="h-3.5 w-3.5" />
              Workspace overview
            </Badge>
            <div>
              <h2 className="text-balance text-3xl font-semibold sm:text-4xl">
                Keep every opportunity moving with less friction.
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
                The overview pulls your best next actions, plan usage, and pipeline
                signal into one place so you can decide quickly and keep momentum.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.35rem] border border-border/80 bg-background/45 px-4 py-4">
              <p className="text-sm text-muted-foreground">Current plan</p>
              <p className="mt-2 text-2xl font-semibold">{formatPlanLabel(usage.plan)}</p>
            </div>
            <div className="rounded-[1.35rem] border border-border/80 bg-background/45 px-4 py-4">
              <p className="text-sm text-muted-foreground">Jobs available</p>
              <p className="mt-2 text-2xl font-semibold">{jobData.length}</p>
            </div>
            <div className="rounded-[1.35rem] border border-border/80 bg-background/45 px-4 py-4">
              <p className="text-sm text-muted-foreground">Funding leads</p>
              <p className="mt-2 text-2xl font-semibold">
                {scholarshipData.length + grantData.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {resourceCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link key={card.title} href={card.href} className="group">
              <Card className="hover-card h-full">
                <CardContent className="flex h-full flex-col gap-5 p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <p className="mt-2 text-3xl font-semibold">{card.value}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {card.note}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-6 lg:grid-cols-2">
          <ResumeScoreCard />

          <Card>
            <CardHeader>
              <CardTitle>Best next actions</CardTitle>
              <CardDescription>
                Keep the pipeline moving with small, high-leverage updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {QUICK_ACTIONS.map((action) => (
                <div
                  key={action.title}
                  className="rounded-[1.25rem] border border-border/80 bg-background/45 p-4"
                >
                  <p className="font-semibold">{action.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {action.body}
                  </p>
                  <Button variant="ghost" className="mt-3 px-0" asChild>
                    <Link href={action.href}>
                      Open
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Plan usage</CardTitle>
            <CardDescription>
              Track how much of the workspace you have used this cycle.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {usageLoading ? (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className="space-y-2">
                    <div className="h-4 w-28 rounded-full bg-muted/80" />
                    <div className="h-2.5 w-full rounded-full bg-muted/70" />
                  </div>
                ))}
              </div>
            ) : (
              usageSummary.map((item) => <UsageRow key={item.label} {...item} />)
            )}

            <div className="rounded-[1.35rem] border border-border/80 bg-background/45 p-4">
              <p className="text-sm font-semibold">
                Plan: {formatPlanLabel(usage.plan)}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Upgrade when you want more saved assets, more workflow headroom, or
                shared usage across a team.
              </p>
              <Button variant="outline" className="mt-4 w-full" asChild>
                <Link href="/contact">Discuss Pro</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <RecommendedJobs />
        <RecentApplications />
      </section>
    </div>
  );
}
