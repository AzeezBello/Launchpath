"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

interface Application {
  id: string;
  program: string;
  status: string;
  date: string;
}

export function RecentApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(false);

      try {
        const res = await fetch("/api/applications?page=1&limit=4", {
          cache: "no-store",
          signal: controller.signal,
        });
        const payload = await res.json();

        if (!res.ok || !payload.success) {
          throw new Error(payload?.error || "Failed to load applications");
        }

        setApplications(payload.data || []);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error(err);
        setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Briefcase className="size-5 text-primary" />
          Recent Submissions
        </CardTitle>
        <CardDescription>
          A quick look at where current applications stand.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {loading ? (
          <div className="space-y-2.5">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-14 animate-pulse rounded-xl bg-muted/60" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground">
            Couldn&apos;t load your applications right now.
          </p>
        ) : applications.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No applications yet.{" "}
            <Link href="/dashboard/applications" className="font-medium text-primary hover:underline">
              Track your first one
            </Link>
            .
          </p>
        ) : (
          applications.map((app) => (
            <div
              key={app.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-border/80 bg-background/50 p-3.5 transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-border"
            >
              <div className="min-w-0">
                <h4 className="truncate text-sm font-semibold">{app.program}</h4>
                <p className="mt-1 font-mono text-[11px] tabular-nums text-muted-foreground">
                  {app.date}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 pt-0.5">
                <StatusBadge status={app.status} showIcon />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
