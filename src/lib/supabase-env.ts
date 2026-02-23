const FALLBACK_SUPABASE_URL = "https://placeholder.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY = "public-anon-key-placeholder";

export function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const configured = Boolean(url && anonKey);

  return {
    configured,
    url: url || FALLBACK_SUPABASE_URL,
    anonKey: anonKey || FALLBACK_SUPABASE_ANON_KEY,
  };
}

export function requireSupabasePublicEnv(context: string) {
  const env = getSupabasePublicEnv();
  if (!env.configured) {
    throw new Error(
      `[${context}] Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.`
    );
  }
  return env;
}
