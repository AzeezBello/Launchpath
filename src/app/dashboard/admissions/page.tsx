"use client";

import { useCallback, useState } from "react";
import { Loader2, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { OpportunityCard, OpportunityGridSkeleton } from "@/components/opportunities/OpportunityCard";
import { useOpportunitySearch } from "@/lib/hooks/useOpportunitySearch";

interface Admission {
  id: string;
  name: string;
  country: string;
  field: string;
  website: string;
}

export default function AdmissionsPage() {
  const [country, setCountry] = useState("");
  const [field, setField] = useState("");
  const buildUrl = useCallback(
    (params: Record<string, string>) =>
      `/api/admissions?country=${encodeURIComponent(params.country || "")}&field=${encodeURIComponent(params.field || "")}`,
    []
  );
  const { items, loading, error, search } = useOpportunitySearch<Admission>(buildUrl);

  const handleSearch = () => search({ country, field });
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="space-y-8">
      <PageHeader
        icon={Users}
        title="Admissions Finder"
        description="Explore universities and programs by country and field of study."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Country (e.g. Nigeria)"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          onKeyDown={handleKeyDown}
          className="sm:max-w-xs"
        />
        <Input
          placeholder="Field (e.g. Engineering)"
          value={field}
          onChange={(e) => setField(e.target.value)}
          onKeyDown={handleKeyDown}
          className="sm:max-w-xs"
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Search
        </Button>
      </div>

      {loading ? (
        <OpportunityGridSkeleton />
      ) : error ? (
        <EmptyState icon={Users} title="Couldn't load admissions" description={error} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No admissions found"
          description="Try a different country or field."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((u, i) => (
            <OpportunityCard
              key={u.id}
              index={i}
              title={u.name}
              href={u.website}
              linkLabel="Visit website"
              meta={[
                { label: "Country", value: u.country },
                { label: "Field", value: u.field },
              ]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
