"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSupabase } from "@/providers/SupabaseProvider";
import type { ResumeFormData } from "@/types/resume";

function scoreResume(data: ResumeFormData | null | undefined) {
  if (!data) return 0;

  const checks = [
    Boolean(data.personalInfo?.name && data.personalInfo?.email),
    Boolean(data.personalInfo?.summary),
    Boolean(data.education && data.education.length > 0),
    Boolean(data.experience && data.experience.length > 0),
    Boolean(data.skills && data.skills.length > 0),
  ];

  const passed = checks.filter(Boolean).length;
  return Math.round((passed / checks.length) * 100);
}

export function ResumeScoreCard() {
  const { supabase, user } = useSupabase();
  const [score, setScore] = useState<number | null>(null);
  const [hasResume, setHasResume] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      const { data, error } = await supabase
        .from("resumes")
        .select("data")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        setScore(0);
        setHasResume(false);
        return;
      }

      setHasResume(true);
      setScore(scoreResume(data.data as ResumeFormData));
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
          <FileText className="h-5 w-5 text-primary" />
          Resume Score
        </CardTitle>
        <CardDescription>
          A quick quality signal based on your most recently updated resume.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {score === null ? (
          <div className="space-y-3">
            <div className="h-9 w-16 animate-pulse rounded-md bg-muted/70" />
            <div className="h-2 w-full animate-pulse rounded-full bg-muted/60" />
          </div>
        ) : !hasResume ? (
          <p className="text-sm text-muted-foreground">
            No resume yet.{" "}
            <Link href="/dashboard/resume/new" className="font-medium text-primary hover:underline">
              Create one
            </Link>{" "}
            to get a completeness score.
          </p>
        ) : (
          <>
            <div className="mb-3 text-4xl font-bold text-primary">{score}%</div>
            <Progress value={score} className="h-2" />
            <p className="mt-3 text-sm text-muted-foreground">
              Strong formatting, clear outcomes, and role-specific language increase your odds of getting interviews.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
