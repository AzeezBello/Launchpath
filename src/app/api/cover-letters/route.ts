import {
  apiError,
  apiSuccess,
  applyPreAuthRateLimit,
  applyRateLimit,
  mergeHeaders,
  requireApiUser,
} from "@/lib/server/api";
import { isLikelyMissingTable } from "@/lib/server/settings";
import { PLAN_LIMIT_ERROR_CODE, checkPlanLimit } from "@/lib/server/plans";
import { COVER_LETTER_SELECT_COLUMNS, type CoverLetterRow, sanitizeCoverLetter } from "@/lib/server/cover-letters";

export async function GET(req: Request) {
  const preAuth = applyPreAuthRateLimit(req, "cover-letters:get");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "cover-letters:get",
    userId: user.id,
    limit: 120,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const { data, error } = await supabase
    .from("cover_letters")
    .select(COVER_LETTER_SELECT_COLUMNS)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    if (isLikelyMissingTable(error)) {
      return apiSuccess([], { status: 200, headers: mergeHeaders(rateLimit.headers) }, { source: "empty-fallback" });
    }
    return apiError("Failed to load cover letters", { status: 500, headers: mergeHeaders(rateLimit.headers) }, error.message);
  }

  return apiSuccess((data || []) as CoverLetterRow[], { status: 200, headers: mergeHeaders(rateLimit.headers) });
}

// Saving a generated letter counts toward the monthly allowance, the same
// counter the generator checks, so the two stay consistent.
export async function POST(req: Request) {
  const preAuth = applyPreAuthRateLimit(req, "cover-letters:post");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "cover-letters:post",
    userId: user.id,
    limit: 30,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return apiError("Invalid JSON body", { status: 400, headers: mergeHeaders(rateLimit.headers) });
  }

  const input = sanitizeCoverLetter(payload);
  if (!input.content) {
    return apiError("Letter content is required", { status: 422, headers: mergeHeaders(rateLimit.headers) });
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

  const { data, error } = await supabase
    .from("cover_letters")
    .insert({ user_id: user.id, ...input })
    .select(COVER_LETTER_SELECT_COLUMNS)
    .single();

  if (error) {
    if (isLikelyMissingTable(error)) {
      return apiError("Cover letters table is missing. Run the migrations first.", {
        status: 501,
        headers: mergeHeaders(rateLimit.headers),
      });
    }
    return apiError("Failed to save cover letter", { status: 500, headers: mergeHeaders(rateLimit.headers) }, error.message);
  }

  return apiSuccess(data as CoverLetterRow, { status: 201, headers: mergeHeaders(rateLimit.headers) });
}
