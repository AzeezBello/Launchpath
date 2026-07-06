"use client";

import { useCallback, useState } from "react";
import { GraduationCap, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { OpportunityCard, OpportunityGridSkeleton } from "@/components/opportunities/OpportunityCard";
import { useOpportunitySearch } from "@/lib/hooks/useOpportunitySearch";

interface Scholarship {
  id: string;
  title: string;
  provider: string;
  country: string;
  deadline?: string;
  link: string;
}

export default function ScholarshipsPage() {
  const [query, setQuery] = useState("");
  const buildUrl = useCallback(
    (params: Record<string, string>) => `/api/scholarships?query=${encodeURIComponent(params.query || "")}`,
    []
  );
  const { items, loading, error, search } = useOpportunitySearch<Scholarship>(buildUrl);

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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-md sm:flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by keyword, course, or country..."
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
        <EmptyState icon={GraduationCap} title="Couldn't load scholarships" description={error} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No scholarships found"
          description="Try a different keyword or country."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((sch, i) => (
            <OpportunityCard
              key={sch.id}
              index={i}
              title={sch.title}
              href={sch.link}
              linkLabel="Learn more"
              meta={[
                { label: "Provider", value: sch.provider },
                { label: "Country", value: sch.country },
                ...(sch.deadline ? [{ label: "Deadline", value: sch.deadline }] : []),
              ]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
