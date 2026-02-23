"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">📄 My Applications</h2>

      <Card className="mb-6 bg-white/10 border-white/20">
        <CardHeader>
          <h3 className="font-semibold text-white">Add application</h3>
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
            className="h-9 rounded-md border border-white/20 bg-white/5 px-3 text-sm"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option} className="text-black">
                {option}
              </option>
            ))}
          </select>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Button onClick={addApplication} disabled={saving}>
            {saving ? "Saving..." : "Add"}
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading applications...</p>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : applications.length === 0 ? (
        <p className="text-sm text-muted-foreground">No applications yet. Add your first one above.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardHeader>
                <h3 className="font-semibold">{app.program}</h3>
              </CardHeader>
              <CardContent>
                <p>Status: {app.status}</p>
                <p className="text-sm text-muted-foreground">Date: {app.date}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-3">
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
