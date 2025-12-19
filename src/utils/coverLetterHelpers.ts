// src/app/dashboard/cover-letter/utils/coverLetterHelpers.ts
import type { SupabaseClient } from "@supabase/supabase-js";

export type CoverLetterPayload = {
  user_id: string;
  company_name: string;
  position: string;
  tone?: string;
  description?: string;
  content: string;
};

export async function saveLetter(supabase: SupabaseClient, payload: CoverLetterPayload) {
  const { error, data } = await supabase.from("cover_letters").insert([payload]).select().single();
  return { error, data };
}

export async function updateLetter(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<CoverLetterPayload>
) {
  const { error, data } = await supabase.from("cover_letters").update(patch).eq("id", id).select().single();
  return { error, data };
}
