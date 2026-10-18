"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarClock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeadlineBadge } from "@/components/dashboard/DeadlineBadge";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

type UpcomingApplication = {
  id: string;
  program: string;
  status: string;
  deadline: string | null;
};

export function UpcomingDeadlines() {
  const [rows, setRows] = useState<UpcomingApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/applications?upcoming=1&limit=5", { cache: "no-store", signal: controller.signal })
      .then((res) => res.json())
      .then((payload) => {
        if (!payload?.success) throw new Error(payload?.error || "Failed");
        setRows(Array.isArray(payload.data) ? payload.data : []);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error(err);
        setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <CalendarClock className="h-5 w-5 text-primary" />
          Due soon
        </CardTitle>
        <CardDescription>Open applications with the nearest deadlines.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-14 animate-pulse rounded-[1.25rem] bg-muted/60" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground">Couldn&apos;t load deadlines right now.</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing due. Add a deadline to an application and it will show up here.{" "}
            <Link href="/dashboard/applications" className="font-medium text-primary hover:underline">
              Open applications
            </Link>
            .
          </p>
        ) : (
          <>
            {rows.map((row) => (
              <div
                key={row.id}
                className="flex items-start justify-between gap-3 rounded-[1.25rem] border border-border/80 bg-background/45 p-4"
              >
                <div className="min-w-0">
                  <h4 className="truncate font-medium">{row.program}</h4>
                  <div className="mt-1.5">
                    <StatusBadge status={row.status} />
                  </div>
                </div>
                <DeadlineBadge value={row.deadline} className="shrink-0" />
              </div>
            ))}
            <Button variant="ghost" className="px-0" asChild>
              <Link href="/dashboard/applications">
                View all applications
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
