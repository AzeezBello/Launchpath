import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isLikelyMissingTable } from "@/lib/server/settings";

export type PlanKey = "starter" | "pro" | "team";

export type PlanLimits = {
  coverLettersPerMonth: number;
  resumes: number;
  applications: number;
  interviews: number;
};

export const PLAN_LIMITS: Record<PlanKey, PlanLimits> = {
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

export const PLAN_LABELS: Record<PlanKey, string> = {
  starter: "Starter",
  pro: "Pro",
  team: "Team",
};

/** Plan lives in app_metadata (set by the Stripe webhook); user_metadata is a legacy fallback. */
export function resolvePlan(user: Pick<User, "app_metadata" | "user_metadata">): PlanKey {
  const value = user.app_metadata?.plan ?? user.user_metadata?.plan;
  if (typeof value !== "string") return "starter";
  const plan = value.trim().toLowerCase();
  if (plan === "pro" || plan === "team") return plan;
  return "starter";
}

function startOfMonthIso() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export async function countOwnedRows(
  supabase: SupabaseClient,
  table: string,
  userId: string,
  options?: { since?: string }
) {
  let query = supabase.from(table).select("id", { count: "exact", head: true }).eq("user_id", userId);
  if (options?.since) query = query.gte("created_at", options.since);

  const { count, error } = await query;
  if (error) {
    if (isLikelyMissingTable(error)) return 0;
    throw new Error(error.message);
  }
  return count || 0;
}

/** Cover letters are a monthly allowance; everything else is a running total. */
export async function countCoverLettersThisMonth(supabase: SupabaseClient, userId: string) {
  return countOwnedRows(supabase, "cover_letters", userId, { since: startOfMonthIso() });
}

export type LimitKey = keyof PlanLimits;

export type PlanLimitCheck =
  | { ok: true; plan: PlanKey; used: number; limit: number }
  | { ok: false; plan: PlanKey; used: number; limit: number; message: string };

const LIMIT_LABEL: Record<LimitKey, string> = {
  coverLettersPerMonth: "AI cover letters this month",
  resumes: "resumes",
  applications: "applications",
  interviews: "interviews",
};

/**
 * Returns ok:false with a user-facing message when creating one more row of
 * `key` would exceed the caller's plan. Routes turn that into a 402.
 */
export async function checkPlanLimit(
  supabase: SupabaseClient,
  user: User,
  key: LimitKey
): Promise<PlanLimitCheck> {
  const plan = resolvePlan(user);
  const limit = PLAN_LIMITS[plan][key];

  const used =
    key === "coverLettersPerMonth"
      ? await countCoverLettersThisMonth(supabase, user.id)
      : await countOwnedRows(supabase, key, user.id);

  if (used >= limit) {
    return {
      ok: false,
      plan,
      used,
      limit,
      message: `You've reached the ${PLAN_LABELS[plan]} plan limit of ${limit} ${LIMIT_LABEL[key]}. Upgrade to keep going.`,
    };
  }

  return { ok: true, plan, used, limit };
}

export const PLAN_LIMIT_ERROR_CODE = "PLAN_LIMIT";
