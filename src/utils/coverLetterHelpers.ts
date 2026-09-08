// Client helpers for cover-letter persistence. Writes go through the API so
// plan limits and input bounds are enforced server-side; reads can still use
// the Supabase client directly (RLS scopes them to the caller).

import { handlePlanLimit } from "@/lib/plan-limit";

export type CoverLetterPayload = {
  company_name: string;
  position: string;
  tone?: string;
  description?: string;
  content: string;
  source?: string;
};

export type SavedCoverLetter = CoverLetterPayload & { id: string; created_at: string };

type Result<T> = { data: T | null; error: string | null; planLimited?: boolean };

export async function saveLetter(payload: CoverLetterPayload): Promise<Result<SavedCoverLetter>> {
  const res = await fetch("/api/cover-letters", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const planLimited = handlePlanLimit(res.status, body);
    return { data: null, error: body?.error || "Failed to save cover letter", planLimited };
  }
  return { data: body?.data as SavedCoverLetter, error: null };
}

export async function updateLetter(id: string, patch: Partial<CoverLetterPayload>): Promise<Result<SavedCoverLetter>> {
  const res = await fetch(`/api/cover-letters/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    return { data: null, error: body?.error || "Failed to update cover letter" };
  }
  return { data: body?.data as SavedCoverLetter, error: null };
}
