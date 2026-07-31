import { jobData } from "@/data/opportunities";
import { fetchRemotiveJobs } from "@/lib/providers/remotiveJobs";
import { getCache, setCache } from "@/lib/cache";
import { apiSuccess, applyRateLimit, mergeHeaders, normalizeQuery } from "@/lib/server/api";

const CACHE_KEY_PREFIX = "jobs:query";

export async function GET(req: Request) {
  const rateLimit = applyRateLimit({
    request: req,
    route: "jobs:get",
    limit: 180,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const { searchParams } = new URL(req.url);
  const query = normalizeQuery(searchParams.get("query"), 80);
  const cacheKey = `${CACHE_KEY_PREFIX}:${query}`;

  const cached = getCache<Array<Record<string, unknown>>>(cacheKey);
  if (cached) {
    return apiSuccess(cached, { status: 200, headers: mergeHeaders(rateLimit.headers) }, { cached: true, total: cached.length });
  }

  const externalJobs = await fetchRemotiveJobs();
  const allJobs = [...externalJobs, ...jobData];

  const matches = (value: string | undefined) => value?.toLowerCase().includes(query);

  const results =
    query.length === 0
      ? allJobs
      : allJobs.filter(
          (item) =>
            matches(item.title) || matches(item.company) || matches(item.location) || matches(item.type)
        );

  setCache(cacheKey, results);
  return apiSuccess(
    results,
    { status: 200, headers: mergeHeaders(rateLimit.headers) },
    { cached: false, total: results.length, live: externalJobs.length > 0 }
  );
}
