"use client";

import { useCallback, useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { OpportunityCard, OpportunityGridSkeleton } from "@/components/opportunities/OpportunityCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOpportunityActions } from "@/lib/hooks/useOpportunityActions";
import type { OpportunityType, SavedOpportunityRow } from "@/lib/types";
import { opportunityDetailHref } from "@/lib/opportunity-links";

const FILTERS: { value: OpportunityType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "scholarship", label: "Scholarships" },
  { value: "grant", label: "Grants" },
  { value: "job", label: "Jobs" },
  { value: "admission", label: "Admissions" },
];

const LINK_LABEL: Record<OpportunityType, string> = {
  scholarship: "Learn more",
  grant: "View details",
  job: "View job",
  admission: "Visit website",
};

function metaRowsFor(row: SavedOpportunityRow) {
  const m = row.meta || {};
  switch (row.opportunity_type) {
    case "job":
      return [
        { label: "Company", value: m.company || "—" },
        { label: "Location", value: m.location || "—" },
        { label: "Type", value: m.type || "—" },
      ];
    case "scholarship":
      return [
        { label: "Provider", value: m.provider || "—" },
        { label: "Country", value: m.country || "—" },
        ...(m.deadline ? [{ label: "Deadline", value: m.deadline }] : []),
      ];
    case "grant":
      return [
        { label: "Organization", value: m.organization || "—" },
        ...(m.amount ? [{ label: "Amount", value: m.amount }] : []),
        { label: "Country", value: m.country || "—" },
      ];
    case "admission":
      return [
        { label: "Country", value: m.country || "—" },
        { label: "Field", value: m.field || "—" },
      ];
    default:
      return [];
  }
}

export default function SavedOpportunitiesPage() {
  const [rows, setRows] = useState<SavedOpportunityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<OpportunityType | "all">("all");
  const { isApplied, isPending, applyToOpportunity, toggleSave } = useOpportunityActions();

  const fetchSaved = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bookmarks?limit=100", { cache: "no-store" });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Failed to load saved opportunities");
      setRows(Array.isArray(payload?.data) ? payload.data : []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to load saved opportunities");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const visibleRows = filter === "all" ? rows : rows.filter((row) => row.opportunity_type === filter);

  const handleUnsave = async (row: SavedOpportunityRow) => {
    await toggleSave({
      opportunityId: row.opportunity_id,
      opportunityType: row.opportunity_type,
      title: row.title,
    });
    setRows((prev) => prev.filter((r) => r.id !== row.id));
  };

  return (
    <div className="space-y-8">
      <PageHeader
        icon={Bookmark}
        title="Saved Opportunities"
        description="Scholarships, grants, jobs, and admissions you've bookmarked to revisit or apply to."
      />

      <Tabs value={filter} onValueChange={(value) => setFilter(value as OpportunityType | "all")}>
        <TabsList>
          {FILTERS.map((f) => (
            <TabsTrigger key={f.value} value={f.value}>
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {loading ? (
            <OpportunityGridSkeleton />
          ) : error ? (
            <EmptyState icon={Bookmark} title="Couldn't load saved opportunities" description={error} />
          ) : visibleRows.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="Nothing saved yet"
              description="Tap the bookmark icon on any opportunity card to save it here."
              tips={[
                "Saved opportunities stay here until you apply or remove them.",
                "You can apply straight from a saved card — no need to leave this page.",
              ]}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleRows.map((row, i) => (
                <OpportunityCard
                  key={row.id}
                  index={i}
                  title={row.title}
                  href={row.meta?.href || "#"}
                  linkLabel={LINK_LABEL[row.opportunity_type]}
                  detailHref={opportunityDetailHref(row.opportunity_type, row.opportunity_id)}
                  deadline={row.meta?.deadline}
                  meta={metaRowsFor(row)}
                  saved
                  applied={isApplied(row.opportunity_id, row.opportunity_type)}
                  pending={isPending(row.opportunity_id, row.opportunity_type)}
                  onToggleSave={() => handleUnsave(row)}
                  onApply={() =>
                    applyToOpportunity({
                      opportunityId: row.opportunity_id,
                      opportunityType: row.opportunity_type,
                      title: row.title,
                      deadline: row.meta?.deadline,
                      url: row.meta?.href,
                    })
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
