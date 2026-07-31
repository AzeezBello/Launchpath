"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { OpportunityType, SavedOpportunityRow } from "@/lib/types";

export type OpportunityRef = {
  opportunityId: string;
  opportunityType: OpportunityType;
  title: string;
  meta?: Record<string, string>;
};

type LinkedApplication = {
  opportunity_id: string;
  opportunity_type: string;
  status: string;
};

function keyFor(id: string, type: string) {
  return `${type}:${id}`;
}

export function useOpportunityActions() {
  const [savedByKey, setSavedByKey] = useState<Map<string, string>>(new Map()); // key -> bookmark row id
  const [appliedKeys, setAppliedKeys] = useState<Set<string>>(new Set());
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [bookmarksRes, linkedRes] = await Promise.all([
        fetch("/api/bookmarks?limit=200", { cache: "no-store" }),
        fetch("/api/applications/linked", { cache: "no-store" }),
      ]);

      const bookmarksPayload = await bookmarksRes.json().catch(() => null);
      const linkedPayload = await linkedRes.json().catch(() => null);

      const bookmarkRows = (Array.isArray(bookmarksPayload?.data) ? bookmarksPayload.data : []) as SavedOpportunityRow[];
      const nextSaved = new Map<string, string>();
      for (const row of bookmarkRows) {
        nextSaved.set(keyFor(row.opportunity_id, row.opportunity_type), row.id);
      }
      setSavedByKey(nextSaved);

      const linkedRows = (Array.isArray(linkedPayload?.data) ? linkedPayload.data : []) as LinkedApplication[];
      setAppliedKeys(new Set(linkedRows.map((row) => keyFor(row.opportunity_id, row.opportunity_type))));
    } catch (err) {
      console.error(err);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const withPending = useCallback(async (key: string, run: () => Promise<void>) => {
    setPendingKeys((prev) => new Set(prev).add(key));
    try {
      await run();
    } finally {
      setPendingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }, []);

  const toggleSave = useCallback(
    (item: OpportunityRef) => {
      const key = keyFor(item.opportunityId, item.opportunityType);
      const bookmarkId = savedByKey.get(key);

      return withPending(key, async () => {
        try {
          if (bookmarkId) {
            const res = await fetch(
              `/api/bookmarks?opportunityId=${encodeURIComponent(item.opportunityId)}&opportunityType=${item.opportunityType}`,
              { method: "DELETE" }
            );
            if (!res.ok) throw new Error("Failed to remove bookmark");
            setSavedByKey((prev) => {
              const next = new Map(prev);
              next.delete(key);
              return next;
            });
            toast.success("Removed from saved");
          } else {
            const res = await fetch("/api/bookmarks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                opportunityId: item.opportunityId,
                opportunityType: item.opportunityType,
                title: item.title,
                meta: item.meta || {},
              }),
            });
            const payload = await res.json();
            if (!res.ok) throw new Error(payload?.error || "Failed to save opportunity");
            setSavedByKey((prev) => new Map(prev).set(key, payload?.data?.id));
            toast.success("Saved");
          }
        } catch (err) {
          console.error(err);
          toast.error(err instanceof Error ? err.message : "Something went wrong");
        }
      });
    },
    [savedByKey, withPending]
  );

  const applyToOpportunity = useCallback(
    (item: OpportunityRef) => {
      const key = keyFor(item.opportunityId, item.opportunityType);
      if (appliedKeys.has(key)) return Promise.resolve();

      return withPending(key, async () => {
        try {
          const res = await fetch("/api/applications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              program: item.title,
              opportunityId: item.opportunityId,
              opportunityType: item.opportunityType,
            }),
          });
          const payload = await res.json();
          if (!res.ok) throw new Error(payload?.error || "Failed to apply");

          setAppliedKeys((prev) => new Set(prev).add(key));
          toast.success(
            payload?.meta?.alreadyApplied ? "You already applied to this" : "Added to your applications"
          );
        } catch (err) {
          console.error(err);
          toast.error(err instanceof Error ? err.message : "Could not apply");
        }
      });
    },
    [appliedKeys, withPending]
  );

  const isSaved = useCallback((id: string, type: OpportunityType) => savedByKey.has(keyFor(id, type)), [savedByKey]);
  const isApplied = useCallback((id: string, type: OpportunityType) => appliedKeys.has(keyFor(id, type)), [appliedKeys]);
  const isPending = useCallback((id: string, type: OpportunityType) => pendingKeys.has(keyFor(id, type)), [pendingKeys]);

  return { ready, isSaved, isApplied, isPending, toggleSave, applyToOpportunity, refresh };
}
