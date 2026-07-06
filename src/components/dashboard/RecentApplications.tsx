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
          <Briefcase className="h-5 w-5 text-primary" />
          Recent Applications
        </CardTitle>
        <CardDescription>
          A quick look at where current submissions stand.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-16 animate-pulse rounded-[1.25rem] bg-muted/60" />
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
              className="flex items-start justify-between gap-3 rounded-[1.25rem] border border-border/80 bg-background/45 p-4"
            >
              <div>
                <h4 className="font-medium">{app.program}</h4>
                <p className="text-xs text-muted-foreground mt-1">{app.date}</p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <StatusBadge status={app.status} showIcon />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
