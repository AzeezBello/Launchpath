"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";

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
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Fetch admissions ---
  const fetchData = useCallback(async (c?: string, f?: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/admissions?country=${encodeURIComponent(c || country)}&field=${encodeURIComponent(f || field)}`
      );

      if (!res.ok) throw new Error("Failed to fetch admissions");
      const json = await res.json();
      setAdmissions(json.results || []);
    } catch (err) {
      console.error("Error fetching admissions:", err);
      setError("Unable to load admissions. Please try again later.");
      setAdmissions([]);
    } finally {
      setLoading(false);
    }
  }, [country, field]);

  // --- Initial fetch ---
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Trigger search on Enter ---
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") fetchData();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">🎓 Admissions Finder</h2>
        <p className="text-white/70 text-sm">
          Explore universities and programs by country and field of study.
        </p>
      </div>

      {/* Search Inputs */}
      <div className="flex flex-col md:flex-row justify-center gap-3 mb-10">
        <Input
          placeholder="Country (e.g. Nigeria)"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
        />
        <Input
          placeholder="Field (e.g. Engineering)"
          value={field}
          onChange={(e) => setField(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
        />
        <Button
          onClick={() => fetchData()}
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
          {admissions.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {admissions.map((u) => (
                <Card
                  key={u.id}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:border-emerald-400/40 hover:shadow-lg transition"
                >
                  <CardHeader>
                    <h3 className="font-semibold text-lg">{u.name}</h3>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-white/80">
                    <p>
                      <span className="font-medium text-white">Country:</span> {u.country}
                    </p>
                    <p>
                      <span className="font-medium text-white">Field:</span> {u.field}
                    </p>
                    <a
                      href={u.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-emerald-400 hover:text-emerald-300 font-medium"
                    >
                      Visit Website →
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-white/60 py-10">
              No admissions found. Try a different search.
            </p>
          )}
        </>
      )}
    </div>
  );
}
