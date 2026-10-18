export function getNeonEnv() {
  const databaseUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    "";
  return {
    databaseUrl,
    isConfigured: Boolean(databaseUrl),
  };
}

// Legacy aliases kept so any existing imports continue to work seamlessly
export function getSupabasePublicEnv() {
  return getNeonEnv();
}

export function requireSupabasePublicEnv(context?: string) {
  void context;
  return getNeonEnv();
}
