import { getCache, setCache } from "@/lib/cache";
import { logger } from "@/lib/logger";

export type ExternalGrant = {
  id: string;
  title: string;
  organization: string;
  amount?: string;
  country: string;
  link: string;
};

const CACHE_KEY = "external:grants-gov:raw";
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const FETCH_TIMEOUT_MS = 6000;

type GrantsGovOppHit = {
  id: string;
  title: string;
  agency: string;
};

export async function fetchGrantsGovGrants(): Promise<ExternalGrant[]> {
  const cached = getCache<ExternalGrant[]>(CACHE_KEY);
  if (cached) return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch("https://api.grants.gov/v1/api/search2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: 60, oppStatuses: "forecasted|posted" }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Grants.gov responded ${res.status}`);

    const payload = (await res.json()) as { data?: { oppHits?: GrantsGovOppHit[] } };
    const hits = payload.data?.oppHits ?? [];

    const mapped: ExternalGrant[] = hits.map((hit) => ({
      id: `grants-${hit.id}`,
      title: hit.title,
      organization: hit.agency,
      country: "United States",
      link: `https://www.grants.gov/search-results-detail/${hit.id}`,
    }));

    setCache(CACHE_KEY, mapped, CACHE_TTL_MS);
    return mapped;
  } catch (error) {
    logger.error("Failed to fetch Grants.gov opportunities, serving static data only:", error);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
