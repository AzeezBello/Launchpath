"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Stats = {
  total: number;
  funnel: { stage: string; count: number }[];
  byStatus: Record<string, number>;
  weekly: { weekStart: string; count: number }[];
  rates: { response: number | null; interview: number | null; offer: number | null };
};

/**
 * Pipeline analytics for the overview. Uses GPU-accelerated scaleX/scaleY
 * transforms with Emil Kowalski's custom cubic-bezier(0.23, 1, 0.32, 1) curve
 * and monospace tabular numerals for every metric.
 */
export function PipelineStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/applications/stats", { cache: "no-store", signal: controller.signal })
      .then((res) => res.json())
      .then((payload) => {
        if (!payload?.success) throw new Error(payload?.error || "Failed");
        setStats(payload.data as Stats);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error(err);
        setError(true);
      });
    return () => controller.abort();
  }, []);

  const maxFunnel = stats ? Math.max(1, ...stats.funnel.map((f) => f.count)) : 1;
  const maxWeekly = stats ? Math.max(1, ...stats.weekly.map((w) => w.count)) : 1;

  const tiles = stats
    ? [
        { label: "Response rate", value: stats.rates.response, hint: "Heard back on submitted" },
        { label: "Interview rate", value: stats.rates.interview, hint: "Reached interview or later" },
        { label: "Offer rate", value: stats.rates.offer, hint: "Received an offer" },
      ]
    : [];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <TrendingUp className="size-5 text-primary" />
          Pipeline Conversion
        </CardTitle>
        <CardDescription>How your applications convert, and weekly submission cadence.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error ? (
          <p className="text-sm text-muted-foreground">Couldn&apos;t load pipeline stats right now.</p>
        ) : !stats ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-6 animate-pulse rounded-lg bg-muted/60" />
            ))}
          </div>
        ) : stats.total === 0 ? (
          <p className="text-sm text-muted-foreground">
            No applications tracked yet. Apply from an opportunity card or{" "}
            <Link href="/dashboard/applications" className="font-medium text-primary hover:underline">
              add one
            </Link>{" "}
            to see your funnel.
          </p>
        ) : (
          <>
            {/* Funnel: horizontal bars animated with GPU scaleX */}
            <div className="space-y-2.5" role="img" aria-label="Application funnel by stage">
              {stats.funnel.map((row) => {
                const ratio = Math.max(row.count > 0 ? 0.04 : 0, row.count / maxFunnel);
                return (
                  <div key={row.stage} className="grid grid-cols-[96px_1fr_36px] items-center gap-3 text-xs">
                    <span className="truncate font-medium text-muted-foreground">{row.stage}</span>
                    <div className="h-3.5 w-full overflow-hidden rounded-sm bg-muted/55">
                      <div
                        className="h-full w-full origin-left rounded-sm bg-primary transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
                        style={{ transform: `scaleX(${ratio})` }}
                        title={`${row.stage}: ${row.count}`}
                      />
                    </div>
                    <span className="text-right font-mono text-xs font-semibold tabular-nums text-foreground">
                      {row.count}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Rate tiles */}
            <div className="grid grid-cols-3 gap-2.5">
              {tiles.map((tile) => (
                <div
                  key={tile.label}
                  className="rounded-xl border border-border/80 bg-background/50 px-3 py-3"
                >
                  <p className="text-[11px] font-medium text-muted-foreground">{tile.label}</p>
                  <p className="mt-1 font-mono text-xl font-semibold tabular-nums tracking-tight sm:text-2xl">
                    {tile.value === null ? "—" : `${tile.value}%`}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{tile.hint}</p>
                </div>
              ))}
            </div>

            {/* Weekly volume: 8 columns animated with GPU scaleY */}
            <div>
              <div className="mb-2 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                <span>Weekly volume</span>
                <span>Last 8 weeks</span>
              </div>
              <div
                className="flex h-16 items-end gap-1.5 rounded-xl border border-border/60 bg-background/35 p-2.5"
                role="img"
                aria-label="New applications per week, last 8 weeks"
              >
                {stats.weekly.map((week, i) => {
                  const isCurrent = i === stats.weekly.length - 1;
                  const ratio = week.count === 0 ? 0.04 : Math.max(0.12, week.count / maxWeekly);
                  return (
                    <div key={week.weekStart} className="flex h-full flex-1 flex-col justify-end items-center">
                      <div
                        className={cn(
                          "h-full w-full max-w-[22px] origin-bottom rounded-t-[3px] transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
                          week.count === 0
                            ? "bg-border/80"
                            : isCurrent
                              ? "bg-primary"
                              : "bg-primary/45"
                        )}
                        style={{ transform: `scaleY(${ratio})` }}
                        title={`Week of ${week.weekStart}: ${week.count}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Table view for screen readers */}
            <table className="sr-only">
              <caption>Pipeline stats</caption>
              <tbody>
                {stats.funnel.map((row) => (
                  <tr key={row.stage}>
                    <th scope="row">{row.stage}</th>
                    <td>{row.count}</td>
                  </tr>
                ))}
                {stats.weekly.map((week) => (
                  <tr key={week.weekStart}>
                    <th scope="row">Week of {week.weekStart}</th>
                    <td>{week.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </CardContent>
    </Card>
  );
}
