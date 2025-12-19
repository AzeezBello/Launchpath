// src/app/dashboard/cover-letter/history/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import LetterCard from "@/components/cover-letter/LetterCard";

type CoverLetter = {
  id: string;
  company_name?: string;
  position?: string;
  tone?: string;
  description?: string;
  content?: string;
  created_at?: string;
};

export default function CoverLetterHistoryPage() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const [letters, setLetters] = useState<CoverLetter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const fetchLetters = async () => {
      const { data, error } = await supabase
        .from("cover_letters")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        toast.error("Failed to load letters");
      } else {
        setLetters(data || []);
      }
      setLoading(false);
    };

    fetchLetters();
  }, [supabase, user]);

  if (!user) return <div className="p-8 text-gray-300">Please log in to view saved cover letters.</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Saved Cover Letters</h1>
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : letters.length === 0 ? (
        <p className="text-gray-400">No saved letters yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {letters.map((l) => (
            <LetterCard key={l.id} letter={l} />
          ))}
        </div>
      )}
    </div>
  );
}
