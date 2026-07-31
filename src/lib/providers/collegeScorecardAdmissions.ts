import { getCache, setCache } from "@/lib/cache";
import { logger } from "@/lib/logger";

export type ExternalAdmission = {
  id: string;
  name: string;
  country: string;
  field: string;
  website: string;
};

const CACHE_KEY = "external:college-scorecard:raw";
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const FETCH_TIMEOUT_MS = 6000;

// Optional: free key from https://api.data.gov/signup/ — without it, admissions
// results are served from the static dataset only (same graceful-fallback
// pattern as OPENAI_API_KEY for cover letters).
const apiKey = process.env.COLLEGE_SCORECARD_API_KEY;

type ScorecardResult = {
  id: number;
  "school.name"?: string;
  "school.school_url"?: string;
};

export async function fetchCollegeScorecardAdmissions(): Promise<ExternalAdmission[]> {
  if (!apiKey) return [];

  const cached = getCache<ExternalAdmission[]>(CACHE_KEY);
  if (cached) return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const url = new URL("https://api.data.gov/ed/collegescorecard/v1/schools");
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("fields", "id,school.name,school.school_url");
    url.searchParams.set("per_page", "100");
    url.searchParams.set("sort", "latest.student.size:desc");

    const res = await fetch(url.toString(), { signal: controller.signal });
    if (!res.ok) throw new Error(`College Scorecard responded ${res.status}`);

    const payload = (await res.json()) as { results?: ScorecardResult[] };
    const results = payload.results ?? [];

    // Scorecard is U.S.-only and queries by CIP code rather than free-text
    // field of study, so these entries supplement "United States" browsing
    // only — precise field-of-study filtering still comes from static data.
    const mapped: ExternalAdmission[] = results
      .filter((row): row is ScorecardResult & { "school.name": string } => Boolean(row["school.name"]))
      .map((row) => ({
        id: `scorecard-${row.id}`,
        name: row["school.name"],
        country: "United States",
        field: "Various",
        website: row["school.school_url"]
          ? `https://${row["school.school_url"].replace(/^https?:\/\//, "")}`
          : "#",
      }));

    setCache(CACHE_KEY, mapped, CACHE_TTL_MS);
    return mapped;
  } catch (error) {
    logger.error("Failed to fetch College Scorecard admissions, serving static data only:", error);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
