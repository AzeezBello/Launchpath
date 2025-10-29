"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Interview {
  id: number;
  candidate: string;
  position: string;
  date: string;
  status: string;
}

export default function InterviewPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchInterviews() {
      setLoading(true);
      const res = await fetch(`/dashboard/interview/api/interview?page=${page}&limit=10`, {
        cache: "force-cache",
      });
      const data = await res.json();
      setInterviews(data.data);
      setTotalPages(data.totalPages);
      setLoading(false);
    }
    fetchInterviews();
  }, [page]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">🗓️ Interview Prep</h2>

      {loading ? (
        <div className="text-center py-10">Loading interview data...</div>
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
