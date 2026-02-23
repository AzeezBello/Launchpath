"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/supabase-env";

let supabase: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (!supabase) {
    const env = getSupabasePublicEnv();
    supabase = createBrowserClient(env.url, env.anonKey);
  }
  return supabase;
}
