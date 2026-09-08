import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null | undefined;

/**
 * Service-role client for background jobs that must read across users
 * (e.g. the deadline reminder cron). Bypasses RLS, so it must never be used
 * from a request that acts on behalf of a signed-in user.
 *
 * Returns null when SUPABASE_SERVICE_ROLE_KEY is not configured so callers can
 * degrade gracefully instead of crashing at import time.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    cached = null;
    return cached;
  }

  cached = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
