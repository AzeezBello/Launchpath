"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

type Application = {
  id: string;
  program: string;
  status: string;
  date: string;
};

const STATUS_OPTIONS = ["Pending Review", "In Review", "Accepted", "Rejected"] as const;

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [program, setProgram] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>("Pending Review");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchApplications = useCallback(async (pageNumber = 1) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/applications?page=${pageNumber}&limit=12`, { cache: "no-store" });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Failed to load applications");

      const rows = Array.isArray(payload?.data) ? payload.data : payload?.results;
      setApplications(Array.isArray(rows) ? rows : []);
      setTotalPages(Number(payload?.meta?.totalPages || 1));
      setPage(pageNumber);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Unable to load applications";
      setError(message);
      setApplications([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications(1);
  }, [fetchApplications]);

  const addApplication = async () => {
    if (!program.trim()) {
      toast.error("Program is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          program: program.trim(),
          status,
          date,
        }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Failed to add application");

      toast.success("Application added");
      setProgram("");
      setStatus("Pending Review");
      setDate(new Date().toISOString().slice(0, 10));
      await fetchApplications(1);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Could not add application");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        icon={Briefcase}
        title="My Applications"
        description="Track every submission and keep the pipeline moving."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add application</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_180px_160px_auto]">
          <Input
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            placeholder="Program or role name"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as (typeof STATUS_OPTIONS)[number])}
            className="h-11 rounded-2xl border border-input bg-background/60 px-4 text-sm text-foreground shadow-sm outline-none focus-visible:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option} className="bg-background text-foreground">
                {option}
              </option>
            ))}
          </select>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Button onClick={addApplication} disabled={saving}>
            <Plus className="h-4 w-4" />
            {saving ? "Saving..." : "Add"}
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : error ? (
        <EmptyState icon={Briefcase} title="Couldn't load applications" description={error} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No applications yet"
          description="Add your first one above to start tracking it."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.4) }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-base">{app.program}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <StatusBadge status={app.status} />
                  <p className="text-sm text-muted-foreground">Date: {app.date}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" disabled={page <= 1 || loading} onClick={() => fetchApplications(page - 1)}>
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={page >= totalPages || loading}
          onClick={() => fetchApplications(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
