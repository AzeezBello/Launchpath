"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export type OpportunityMeta = { label: string; value: string };

export function OpportunityCard({
  title,
  meta,
  href,
  linkLabel = "View details",
  index = 0,
}: {
  title: string;
  meta: OpportunityMeta[];
  href: string;
  linkLabel?: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
      className="h-full"
    >
      <Card className="hover-card h-full">
        <CardHeader>
          <CardTitle className="text-lg leading-snug">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {meta.map((row) => (
            <p key={row.label}>
              <span className="font-medium text-foreground">{row.label}:</span> {row.value}
            </p>
          ))}
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 pt-2 font-medium text-primary hover:underline"
          >
            {linkLabel}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
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
