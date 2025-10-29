const cache: Record<string, { data: any; expiry: number }> = {};
const TTL = 1000 * 60 * 10; // 10 minutes

export function setCache(key: string, data: any) {
  cache[key] = { data, expiry: Date.now() + TTL };
}

export function getCache(key: string) {
  const item = cache[key];
  if (!item) return null;
  if (Date.now() > item.expiry) {
    delete cache[key];
    return null;
  }
  return item.data;
}
