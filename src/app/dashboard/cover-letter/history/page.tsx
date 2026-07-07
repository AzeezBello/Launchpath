// src/app/dashboard/cover-letter/history/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileStack } from "lucide-react";
import { useSupabase } from "@/providers/SupabaseProvider";
import { toast } from "sonner";
import LetterCard from "@/components/cover-letter/LetterCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

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
  const { supabase, user } = useSupabase();
  const [letters, setLetters] = useState<CoverLetter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

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

  if (!user) {
    return (
      <EmptyState
        icon={FileStack}
        title="Please log in"
        description="Sign in to view your saved cover letters."
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        icon={FileStack}
        title="Saved Cover Letters"
        description="Every letter you've generated and saved, in one place."
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : letters.length === 0 ? (
        <EmptyState
          icon={FileStack}
          title="No saved letters yet"
          description="Generate a cover letter and save it to see it here."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {letters.map((l, i) => (
            <motion.div
              key={l.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.4) }}
            >
              <LetterCard letter={l} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
