import { createNeonServerClient, isNeonConfigured, type NeonServerClient } from "@/lib/server/neon-db";

/**
 * Admin Neon client for background jobs and webhooks (e.g. Stripe webhook and
 * deadline reminder cron). Returns null only if DATABASE_URL is not configured.
 */
export function getSupabaseAdminClient(): NeonServerClient | null {
  if (!isNeonConfigured()) {
    return null;
  }
  return createNeonServerClient();
}
