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
 * Pipeline analytics for the overview. One series per chart, so a single
 * hue carries magnitude and no legend is needed: a horizontal funnel of
 * counts, three rate tiles, and an 8-week column strip of new applications.
 * Bars are <= 24px thick with a rounded data-end and a hover tooltip; a
 * screen-reader table mirrors every value.
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
          <TrendingUp className="h-5 w-5 text-primary" />
          Pipeline
        </CardTitle>
        <CardDescription>How your applications convert, and how many you started each week.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error ? (
          <p className="text-sm text-muted-foreground">Couldn&apos;t load pipeline stats right now.</p>
        ) : !stats ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-6 animate-pulse rounded-full bg-muted/60" />
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
            {/* Funnel: horizontal bars, single hue, value at the tip */}
            <div className="space-y-2" role="img" aria-label="Application funnel by stage">
              {stats.funnel.map((row) => {
                const widthPct = Math.max(row.count > 0 ? 3 : 0, Math.round((row.count / maxFunnel) * 100));
                return (
                  <div key={row.stage} className="grid grid-cols-[92px_1fr_32px] items-center gap-3 text-sm">
                    <span className="truncate text-muted-foreground">{row.stage}</span>
                    <div className="h-4 w-full rounded-r-[4px] bg-muted/50">
                      <div
                        className="h-4 rounded-r-[4px] bg-primary transition-[width] duration-500"
                        style={{ width: `${widthPct}%` }}
                        title={`${row.stage}: ${row.count}`}
                      />
                    </div>
                    <span className="text-right font-medium tabular-nums">{row.count}</span>
                  </div>
                );
              })}
            </div>

            {/* Rate tiles */}
            <div className="grid grid-cols-3 gap-2">
              {tiles.map((tile) => (
                <div key={tile.label} className="rounded-[1.1rem] border border-border/80 bg-background/45 px-3 py-3">
                  <p className="text-xs text-muted-foreground">{tile.label}</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">
                    {tile.value === null ? "—" : `${tile.value}%`}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{tile.hint}</p>
                </div>
              ))}
            </div>

            {/* Weekly volume: 8 columns, single hue, current week emphasised */}
            <div>
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>New applications per week</span>
                <span>last 8 weeks</span>
              </div>
              <div className="flex h-16 items-end gap-1.5" role="img" aria-label="New applications per week, last 8 weeks">
                {stats.weekly.map((week, i) => {
                  const isCurrent = i === stats.weekly.length - 1;
                  const heightPct = week.count === 0 ? 0 : Math.max(8, Math.round((week.count / maxWeekly) * 100));
                  return (
                    <div key={week.weekStart} className="flex h-full flex-1 flex-col justify-end">
                      <div
                        className={cn(
                          "w-full max-w-[24px] rounded-t-[4px] transition-[height] duration-500",
                          isCurrent ? "bg-primary" : "bg-primary/45",
                          week.count === 0 && "h-px bg-border"
                        )}
                        style={week.count > 0 ? { height: `${heightPct}%` } : undefined}
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
