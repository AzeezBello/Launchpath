import {
  apiError,
  apiSuccess,
  applyPreAuthRateLimit,
  applyRateLimit,
  mergeHeaders,
  requireApiUser,
} from "@/lib/server/api";
import { PLAN_LIMIT_ERROR_CODE, checkPlanLimit } from "@/lib/server/plans";
import {
  type ApplicantProfile,
  generateCoverLetter,
  profileFromResume,
  sanitizeCoverLetterPrompt,
} from "@/lib/server/cover-letter";
import { isLikelyMissingTable } from "@/lib/server/settings";
import type { ResumeFormData } from "@/types/resume";

const HOURLY_LIMIT = 20;

export async function POST(req: Request) {
  const preAuth = applyPreAuthRateLimit(req, "cover-letter:generate");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "cover-letter:generate",
    userId: user.id,
    limit: HOURLY_LIMIT,
    windowMs: 60 * 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return apiError("Invalid JSON body", { status: 400, headers: mergeHeaders(rateLimit.headers) });
  }

  const sanitized = sanitizeCoverLetterPrompt(payload);
  if (!sanitized) {
    return apiError("Company and position are required", { status: 422, headers: mergeHeaders(rateLimit.headers) });
  }

  const planCheck = await checkPlanLimit(supabase, user, "coverLettersPerMonth");
  if (!planCheck.ok) {
    return apiError(planCheck.message, { status: 402, headers: mergeHeaders(rateLimit.headers) }, {
      code: PLAN_LIMIT_ERROR_CODE,
      plan: planCheck.plan,
      used: planCheck.used,
      limit: planCheck.limit,
    });
  }

  // Fallback name when no resume is attached: profile name from settings,
  // then the auth-provider full name, then nothing (template shows [Your Name]).
  const fallbackName = await resolveDisplayName(supabase, user.id, user.user_metadata);

  let profile: ApplicantProfile | undefined;
  if (sanitized.resumeId) {
    // RLS scopes this to the caller, so a foreign resume id just returns nothing.
    const { data, error } = await supabase
      .from("resumes")
      .select("data")
      .eq("id", sanitized.resumeId)
      .eq("user_id", user.id)
      .maybeSingle<{ data: ResumeFormData | null }>();

    if (error && !isLikelyMissingTable(error)) {
      return apiError("Failed to load resume", { status: 500, headers: mergeHeaders(rateLimit.headers) }, error.message);
    }
    if (!data) {
      return apiError("Resume not found", { status: 404, headers: mergeHeaders(rateLimit.headers) });
    }
    profile = profileFromResume(data.data, fallbackName);
  } else if (fallbackName) {
    profile = profileFromResume(null, fallbackName);
  }

  try {
    const result = await generateCoverLetter(sanitized, profile);
    return apiSuccess(
      { ...result, usedResume: Boolean(sanitized.resumeId) },
      { status: 200, headers: mergeHeaders(rateLimit.headers) }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate cover letter";
    return apiError(message, { status: 500, headers: mergeHeaders(rateLimit.headers) });
  }
}

async function resolveDisplayName(
  supabase: Awaited<ReturnType<typeof requireApiUser>>["supabase"],
  userId: string,
  userMetadata: Record<string, unknown> | undefined
) {
  const { data } = await supabase
    .from("user_settings")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle<{ data: { profile?: { name?: string } } | null }>();

  const fromSettings = data?.data?.profile?.name;
  if (typeof fromSettings === "string" && fromSettings.trim()) return fromSettings.trim().slice(0, 120);

  const fromAuth = userMetadata?.full_name ?? userMetadata?.name;
  if (typeof fromAuth === "string" && fromAuth.trim()) return fromAuth.trim().slice(0, 120);

  return "";
}
