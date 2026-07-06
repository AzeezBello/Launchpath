"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarClock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

interface Interview {
  id: string;
  candidate: string;
  position: string;
  date: string;
  status: string;
}

const STATUS_OPTIONS = ["Scheduled", "Completed", "Pending"] as const;

export default function InterviewPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshToken, setRefreshToken] = useState(0);
  const [saving, setSaving] = useState(false);
  const [candidate, setCandidate] = useState("");
  const [position, setPosition] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>("Pending");

  useEffect(() => {
    async function fetchInterviews() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/interview?page=${page}&limit=10`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load interviews");

        const rows = Array.isArray(data?.data) ? data.data : [];
        setInterviews(rows);
        setTotalPages(Number(data?.meta?.totalPages || 1));
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to load interviews");
        setInterviews([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    }
    fetchInterviews();
  }, [page, refreshToken]);

  const addInterview = async () => {
    if (!candidate.trim() || !position.trim()) {
      toast.error("Candidate and role are required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate: candidate.trim(),
          position: position.trim(),
          date,
          status,
        }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Failed to create interview");

      toast.success("Interview added");
      setCandidate("");
      setPosition("");
      setStatus("Pending");
      setDate(new Date().toISOString().slice(0, 10));
      setPage(1);
      setRefreshToken((v) => v + 1);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Could not create interview");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        icon={CalendarClock}
        title="Interview Prep"
        description="Keep upcoming and past interviews organized in one place."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add interview</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_1fr_160px_160px_auto]">
          <Input
            placeholder="Candidate name"
            value={candidate}
            onChange={(e) => setCandidate(e.target.value)}
          />
          <Input
            placeholder="Role / position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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
          <Button onClick={addInterview} disabled={saving}>
            <Plus className="h-4 w-4" />
            {saving ? "Saving..." : "Add"}
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : error ? (
        <EmptyState icon={CalendarClock} title="Couldn't load interviews" description={error} />
      ) : interviews.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No interviews yet"
          description="Add one above to start prepping."
        />
      ) : (
        <div className="grid gap-4">
          {interviews.map((interview, i) => (
            <motion.div
              key={interview.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.4) }}
            >
              <Card className="hover-card">
                <CardContent className="flex items-start justify-between gap-3 p-5">
                  <div>
                    <h3 className="font-semibold">{interview.candidate}</h3>
                    <p className="text-sm text-muted-foreground">Role: {interview.position}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Date: {interview.date}</p>
                  </div>
                  <StatusBadge status={interview.status} />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
