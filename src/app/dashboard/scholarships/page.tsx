"use client";

import { useCallback, useMemo, useState } from "react";
import { GraduationCap, ListFilter, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { OpportunityCard, OpportunityGridSkeleton } from "@/components/opportunities/OpportunityCard";
import { FilterSelect, facetOptions } from "@/components/opportunities/FilterSelect";
import { useOpportunitySearch } from "@/lib/hooks/useOpportunitySearch";
import { useOpportunityActions } from "@/lib/hooks/useOpportunityActions";
import { describeDeadline } from "@/lib/deadlines";
import { opportunityDetailHref } from "@/lib/opportunity-links";

interface Scholarship {
  id: string;
  title: string;
  provider: string;
  country: string;
  deadline?: string;
  amount?: string;
  level?: string;
  fields?: string[];
  link: string;
}

export default function ScholarshipsPage() {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [level, setLevel] = useState("");
  const [hidePassed, setHidePassed] = useState(true);

  const buildUrl = useCallback(
    (params: Record<string, string>) => `/api/scholarships?query=${encodeURIComponent(params.query || "")}`,
    []
  );
  const { items, loading, error, search } = useOpportunitySearch<Scholarship>(buildUrl);
  const { isSaved, isApplied, isPending, toggleSave, applyToOpportunity } = useOpportunityActions();

  const countries = useMemo(() => facetOptions(items, (s) => s.country), [items]);
  const levels = useMemo(() => facetOptions(items, (s) => s.level), [items]);

  const visible = useMemo(
    () =>
      items.filter((s) => {
        if (country && s.country !== country) return false;
        if (level && s.level !== level && s.level !== "All") return false;
        if (hidePassed && describeDeadline(s.deadline).passed) return false;
        return true;
      }),
    [items, country, level, hidePassed]
  );

  const hiddenPassed = hidePassed ? items.filter((s) => describeDeadline(s.deadline).passed).length : 0;

  const handleSearch = () => search({ query: query.trim() });
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="space-y-8">
      <PageHeader
        icon={GraduationCap}
        title="Global Scholarships"
        description="Explore funding opportunities for your studies worldwide."
      />

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:max-w-md sm:flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by keyword, provider, or country..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ListFilter className="h-4 w-4 text-muted-foreground" />
          <FilterSelect label="Country" value={country} onChange={setCountry} options={countries} allLabel="All countries" />
          <FilterSelect label="Level" value={level} onChange={setLevel} options={levels} allLabel="All levels" />
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={hidePassed}
              onChange={(e) => setHidePassed(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-input accent-primary"
            />
            Hide passed deadlines
            {hiddenPassed > 0 && <span className="text-muted-foreground/70">({hiddenPassed} hidden)</span>}
          </label>
        </div>
      </div>

      {loading ? (
        <OpportunityGridSkeleton />
      ) : error ? (
        <EmptyState icon={GraduationCap} title="Couldn't load scholarships" description={error} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No scholarships match"
          description={
            hiddenPassed > 0
              ? "Every match has a passed deadline. Untick the filter to see them; most reopen annually."
              : "Try a different keyword, country, or level."
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((sch, i) => (
            <OpportunityCard
              key={sch.id}
              index={i}
              title={sch.title}
              href={sch.link}
              linkLabel="Learn more"
              detailHref={opportunityDetailHref("scholarship", sch.id)}
              deadline={sch.deadline}
              meta={[
                { label: "Provider", value: sch.provider },
                { label: "Country", value: sch.country },
                ...(sch.amount ? [{ label: "Funding", value: sch.amount }] : []),
                ...(sch.level ? [{ label: "Level", value: sch.level }] : []),
              ]}
              saved={isSaved(sch.id, "scholarship")}
              applied={isApplied(sch.id, "scholarship")}
              pending={isPending(sch.id, "scholarship")}
              onToggleSave={() =>
                toggleSave({
                  opportunityId: sch.id,
                  opportunityType: "scholarship",
                  title: sch.title,
                  meta: { provider: sch.provider, country: sch.country, deadline: sch.deadline || "", href: sch.link },
                })
              }
              onApply={() =>
                applyToOpportunity({
                  opportunityId: sch.id,
                  opportunityType: "scholarship",
                  title: sch.title,
                  deadline: sch.deadline,
                  url: sch.link,
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
