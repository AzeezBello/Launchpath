import { admissionData } from "@/data/opportunities";
import { fetchCollegeScorecardAdmissions } from "@/lib/providers/collegeScorecardAdmissions";
import { getCache, setCache } from "@/lib/cache";
import { apiSuccess, applyRateLimit, mergeHeaders, normalizeQuery } from "@/lib/server/api";

const CACHE_KEY_PREFIX = "admissions:query";

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

  const cached = getCache<Array<Record<string, unknown>>>(cacheKey);
  if (cached) {
    return apiSuccess(
      cached,
      { status: 200, headers: mergeHeaders(rateLimit.headers) },
      { cached: true, total: cached.length }
    );
  }

  // Scorecard only covers U.S. institutions, so only pull it in when the
  // country filter doesn't exclude the U.S. (empty filter included).
  const includesUS = country.length === 0 || "united states".includes(country) || country.includes("us");
  const externalAdmissions = includesUS ? await fetchCollegeScorecardAdmissions() : [];
  const allAdmissions = [...externalAdmissions, ...admissionData];

  const matches = (value: string | undefined) =>
    country.length === 0 || value?.toLowerCase().includes(country);
  const matchesField = (value: string | undefined) => field.length === 0 || value?.toLowerCase().includes(field);

  const filtered = allAdmissions.filter((item) => matches(item.country) && matchesField(item.field));

  setCache(cacheKey, filtered);
  return apiSuccess(
    filtered,
    { status: 200, headers: mergeHeaders(rateLimit.headers) },
    { cached: false, total: filtered.length, live: externalAdmissions.length > 0 }
  );
}
