"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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

export default function OverviewPage() {
  const [usage, setUsage] = useState<UsagePayload>(EMPTY_USAGE);
  const [usageLoading, setUsageLoading] = useState(true);

  useEffect(() => {
    async function loadUsage() {
      setUsageLoading(true);
      try {
        const res = await fetch("/api/billing/usage", { cache: "no-store" });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.error || "Failed to load usage");
        setUsage(payload?.data || EMPTY_USAGE);
      } catch (error) {
        console.error(error);
        setUsage(EMPTY_USAGE);
      } finally {
        setUsageLoading(false);
      }
    }

    loadUsage();
  }, []);

  const stats = [
    { title: "Scholarships live", value: scholarshipData.length, color: "emerald" },
    { title: "Grants tracked", value: grantData.length, color: "indigo" },
    { title: "Jobs curated", value: jobData.length, color: "rose" },
    { title: "Admissions programs", value: admissionData.length, color: "cyan" },
  ];

  const colorMap: Record<string, { border: string; text: string }> = {
    emerald: { border: "border-emerald-500/30", text: "text-emerald-400" },
    indigo: { border: "border-indigo-500/30", text: "text-indigo-400" },
    rose: { border: "border-rose-500/30", text: "text-rose-400" },
    cyan: { border: "border-cyan-500/30", text: "text-cyan-300" },
  };

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <Card
            key={s.title}
            className={`glass-panel hover-card text-white ${colorMap[s.color]?.border ?? "border-white/20"}`}
          >
            <CardContent className="p-6">
              <h3 className="text-sm uppercase tracking-wide text-gray-300">{s.title}</h3>
              <p className={`text-3xl font-bold mt-2 ${colorMap[s.color]?.text ?? "text-white"}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white">
            Workspace Plan: {usage.plan.charAt(0).toUpperCase()}
            {usage.plan.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {usageLoading ? (
            <p className="text-sm text-gray-300">Loading usage...</p>
          ) : (
            <>
              <UsageRow
                label="Resumes"
                used={usage.usage.resumes}
                limit={usage.limits.resumes}
                pct={usage.usagePct.resumes}
              />
              <UsageRow
                label="Applications"
                used={usage.usage.applications}
                limit={usage.limits.applications}
                pct={usage.usagePct.applications}
              />
              <UsageRow
                label="Interviews"
                used={usage.usage.interviews}
                limit={usage.limits.interviews}
                pct={usage.usagePct.interviews}
              />
              <UsageRow
                label="Cover letters (monthly)"
                used={usage.usage.coverLetters}
                limit={usage.limits.coverLettersPerMonth}
                pct={usage.usagePct.coverLetters}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
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
      <div className="flex items-center justify-between text-sm text-gray-200">
        <span>{label}</span>
        <span>
          {used} / {limit}
        </span>
      </div>
      <Progress value={pct} />
    </div>
  );
}
