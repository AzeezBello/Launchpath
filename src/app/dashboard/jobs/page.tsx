"use client";

import { useCallback, useMemo, useState } from "react";
import { BriefcaseBusiness, ListFilter, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { OpportunityCard, OpportunityGridSkeleton } from "@/components/opportunities/OpportunityCard";
import { FilterSelect, facetOptions } from "@/components/opportunities/FilterSelect";
import { useOpportunitySearch } from "@/lib/hooks/useOpportunitySearch";
import { useOpportunityActions } from "@/lib/hooks/useOpportunityActions";
import { opportunityDetailHref } from "@/lib/opportunity-links";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  link: string;
  source?: string;
}

const PAGE_SIZE = 30;

export default function JobsPage() {
  const [query, setQuery] = useState("");
  const [jobType, setJobType] = useState("");
  const [source, setSource] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [shown, setShown] = useState(PAGE_SIZE);

  const buildUrl = useCallback(
    (params: Record<string, string>) => `/api/jobs?query=${encodeURIComponent(params.query || "")}`,
    []
  );
  const { items, loading, error, search } = useOpportunitySearch<Job>(buildUrl);
  const { isSaved, isApplied, isPending, toggleSave, applyToOpportunity } = useOpportunityActions();

  const types = useMemo(() => facetOptions(items, (j) => j.type), [items]);
  const sources = useMemo(() => facetOptions(items, (j) => j.source || "Curated"), [items]);

  const visible = useMemo(() => {
    const loc = locationFilter.trim().toLowerCase();
    return items.filter((j) => {
      if (jobType && j.type !== jobType) return false;
      if (source && (j.source || "Curated") !== source) return false;
      if (loc && !j.location.toLowerCase().includes(loc)) return false;
      return true;
    });
  }, [items, jobType, source, locationFilter]);

  const handleSearch = () => {
    setShown(PAGE_SIZE);
    search({ query: query.trim() });
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="space-y-8">
      <PageHeader
        icon={BriefcaseBusiness}
        title="Explore Jobs"
        description="Live remote roles plus curated teams worth applying to."
      />

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:max-w-md sm:flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title, company, or location..."
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
          <FilterSelect label="Job type" value={jobType} onChange={setJobType} options={types} allLabel="All types" />
          <FilterSelect label="Source" value={source} onChange={setSource} options={sources} allLabel="All sources" />
          <Input
            placeholder="Location contains..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="h-9 max-w-[220px] rounded-xl px-3 text-xs"
          />
          {!loading && !error && (
            <span className="text-xs text-muted-foreground">
              {visible.length} of {items.length}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <OpportunityGridSkeleton />
      ) : error ? (
        <EmptyState icon={BriefcaseBusiness} title="Couldn't load jobs" description={error} />
      ) : visible.length === 0 ? (
        <EmptyState icon={BriefcaseBusiness} title="No jobs match" description="Try a different search or clear a filter." />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.slice(0, shown).map((job, i) => (
              <OpportunityCard
                key={job.id}
                index={i}
                title={job.title}
                href={job.link}
                linkLabel="View job"
                detailHref={opportunityDetailHref("job", job.id)}
                meta={[
                  { label: "Company", value: job.company },
                  { label: "Location", value: job.location },
                  { label: "Type", value: job.type },
                  ...(job.source ? [{ label: "Source", value: job.source }] : []),
                ]}
                saved={isSaved(job.id, "job")}
                applied={isApplied(job.id, "job")}
                pending={isPending(job.id, "job")}
                onToggleSave={() =>
                  toggleSave({
                    opportunityId: job.id,
                    opportunityType: "job",
                    title: job.title,
                    meta: { company: job.company, location: job.location, type: job.type, href: job.link },
                  })
                }
                onApply={() =>
                  applyToOpportunity({
                    opportunityId: job.id,
                    opportunityType: "job",
                    title: `${job.title} @ ${job.company}`,
                    url: job.link,
                  })
                }
              />
            ))}
          </div>
          {visible.length > shown && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => setShown((n) => n + PAGE_SIZE)}>
                Show more ({visible.length - shown} left)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
