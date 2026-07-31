import { getCache, setCache } from "@/lib/cache";
import { logger } from "@/lib/logger";

export type ExternalJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  link: string;
  source: string;
};

const CACHE_KEY = "external:remotive:raw";
// Remotive's API guidance asks for at most ~4 requests/day against their
// upstream, so we fetch once and cache for hours rather than per search query.
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const FETCH_TIMEOUT_MS = 5000;

type RemotiveJob = {
  id: number;
  url: string;
  title: string;
  company_name: string;
  job_type?: string;
  candidate_required_location?: string;
};

function humanizeJobType(type: string | undefined) {
  switch (type) {
    case "full_time":
      return "Full-time";
    case "part_time":
      return "Part-time";
    case "contract":
      return "Contract";
    case "freelance":
      return "Freelance";
    case "internship":
      return "Internship";
    default:
      return type ? type.replace(/_/g, " ") : "Remote";
  }
}

export async function fetchRemotiveJobs(): Promise<ExternalJob[]> {
  const cached = getCache<ExternalJob[]>(CACHE_KEY);
  if (cached) return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch("https://remotive.com/api/remote-jobs?limit=100", {
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Remotive responded ${res.status}`);

    const payload = (await res.json()) as { jobs?: RemotiveJob[] };
    const jobs = Array.isArray(payload.jobs) ? payload.jobs : [];

    const mapped: ExternalJob[] = jobs.map((job) => ({
      id: `remotive-${job.id}`,
      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location || "Remote",
      type: humanizeJobType(job.job_type),
      link: job.url,
      source: "Remotive",
    }));

    setCache(CACHE_KEY, mapped, CACHE_TTL_MS);
    return mapped;
  } catch (error) {
    logger.error("Failed to fetch Remotive jobs, serving static data only:", error);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
