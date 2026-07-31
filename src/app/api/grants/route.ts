import { grantData } from "@/data/opportunities";
import { fetchGrantsGovGrants } from "@/lib/providers/grantsGovGrants";
import { getCache, setCache } from "@/lib/cache";
import { apiSuccess, applyRateLimit, mergeHeaders, normalizeQuery } from "@/lib/server/api";

const CACHE_KEY_PREFIX = "grants:query";

export async function GET(req: Request) {
  const rateLimit = applyRateLimit({
    request: req,
    route: "grants:get",
    limit: 180,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const { searchParams } = new URL(req.url);
  const query = normalizeQuery(searchParams.get("query"), 80);
  const cacheKey = `${CACHE_KEY_PREFIX}:${query}`;

  const cached = getCache<Array<Record<string, unknown>>>(cacheKey);
  if (cached) {
    return apiSuccess(
      cached,
      { status: 200, headers: mergeHeaders(rateLimit.headers) },
      { cached: true, total: cached.length }
    );
  }

  const externalGrants = await fetchGrantsGovGrants();
  const allGrants = [...externalGrants, ...grantData];

  const matches = (value: string | undefined) => value?.toLowerCase().includes(query);

  const results =
    query.length === 0
      ? allGrants
      : allGrants.filter((item) => matches(item.title) || matches(item.organization) || matches(item.country));

  setCache(cacheKey, results);
  return apiSuccess(
    results,
    { status: 200, headers: mergeHeaders(rateLimit.headers) },
    { cached: false, total: results.length, live: externalGrants.length > 0 }
  );
}
