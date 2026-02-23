"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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
      try {
        const res = await fetch(`/api/interview?page=${page}&limit=10`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load interviews");

        const rows = Array.isArray(data?.data) ? data.data : [];
        setInterviews(rows);
        setTotalPages(Number(data?.meta?.totalPages || 1));
      } catch (error) {
        console.error(error);
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
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Could not create interview");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">🗓️ Interview Prep</h2>

      <div className="mt-4 mb-6 grid gap-3 md:grid-cols-[1fr_1fr_160px_160px_auto]">
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
          className="h-9 rounded-md border border-white/20 bg-white/5 px-3 text-sm"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option} className="text-black">
              {option}
            </option>
          ))}
        </select>
        <Button onClick={addInterview} disabled={saving}>
          {saving ? "Saving..." : "Add"}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading interview data...</div>
      ) : interviews.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6">
          No interviews found. Try again later.
        </p>
      ) : (
        <div className="grid gap-4">
          {interviews.map((interview) => (
            <div
              key={interview.id}
              className="p-4 border rounded-lg shadow-sm bg-card hover:bg-accent transition"
            >
              <h2 className="font-semibold text-lg">{interview.candidate}</h2>
              <p className="text-sm text-muted-foreground">
                Role: {interview.position} | Status:{" "}
                <span
                  className={`font-medium ${
                    interview.status === "Completed"
                      ? "text-green-600"
                      : interview.status === "Scheduled"
                      ? "text-yellow-600"
                      : "text-gray-600"
                  }`}
                >
                  {interview.status}
                </span>
              </p>
              <p className="text-xs mt-1 text-muted-foreground">Date: {interview.date}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center gap-3 mt-6">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </Button>
        <span className="text-sm">
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
