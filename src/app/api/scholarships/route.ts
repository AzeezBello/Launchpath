import { scholarshipData } from "@/data/opportunities";
import { getCache, setCache } from "@/lib/cache";
import { apiSuccess, applyRateLimit, mergeHeaders, normalizeQuery } from "@/lib/server/api";

const CACHE_KEY_PREFIX = "scholarships";

export async function GET(req: Request) {
  const rateLimit = applyRateLimit({
    request: req,
    route: "scholarships:get",
    limit: 180,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const { searchParams } = new URL(req.url);
  const query = normalizeQuery(searchParams.get("query"), 80);
  const cacheKey = `${CACHE_KEY_PREFIX}:${query}`;

  const cached = getCache<typeof scholarshipData>(cacheKey);
  if (cached) {
    return apiSuccess(
      cached,
      { status: 200, headers: mergeHeaders(rateLimit.headers) },
      { cached: true, total: cached.length }
    );
  }

  const matches = (value: string | undefined) => value?.toLowerCase().includes(query);

  const results =
    query.length === 0
      ? scholarshipData
      : scholarshipData.filter((item) => matches(item.title) || matches(item.provider) || matches(item.country));

  setCache(cacheKey, results);
  return apiSuccess(
    results,
    { status: 200, headers: mergeHeaders(rateLimit.headers) },
    { cached: false, total: results.length }
  );
}
