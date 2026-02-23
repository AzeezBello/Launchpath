import { apiError, apiSuccess, applyRateLimit, mergeHeaders, requireApiUser } from "@/lib/server/api";
import { isLikelyMissingTable } from "@/lib/server/settings";

type PlanKey = "starter" | "pro" | "team";

type PlanLimits = {
  coverLettersPerMonth: number;
  resumes: number;
  applications: number;
  interviews: number;
};

const LIMITS: Record<PlanKey, PlanLimits> = {
  starter: {
    coverLettersPerMonth: 20,
    resumes: 5,
    applications: 50,
    interviews: 20,
  },
  pro: {
    coverLettersPerMonth: 250,
    resumes: 100,
    applications: 1000,
    interviews: 400,
  },
  team: {
    coverLettersPerMonth: 1500,
    resumes: 1000,
    applications: 10000,
    interviews: 4000,
  },
};

function resolvePlan(value: unknown): PlanKey {
  if (typeof value !== "string") return "starter";
  const plan = value.trim().toLowerCase();
  if (plan === "pro" || plan === "team") return plan;
  return "starter";
}

async function countOwnedRows(
  supabase: Awaited<ReturnType<typeof requireApiUser>>["supabase"],
  table: string,
  userId: string
) {
  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true }).eq("user_id", userId);
  if (error) {
    if (isLikelyMissingTable(error)) return 0;
    throw new Error(error.message);
  }
  return count || 0;
}

export async function GET(req: Request) {
  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "billing:usage:get",
    userId: user.id,
    limit: 120,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const plan = resolvePlan(user.app_metadata?.plan || user.user_metadata?.plan);
  const limits = LIMITS[plan];

  try {
    const [resumes, applications, interviews, coverLetters] = await Promise.all([
      countOwnedRows(supabase, "resumes", user.id),
      countOwnedRows(supabase, "applications", user.id),
      countOwnedRows(supabase, "interviews", user.id),
      countOwnedRows(supabase, "cover_letters", user.id),
    ]);

    return apiSuccess(
      {
        plan,
        limits,
        usage: {
          resumes,
          applications,
          interviews,
          coverLetters,
        },
        usagePct: {
          resumes: Math.min(100, Math.round((resumes / Math.max(1, limits.resumes)) * 100)),
          applications: Math.min(100, Math.round((applications / Math.max(1, limits.applications)) * 100)),
          interviews: Math.min(100, Math.round((interviews / Math.max(1, limits.interviews)) * 100)),
          coverLetters: Math.min(
            100,
            Math.round((coverLetters / Math.max(1, limits.coverLettersPerMonth)) * 100)
          ),
        },
      },
      { status: 200, headers: mergeHeaders(rateLimit.headers) }
    );
  } catch (error: unknown) {
    return apiError(
      error instanceof Error ? error.message : "Failed to load usage",
      { status: 500, headers: mergeHeaders(rateLimit.headers) }
    );
  }
}
