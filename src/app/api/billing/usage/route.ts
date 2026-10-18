import {
  apiError,
  apiSuccess,
  applyPreAuthRateLimit,
  applyRateLimit,
  mergeHeaders,
  requireApiUser,
} from "@/lib/server/api";
import {
  PLAN_LIMITS,
  countCoverLettersThisMonth,
  countOwnedRows,
  resolvePlan,
} from "@/lib/server/plans";
import { isBillingConfigured } from "@/lib/server/stripe";

export async function GET(req: Request) {
  const preAuth = applyPreAuthRateLimit(req, "billing:usage:get");
  if (!preAuth.ok) return preAuth.response;

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

  const plan = resolvePlan(user);
  const limits = PLAN_LIMITS[plan];

  try {
    const [resumes, applications, interviews, coverLetters] = await Promise.all([
      countOwnedRows(supabase, "resumes", user.id),
      countOwnedRows(supabase, "applications", user.id),
      countOwnedRows(supabase, "interviews", user.id),
      countCoverLettersThisMonth(supabase, user.id),
    ]);

    const pct = (used: number, limit: number) => Math.min(100, Math.round((used / Math.max(1, limit)) * 100));

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
          resumes: pct(resumes, limits.resumes),
          applications: pct(applications, limits.applications),
          interviews: pct(interviews, limits.interviews),
          coverLetters: pct(coverLetters, limits.coverLettersPerMonth),
        },
        billing: {
          configured: isBillingConfigured(),
          hasCustomer: typeof user.app_metadata?.stripe_customer_id === "string",
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
