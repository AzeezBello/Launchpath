"use client";

import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";
import { motion } from "framer-motion";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  link: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs?query=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      const data = await res.json();
      setJobs(data?.results || []);
    } catch (err: unknown) {
      console.error("Error fetching jobs:", err);
      setError("Unable to fetch jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
          💼 Explore Jobs
        </h2>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, field, or location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-white/10 backdrop-blur-xl border border-white/20 focus:ring-2 focus:ring-emerald-400"
          />
        </div>
        <Button
          onClick={fetchJobs}
          disabled={loading}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" /> Searching...
            </>
          ) : (
            "Search"
          )}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-center mb-4">{error}</p>
      )}

      {/* Job Cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin h-6 w-6 text-emerald-400" />
        </div>
      ) : jobs.length > 0 ? (
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {jobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 hover:shadow-lg hover:shadow-emerald-400/10 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-white">
                    {job.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-200 space-y-1">
                  <p><span className="font-medium text-gray-300">Company:</span> {job.company}</p>
                  <p><span className="font-medium text-gray-300">Location:</span> {job.location}</p>
                  <p><span className="font-medium text-gray-300">Type:</span> {job.type}</p>
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 mt-3 inline-block hover:underline"
                  >
                    View job →
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <p className="text-center text-muted-foreground mt-10">
          No jobs found. Try a different search.
        </p>
      )}
    </div>
  );
}
