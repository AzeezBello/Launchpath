import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabasePublicEnv } from "@/lib/supabase-env";

export async function createClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  const env = requireSupabasePublicEnv("utils/supabase/server:createClient");
  return createServerClient(
    env.url,
    env.anonKey,
    { cookies: { get: name => cookieStore.get(name)?.value } }
  );
}
