"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin } from "lucide-react";
import { useSupabase } from "@/providers/SupabaseProvider";
import type { ResumeFormData } from "@/types/resume";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  link: string;
};

const STOPWORDS = new Set([
  "and", "the", "for", "with", "of", "a", "an", "to", "in", "at", "or", "on", "senior", "junior",
  "lead", "manager", "engineer", "developer", "remote", "full", "time", "part",
]);

function tokens(text: string) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/** Keywords from the latest resume: skills, past roles, and summary words. */
function keywordsFromResume(resume: ResumeFormData | null) {
  if (!resume) return new Set<string>();
  const words = new Set<string>();
  for (const skill of resume.skills || []) tokens(skill).forEach((t) => words.add(t));
  for (const exp of resume.experience || []) tokens(exp.role || "").forEach((t) => words.add(t));
  tokens(resume.personalInfo?.summary || "").forEach((t) => words.add(t));
  return words;
}

function scoreJob(job: Job, keywords: Set<string>) {
  if (keywords.size === 0) return 0;
  let score = 0;
  for (const t of tokens(job.title)) if (keywords.has(t)) score += 3;
  for (const t of tokens(job.type)) if (keywords.has(t)) score += 1;
  return score;
}

export function RecommendedJobs() {
  const { supabase, user } = useSupabase();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [matched, setMatched] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [jobsRes, resumeRes] = await Promise.all([
        fetch("/api/jobs?query=", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
        user
          ? supabase
              .from("resumes")
              .select("data")
              .eq("user_id", user.id)
              .order("updated_at", { ascending: false })
              .limit(1)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      if (cancelled) return;

      const allJobs = (Array.isArray(jobsRes?.data) ? jobsRes.data : []) as Job[];
      const keywords = keywordsFromResume((resumeRes?.data?.data as ResumeFormData | undefined) || null);

      const ranked = allJobs
        .map((job) => ({ job, score: scoreJob(job, keywords) }))
        .sort((a, b) => b.score - a.score);

      const hasMatches = ranked.some((r) => r.score > 0);
      setMatched(hasMatches);
      setJobs((hasMatches ? ranked.filter((r) => r.score > 0) : ranked).slice(0, 3).map((r) => r.job));
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [supabase, user]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Building2 className="h-5 w-5 text-primary" />
          Recommended Jobs
        </CardTitle>
        <CardDescription>
          {matched
            ? "Matched to the skills and roles on your latest resume."
            : "Latest roles from the jobs feed. Add skills to your resume to get matches."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-20 animate-pulse rounded-[1.25rem] bg-muted/60" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No jobs available right now.{" "}
            <Link href="/dashboard/jobs" className="font-medium text-primary hover:underline">
              Browse jobs
            </Link>
            .
          </p>
        ) : (
          jobs.map((job) => (
            <a
              key={job.id}
              href={job.link}
              target="_blank"
              rel="noreferrer"
              className="flex items-start justify-between gap-3 rounded-[1.25rem] border border-border/80 bg-background/45 p-4 transition-colors hover:border-primary/40"
            >
              <div className="min-w-0">
                <h4 className="truncate font-medium">{job.title}</h4>
                <p className="text-sm text-muted-foreground">{job.company}</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{job.location}</span>
                </div>
              </div>
              <Badge variant="secondary" className="shrink-0 bg-info/15 text-info">
                {job.type}
              </Badge>
            </a>
          ))
        )}
      </CardContent>
    </Card>
  );
}
