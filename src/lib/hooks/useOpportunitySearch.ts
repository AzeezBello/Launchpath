"use client";

import { useCallback, useEffect, useState } from "react";

export function useOpportunitySearch<T>(buildUrl: (params: Record<string, string>) => string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (params: Record<string, string> = {}) => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(buildUrl(params));
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.error || "Failed to load results");

        const rows = Array.isArray(payload?.data) ? payload.data : payload?.results;
        setItems(Array.isArray(rows) ? rows : []);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Unable to load results. Please try again.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [buildUrl]
  );

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { items, loading, error, search };
}
