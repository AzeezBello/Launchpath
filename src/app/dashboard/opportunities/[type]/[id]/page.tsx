"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Check,
  GraduationCap,
  HandCoins,
  Loader2,
  Mail,
  Rocket,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { DeadlineBadge } from "@/components/dashboard/DeadlineBadge";
import { useOpportunityActions } from "@/lib/hooks/useOpportunityActions";
import { coverLetterHrefFor } from "@/lib/opportunity-links";
import type { OpportunityType } from "@/lib/types";

type Detail = {
  id: string;
  type: OpportunityType;
  title: string;
  subtitle: string;
  href: string;
  country?: string;
  deadline?: string;
  amount?: string;
  level?: string;
  fields?: string[];
  description?: string;
  source: string;
  meta: { label: string; value: string }[];
  bookmarkMeta: Record<string, string>;
};

const TYPE_META: Record<OpportunityType, { icon: LucideIcon; label: string; listHref: string; linkLabel: string }> = {
  scholarship: { icon: GraduationCap, label: "Scholarship", listHref: "/dashboard/scholarships", linkLabel: "Apply on provider site" },
  grant: { icon: HandCoins, label: "Grant", listHref: "/dashboard/grants", linkLabel: "View on funder site" },
  job: { icon: Briefcase, label: "Job", listHref: "/dashboard/jobs", linkLabel: "View job posting" },
  admission: { icon: Rocket, label: "Admissions", listHref: "/dashboard/admissions", linkLabel: "Visit programme website" },
};

export default function OpportunityDetailPage() {
  const params = useParams();
  const type = (typeof params.type === "string" ? params.type : "") as OpportunityType;
  const id = typeof params.id === "string" ? decodeURIComponent(params.id) : "";

  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSaved, isApplied, isPending, toggleSave, applyToOpportunity } = useOpportunityActions();

  useEffect(() => {
    if (!type || !id) return;
    let cancelled = false;

    fetch(`/api/opportunities/${type}/${encodeURIComponent(id)}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((payload) => {
        if (cancelled) return;
        if (!payload?.success) throw new Error(payload?.error || "Not found");
        setDetail(payload.data as Detail);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not load this opportunity");
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [type, id]);

  const typeMeta = TYPE_META[type] || TYPE_META.job;
  const Icon = typeMeta.icon;

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-14 w-80" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Button variant="ghost" asChild className="px-0">
          <Link href={typeMeta.listHref}>
            <ArrowLeft className="h-4 w-4" />
            Back to {typeMeta.label.toLowerCase()}s
          </Link>
        </Button>
        <EmptyState
          icon={Icon}
          title="Opportunity not found"
          description={error || "It may have expired or been removed from the feed."}
        />
      </div>
    );
  }

  const saved = isSaved(detail.id, detail.type);
  const applied = isApplied(detail.id, detail.type);
  const pending = isPending(detail.id, detail.type);
  const ref = {
    opportunityId: detail.id,
    opportunityType: detail.type,
    title: detail.type === "job" ? `${detail.title} @ ${detail.subtitle}` : detail.title,
    meta: detail.bookmarkMeta,
    deadline: detail.deadline,
    url: detail.href,
  };
  const letterHref =
    detail.type === "job"
      ? coverLetterHrefFor(detail.title, detail.subtitle)
      : `/dashboard/essays?new=1&title=${encodeURIComponent(`${detail.title} statement`)}${
          detail.description ? `&prompt=${encodeURIComponent(detail.description.slice(0, 1500))}` : ""
        }`;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button variant="ghost" asChild className="px-0">
        <Link href={typeMeta.listHref}>
          <ArrowLeft className="h-4 w-4" />
          Back to {typeMeta.label.toLowerCase()}s
        </Link>
      </Button>

      <PageHeader
        icon={Icon}
        title={detail.title}
        description={detail.subtitle}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={saved ? "secondary" : "outline"}
              onClick={() => toggleSave(ref)}
              disabled={pending}
              aria-pressed={saved}
            >
              {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              {saved ? "Saved" : "Save"}
            </Button>
            <Button
              variant={applied ? "secondary" : "default"}
              onClick={() => applyToOpportunity(ref)}
              disabled={pending || applied}
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : applied ? <Check className="h-4 w-4" /> : null}
              {applied ? "Tracking" : "Apply & track"}
            </Button>
          </div>
        }
      />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{typeMeta.label}</Badge>
              <Badge variant="outline" className="normal-case tracking-normal">
                Source: {detail.source}
              </Badge>
              <DeadlineBadge value={detail.deadline} />
            </div>
            <CardTitle className="mt-3 text-lg">About this opportunity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {detail.description ? (
              <p className="text-sm leading-relaxed text-muted-foreground">{detail.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Full details are on the {detail.source === "Curated" ? "provider's" : "source"} site. Save this to
                revisit it, or apply and track it in your pipeline.
              </p>
            )}

            {detail.fields && detail.fields.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {detail.fields.map((field) => (
                  <Badge key={field} variant="secondary" className="normal-case tracking-normal">
                    {field}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button asChild>
                <a href={detail.href} target="_blank" rel="noreferrer">
                  {typeMeta.linkLabel}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link href={letterHref}>
                  <Mail className="h-4 w-4" />
                  {detail.type === "job" ? "Draft a cover letter" : "Draft a statement"}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              {detail.meta.map((row) => (
                <div key={row.label} className="flex flex-col gap-0.5 border-b border-border/60 pb-3 last:border-0 last:pb-0">
                  <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{row.label}</dt>
                  <dd className="font-medium">{row.value}</dd>
                </div>
              ))}
              {detail.deadline && (
                <div className="flex flex-col gap-0.5">
                  <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Deadline</dt>
                  <dd className="font-medium">{detail.deadline}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
