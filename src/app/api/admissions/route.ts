import { admissionData } from "@/data/opportunities";
import { getCache, setCache } from "@/lib/cache";
import { apiSuccess, applyRateLimit, mergeHeaders, normalizeQuery } from "@/lib/server/api";

const CACHE_KEY_PREFIX = "admissions";

export async function GET(req: Request) {
  const rateLimit = applyRateLimit({
    request: req,
    route: "admissions:get",
    limit: 180,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const { searchParams } = new URL(req.url);
  const country = normalizeQuery(searchParams.get("country"), 80);
  const field = normalizeQuery(searchParams.get("field"), 80);
  const cacheKey = `${CACHE_KEY_PREFIX}:${country}:${field}`;

  const cached = getCache<typeof admissionData>(cacheKey);
  if (cached) {
    return apiSuccess(
      cached,
      { status: 200, headers: mergeHeaders(rateLimit.headers) },
      { cached: true, total: cached.length }
    );
  }

  const matches = (value: string | undefined) =>
    country.length === 0 || value?.toLowerCase().includes(country);
  const matchesField = (value: string | undefined) => field.length === 0 || value?.toLowerCase().includes(field);

  const filtered = admissionData.filter((item) => matches(item.country) && matchesField(item.field));

  setCache(cacheKey, filtered);
  return apiSuccess(
    filtered,
    { status: 200, headers: mergeHeaders(rateLimit.headers) },
    { cached: false, total: filtered.length }
  );
}
