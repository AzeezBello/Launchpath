"use client";

import { useCallback, useState } from "react";
import { BriefcaseBusiness, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { OpportunityCard, OpportunityGridSkeleton } from "@/components/opportunities/OpportunityCard";
import { useOpportunitySearch } from "@/lib/hooks/useOpportunitySearch";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  link: string;
}

export default function JobsPage() {
  const [query, setQuery] = useState("");
  const buildUrl = useCallback(
    (params: Record<string, string>) => `/api/jobs?query=${encodeURIComponent(params.query || "")}`,
    []
  );
  const { items, loading, error, search } = useOpportunitySearch<Job>(buildUrl);

  const handleSearch = () => search({ query: query.trim() });
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="space-y-8">
      <PageHeader
        icon={BriefcaseBusiness}
        title="Explore Jobs"
        description="Curated roles from teams worth applying to."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-md sm:flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, field, or location..."
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

      {loading ? (
        <OpportunityGridSkeleton />
      ) : error ? (
        <EmptyState icon={BriefcaseBusiness} title="Couldn't load jobs" description={error} />
      ) : items.length === 0 ? (
        <EmptyState icon={BriefcaseBusiness} title="No jobs found" description="Try a different search." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((job, i) => (
            <OpportunityCard
              key={job.id}
              index={i}
              title={job.title}
              href={job.link}
              linkLabel="View job"
              meta={[
                { label: "Company", value: job.company },
                { label: "Location", value: job.location },
                { label: "Type", value: job.type },
              ]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
