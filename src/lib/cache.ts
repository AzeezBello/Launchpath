const cache: Record<string, { data: unknown; expiry: number }> = {};
const TTL = 1000 * 60 * 10; // 10 minutes

export function setCache<T>(key: string, data: T, ttlMs: number = TTL) {
  cache[key] = { data, expiry: Date.now() + ttlMs };
}

export function getCache<T>(key: string): T | null {
  const item = cache[key];
  if (!item) return null;
  if (Date.now() > item.expiry) {
    delete cache[key];
    return null;
  }
  return item.data as T;
}
