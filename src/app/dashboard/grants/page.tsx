"use client";

import { useCallback, useState } from "react";
import { HandCoins, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { OpportunityCard, OpportunityGridSkeleton } from "@/components/opportunities/OpportunityCard";
import { useOpportunitySearch } from "@/lib/hooks/useOpportunitySearch";

interface Grant {
  id: string;
  title: string;
  organization: string;
  amount?: string;
  country: string;
  link: string;
}

export default function GrantsPage() {
  const [query, setQuery] = useState("");
  const buildUrl = useCallback(
    (params: Record<string, string>) => `/api/grants?query=${encodeURIComponent(params.query || "")}`,
    []
  );
  const { items, loading, error, search } = useOpportunitySearch<Grant>(buildUrl);

  const handleSearch = () => search({ query: query.trim() });
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="space-y-8">
      <PageHeader
        icon={HandCoins}
        title="Global Grants"
        description="Discover funding opportunities and grants from around the world."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-md sm:flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by category, sector, or country..."
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
        <EmptyState icon={HandCoins} title="Couldn't load grants" description={error} />
      ) : items.length === 0 ? (
        <EmptyState icon={HandCoins} title="No grants found" description="Try a different search term." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((grant, i) => (
            <OpportunityCard
              key={grant.id}
              index={i}
              title={grant.title}
              href={grant.link}
              linkLabel="View details"
              meta={[
                { label: "Organization", value: grant.organization },
                ...(grant.amount ? [{ label: "Amount", value: grant.amount }] : []),
                { label: "Country", value: grant.country },
              ]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
