"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";

interface Scholarship {
  id: string;
  title: string;
  provider: string;
  country: string;
  deadline?: string;
  link: string;
}

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchScholarships = async (query = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/scholarships?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      setScholarships(data?.results || []);
    } catch (error) {
      console.error("Error fetching scholarships:", error);
      setScholarships([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchScholarships();
  }, []);

  const handleSearch = () => fetchScholarships(search.trim());
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">🎓 Global Scholarships</h2>
        <p className="text-white/70 text-sm">
          Explore funding opportunities for your studies worldwide.
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex justify-center gap-3 mb-10">
        <Input
          placeholder="Search by keyword, course, or country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="max-w-md bg-white/10 border-white/20 text-white placeholder:text-white/50"
        />
        <Button
          onClick={handleSearch}
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

      {/* Results Section */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-white/70" />
        </div>
      ) : scholarships.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {scholarships.map((sch) => (
            <Card
              key={sch.id}
              className="bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:shadow-lg hover:border-emerald-400/40 transition"
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{sch.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-white/80">
                <p>
                  <span className="font-medium text-white">Provider:</span> {sch.provider}
                </p>
                <p>
                  <span className="font-medium text-white">Country:</span> {sch.country}
                </p>
                {sch.deadline && (
                  <p>
                    <span className="font-medium text-white">Deadline:</span> {sch.deadline}
                  </p>
                )}
                <a
                  href={sch.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  Learn more →
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-white/60 py-10">No scholarships found.</p>
      )}
    </div>
  );
}
