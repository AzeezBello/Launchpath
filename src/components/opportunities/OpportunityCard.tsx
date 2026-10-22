"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Bookmark, BookmarkCheck, Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { DeadlineBadge } from "@/components/dashboard/DeadlineBadge";

export type OpportunityMeta = { label: string; value: string };

export function OpportunityCard({
  title,
  meta,
  href,
  linkLabel = "View details",
  index = 0,
  deadline,
  detailHref,
  saved,
  applied,
  pending,
  onToggleSave,
  onApply,
}: {
  title: string;
  meta: OpportunityMeta[];
  href: string;
  linkLabel?: string;
  index?: number;
  /** Free-text or ISO deadline; rendered as a due-soon / passed chip. */
  deadline?: string | null;
  /** In-app detail page; when set, the title becomes a link. */
  detailHref?: string;
  saved?: boolean;
  applied?: boolean;
  pending?: boolean;
  onToggleSave?: () => void;
  onApply?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.26,
        delay: Math.min(index * 0.035, 0.24),
        ease: [0.23, 1, 0.32, 1],
      }}
      className="h-full"
    >
      <Card className="hover-card flex h-full flex-col justify-between gap-4 py-5">
        <div className="space-y-3.5">
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 px-5">
            <div className="min-w-0 space-y-2">
              {deadline ? <DeadlineBadge value={deadline} /> : null}
              <CardTitle className="text-base leading-snug">
                {detailHref ? (
                  <Link
                    href={detailHref}
                    className="transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:text-primary"
                  >
                    {title}
                  </Link>
                ) : (
                  title
                )}
              </CardTitle>
            </div>
            {onToggleSave && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={onToggleSave}
                    disabled={pending}
                    aria-pressed={Boolean(saved)}
                    aria-label={saved ? "Remove from saved" : "Save opportunity"}
                    className={cn(
                      "shrink-0 rounded-lg",
                      saved && "border-primary/30 bg-primary/12 text-primary hover:bg-primary/18 hover:text-primary"
                    )}
                  >
                    {saved ? <BookmarkCheck className="size-3.5" /> : <Bookmark className="size-3.5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{saved ? "Remove from saved" : "Save for later"}</TooltipContent>
              </Tooltip>
            )}
          </CardHeader>

          <CardContent className="px-5">
            <dl className="divide-y divide-border/60 rounded-xl border border-border/70 bg-background/45 px-3.5 py-1 text-xs">
              {meta.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 py-1.5">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                    {row.label}
                  </dt>
                  <dd className="truncate font-medium text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </div>

        <CardFooter className="flex flex-wrap items-center justify-between gap-2 border-t border-border/65 px-5 pt-3.5">
          <div className="flex items-center gap-3 text-xs">
            {detailHref && (
              <Link
                href={detailHref}
                className="font-semibold text-foreground transition-colors hover:text-primary"
              >
                Details
              </Link>
            )}
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              {linkLabel}
              <ArrowUpRight className="size-3.5" />
            </a>
          </div>
          {onApply && (
            <Button
              size="sm"
              variant={applied ? "secondary" : "default"}
              disabled={pending || applied}
              onClick={onApply}
            >
              {pending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : applied ? (
                <Check className="size-3.5" />
              ) : null}
              {applied ? "Applied" : "Apply"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export function OpportunityGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-52 w-full rounded-2xl" />
      ))}
    </div>
  );
}
