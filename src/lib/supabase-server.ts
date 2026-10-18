import { createNeonServerClient } from "@/lib/server/neon-db";

export async function createServerSupabaseClient() {
  return createNeonServerClient();
}
