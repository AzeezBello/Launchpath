"use client";

import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";

interface Grant {
  id: string;
  title: string;
  organization: string;
  amount?: string;
  country: string;
  link: string;
}

export default function GrantsPage() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Fetch Grants ---
  const fetchGrants = useCallback(async (searchTerm = "") => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/grants?query=${encodeURIComponent(searchTerm)}`);
      if (!res.ok) throw new Error("Failed to fetch grants");

      const data = await res.json();
      setGrants(data?.results || []);
    } catch (err) {
      console.error("Error fetching grants:", err);
      setError("Unable to load grants. Please try again later.");
      setGrants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Initial fetch ---
  useEffect(() => {
    fetchGrants();
  }, [fetchGrants]);

  // --- Trigger search on Enter ---
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") fetchGrants(query);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">💰 Global Grants</h2>
        <p className="text-white/70 text-sm">
          Discover funding opportunities and grants around the world.
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex justify-center gap-3 mb-10">
        <Input
          placeholder="Search by category, sector, or country..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="max-w-md bg-white/10 border-white/20 text-white placeholder:text-white/50"
        />
        <Button
          onClick={() => fetchGrants(query)}
          disabled={loading}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          {loading ? (
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
          ) : (
            <Search className="mr-2 h-4 w-4" />
          )}
          Search
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-white/70" />
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <p className="text-center text-red-400 py-6">{error}</p>
      )}

      {/* Results */}
      {!loading && !error && (
        <>
          {grants.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {grants.map((grant) => (
                <Card
                  key={grant.id}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:shadow-lg hover:border-emerald-400/40 transition"
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">{grant.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-white/80">
                    <p>
                      <span className="font-medium text-white">Organization:</span>{" "}
                      {grant.organization}
                    </p>
                    {grant.amount && (
                      <p>
                        <span className="font-medium text-white">Amount:</span>{" "}
                        {grant.amount}
                      </p>
                    )}
                    <p>
                      <span className="font-medium text-white">Country:</span>{" "}
                      {grant.country}
                    </p>
                    <a
                      href={grant.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-emerald-400 hover:text-emerald-300 font-medium"
                    >
                      View details →
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-white/60 py-10">
              No grants found for your search.
            </p>
          )}
        </>
      )}
    </div>
  );
}
