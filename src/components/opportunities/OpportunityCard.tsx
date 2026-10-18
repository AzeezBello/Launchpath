"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Bookmark, BookmarkCheck, Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
      className="h-full"
    >
      <Card className="hover-card h-full">
        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
          <CardTitle className="text-lg leading-snug">
            {detailHref ? (
              <Link href={detailHref} className="hover:text-primary hover:underline">
                {title}
              </Link>
            ) : (
              title
            )}
          </CardTitle>
          {onToggleSave && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onToggleSave}
                  disabled={pending}
                  aria-pressed={Boolean(saved)}
                  aria-label={saved ? "Remove from saved" : "Save opportunity"}
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors",
                    saved
                      ? "border-primary/25 bg-primary/10 text-primary"
                      : "border-border/80 text-muted-foreground hover:border-primary/25 hover:text-primary",
                    pending && "opacity-60"
                  )}
                >
                  {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent>{saved ? "Remove from saved" : "Save for later"}</TooltipContent>
            </Tooltip>
          )}
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {deadline ? <DeadlineBadge value={deadline} className="mb-1" /> : null}
          {meta.map((row) => (
            <p key={row.label}>
              <span className="font-medium text-foreground">{row.label}:</span> {row.value}
            </p>
          ))}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2">
            {detailHref && (
              <Link href={detailHref} className="font-medium text-foreground hover:text-primary hover:underline">
                Details
              </Link>
            )}
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              {linkLabel}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            {onApply && (
              <Button
                size="sm"
                variant={applied ? "secondary" : "default"}
                disabled={pending || applied}
                onClick={onApply}
              >
                {pending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : applied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : null}
                {applied ? "Applied" : "Apply"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function OpportunityGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-44 w-full" />
      ))}
    </div>
  );
}
