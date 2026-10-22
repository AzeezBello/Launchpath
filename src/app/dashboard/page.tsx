"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
import { UpcomingDeadlines } from "@/components/dashboard/UpcomingDeadlines";
import { PipelineStats } from "@/components/dashboard/PipelineStats";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { scholarshipData, grantData, jobData, admissionData } from "@/data/opportunities";
import type { OpportunityType } from "@/lib/types";

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
  type: OpportunityType;
  code: string;
  title: string;
  href: string;
  note: string;
  icon: LucideIcon;
};

type OpportunityCounts = Record<OpportunityType, number>;

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

const STATIC_COUNTS: OpportunityCounts = {
  scholarship: scholarshipData.length,
  grant: grantData.length,
  job: jobData.length,
  admission: admissionData.length,
};

const RESOURCE_CARDS: ResourceCard[] = [
  {
    type: "scholarship",
    code: "TRK-01",
    title: "Scholarships live",
    href: "/dashboard/scholarships",
    note: "Funding opportunities with active deadlines.",
    icon: GraduationCap,
  },
  {
    type: "grant",
    code: "TRK-02",
    title: "Grants tracked",
    href: "/dashboard/grants",
    note: "Open research and project grants.",
    icon: HandCoins,
  },
  {
    type: "job",
    code: "TRK-03",
    title: "Jobs available",
    href: "/dashboard/jobs",
    note: "Live roles worth reviewing this week.",
    icon: BriefcaseBusiness,
  },
  {
    type: "admission",
    code: "TRK-04",
    title: "Admissions programs",
    href: "/dashboard/admissions",
    note: "Academic programs with next-step visibility.",
    icon: Users,
  },
];

const QUICK_ACTIONS = [
  {
    code: "ACT-01",
    title: "Polish your resume",
    body: "Update role-specific experience and save a fresh version.",
    href: "/dashboard/resume",
  },
  {
    code: "ACT-02",
    title: "Draft a cover letter",
    body: "Generate a draft that cites the experience on your resume.",
    href: "/dashboard/cover-letter",
  },
  {
    code: "ACT-03",
    title: "Review applications",
    body: "Check what is due next and unblock stuck submissions.",
    href: "/dashboard/applications",
  },
];

function formatPlanLabel(plan: string) {
  return `${plan.charAt(0).toUpperCase()}${plan.slice(1)}`;
}

async function countFrom(url: string, signal: AbortSignal): Promise<number | null> {
  try {
    const res = await fetch(url, { cache: "no-store", signal });
    const payload = await res.json();
    if (!res.ok) return null;
    const total = Number(payload?.meta?.total);
    if (Number.isFinite(total)) return total;
    return Array.isArray(payload?.data) ? payload.data.length : null;
  } catch {
    return null;
  }
}

function UsageRow({
  label,
  used,
  limit,
  pct,
  hint,
}: {
  label: string;
  used: number;
  limit: number;
  pct: number;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
          {label}
          {hint && <InfoTooltip text={hint} />}
        </span>
        <span className="font-mono font-semibold tabular-nums text-foreground">
          {used} <span className="text-muted-foreground">/ {limit}</span>
        </span>
      </div>
      <Progress value={pct} />
    </div>
  );
}

export default function OverviewPage() {
  const [usage, setUsage] = useState<UsagePayload>(EMPTY_USAGE);
  const [usageLoading, setUsageLoading] = useState(true);
  const [counts, setCounts] = useState<OpportunityCounts>(STATIC_COUNTS);
  const [countsLoading, setCountsLoading] = useState(true);
  const [focus, setFocus] = useState<OpportunityType[]>([]);

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

    async function loadCounts() {
      const [scholarship, grant, job, admission] = await Promise.all([
        countFrom("/api/scholarships?query=", controller.signal),
        countFrom("/api/grants?query=", controller.signal),
        countFrom("/api/jobs?query=", controller.signal),
        countFrom("/api/admissions?country=&field=", controller.signal),
      ]);
      if (controller.signal.aborted) return;

      setCounts({
        scholarship: scholarship ?? STATIC_COUNTS.scholarship,
        grant: grant ?? STATIC_COUNTS.grant,
        job: job ?? STATIC_COUNTS.job,
        admission: admission ?? STATIC_COUNTS.admission,
      });
      setCountsLoading(false);
    }

    async function loadFocus() {
      try {
        const res = await fetch("/api/settings", { cache: "no-store", signal: controller.signal });
        const payload = await res.json();
        const stored = payload?.data?.onboarding?.focus;
        if (Array.isArray(stored)) setFocus(stored as OpportunityType[]);
      } catch {
        // Focus is a nicety; ignore failures.
      }
    }

    loadUsage();
    loadCounts();
    loadFocus();

    return () => controller.abort();
  }, []);

  const resourceCards = useMemo(() => {
    if (focus.length === 0) return RESOURCE_CARDS;
    const rank = new Map(focus.map((type, i) => [type, i]));
    return [...RESOURCE_CARDS].sort((a, b) => {
      const ra = rank.has(a.type) ? (rank.get(a.type) as number) : 99;
      const rb = rank.has(b.type) ? (rank.get(b.type) as number) : 99;
      return ra - rb;
    });
  }, [focus]);

  const usageSummary = [
    {
      label: "Resumes",
      used: usage.usage.resumes,
      limit: usage.limits.resumes,
      pct: usage.usagePct.resumes,
      hint: "Total resumes saved to your account on your current plan.",
    },
    {
      label: "Applications",
      used: usage.usage.applications,
      limit: usage.limits.applications,
      pct: usage.usagePct.applications,
      hint: "Total applications you're tracking, including ones created via Apply.",
    },
    {
      label: "Interviews",
      used: usage.usage.interviews,
      limit: usage.limits.interviews,
      pct: usage.usagePct.interviews,
      hint: "Total interviews logged in Interview Prep.",
    },
    {
      label: "Cover letters",
      used: usage.usage.coverLetters,
      limit: usage.limits.coverLettersPerMonth,
      pct: usage.usagePct.coverLetters,
      hint: "AI cover letter generations this month. Resets at the start of each month.",
    },
  ];

  const countValue = (value: number) =>
    countsLoading ? (
      <span className="inline-block h-7 w-14 animate-pulse rounded-md bg-muted/70" />
    ) : (
      <span className="font-mono tabular-nums">{value}</span>
    );

  return (
    <div className="space-y-8 pb-8">
      <Card className="relative overflow-hidden p-7 sm:p-9 lg:p-10">
        <div className="pointer-events-none absolute right-0 top-0 size-60 rounded-full bg-primary/8 blur-3xl" />

        <div className="relative grid gap-8 xl:grid-cols-[1.18fr_0.82fr] xl:items-center">
          <div className="space-y-5">
            <Badge variant="outline" className="w-fit">
              <Sparkles className="size-3.5 text-primary" />
              Command Center
            </Badge>
            <div className="space-y-2.5">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl lg:leading-[1.12]">
                Keep every opportunity moving with less friction.
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Live opportunity telemetry, upcoming deadline signals, and AI writing tools
                framed for high-focus execution.
              </p>
            </div>

            <div className="grid divide-y divide-border/75 overflow-hidden rounded-xl border border-border/80 bg-background/55 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="px-4 py-3.5">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Current plan
                </p>
                <p className="mt-1.5 font-display text-xl font-semibold">
                  {formatPlanLabel(usage.plan)}
                </p>
              </div>
              <div className="px-4 py-3.5">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Jobs available
                </p>
                <p className="mt-1.5 text-xl font-semibold">{countValue(counts.job)}</p>
              </div>
              <div className="px-4 py-3.5">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Funding leads
                </p>
                <p className="mt-1.5 text-xl font-semibold">
                  {countValue(counts.scholarship + counts.grant)}
                </p>
              </div>
            </div>
          </div>

          <div className="mockup-frame overflow-hidden p-2">
            <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950">
              <Image
                src="/images/pipeline-analytics.svg"
                alt="Pipeline velocity and upcoming milestone radar"
                width={640}
                height={440}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </Card>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {resourceCards.map((card) => {
          const Icon = card.icon;
          const isFocus = focus.includes(card.type);

          return (
            <Link key={card.type} href={card.href} className="group outline-none">
              <Card className="hover-card h-full py-5">
                <CardContent className="flex h-full flex-col justify-between gap-5 px-5">
                  <div className="flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <span className="flex items-center gap-2">
                      {isFocus ? (
                        <Badge variant="default" className="text-[10px]">
                          Focus
                        </Badge>
                      ) : (
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {card.code}
                        </span>
                      )}
                      <ArrowRight className="size-4 text-muted-foreground translate-x-0 transition-transform duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-1 group-hover:text-primary" />
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
                    <p className="mt-1.5 text-3xl font-semibold tracking-tight">
                      {countValue(counts[card.type])}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
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
          <UpcomingDeadlines />
          <ResumeScoreCard />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Plan Quota</CardTitle>
            <CardDescription>
              Resource utilization across your current billing cycle.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {usageLoading ? (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className="space-y-2">
                    <div className="h-3.5 w-28 animate-pulse rounded-md bg-muted/80" />
                    <div className="h-2 w-full animate-pulse rounded-full bg-muted/70" />
                  </div>
                ))}
              </div>
            ) : (
              usageSummary.map((item) => <UsageRow key={item.label} {...item} />)
            )}

            <div className="rounded-xl border border-border/80 bg-background/50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold">
                  Active Tier: {formatPlanLabel(usage.plan)}
                </p>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {usage.plan === "starter" ? "FREE" : "PRO"}
                </Badge>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Upgrade when you want more saved assets, higher AI generation volume, or
                automated deadline alerts.
              </p>
              <Button variant="outline" size="sm" className="mt-3.5 w-full" asChild>
                <Link href="/dashboard/settings#billing">
                  {usage.plan === "starter" ? "Upgrade to Pro" : "Manage billing"}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <PipelineStats />
        <RecentApplications />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <RecommendedJobs />
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">High-Leverage Next Actions</CardTitle>
            <CardDescription>
              Keep the pipeline moving with focused, compound updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {QUICK_ACTIONS.map((action) => (
              <div
                key={action.title}
                className="flex items-center justify-between gap-4 rounded-xl border border-border/80 bg-background/50 p-4 transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-border"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {action.code}
                    </span>
                    <p className="text-sm font-semibold">{action.title}</p>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {action.body}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="shrink-0" asChild>
                  <Link href={action.href}>
                    Open
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
