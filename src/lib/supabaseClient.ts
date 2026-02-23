"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/supabase-env";

let client: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  if (!client) {
    const env = getSupabasePublicEnv();
    client = createBrowserClient(env.url, env.anonKey);
  }
  return client;
}

export const supabase = getSupabaseBrowserClient();
 
