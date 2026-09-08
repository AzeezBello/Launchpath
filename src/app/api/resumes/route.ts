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
import { RESUME_SELECT_COLUMNS, type ResumeRow, deriveResumeTitle, sanitizeResumeData } from "@/lib/server/resumes";

export async function GET(req: Request) {
  const preAuth = applyPreAuthRateLimit(req, "resumes:get");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "resumes:get",
    userId: user.id,
    limit: 120,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const { data, error } = await supabase
    .from("resumes")
    .select(RESUME_SELECT_COLUMNS)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error) {
    if (isLikelyMissingTable(error)) {
      return apiSuccess([], { status: 200, headers: mergeHeaders(rateLimit.headers) }, { source: "empty-fallback" });
    }
    return apiError("Failed to load resumes", { status: 500, headers: mergeHeaders(rateLimit.headers) }, error.message);
  }

  return apiSuccess((data || []) as ResumeRow[], { status: 200, headers: mergeHeaders(rateLimit.headers) });
}

export async function POST(req: Request) {
  const preAuth = applyPreAuthRateLimit(req, "resumes:post");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "resumes:post",
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

  const body = (payload || {}) as Record<string, unknown>;
  const data = sanitizeResumeData(body.data ?? body);
  if (!data.personalInfo?.name || !data.personalInfo?.email) {
    return apiError("Name and email are required", { status: 422, headers: mergeHeaders(rateLimit.headers) });
  }

  const planCheck = await checkPlanLimit(supabase, user, "resumes");
  if (!planCheck.ok) {
    return apiError(planCheck.message, { status: 402, headers: mergeHeaders(rateLimit.headers) }, {
      code: PLAN_LIMIT_ERROR_CODE,
      plan: planCheck.plan,
      used: planCheck.used,
      limit: planCheck.limit,
    });
  }

  const title = deriveResumeTitle(data, body.title);

  const { data: row, error } = await supabase
    .from("resumes")
    .insert({ user_id: user.id, title, data })
    .select(RESUME_SELECT_COLUMNS)
    .single();

  if (error) {
    if (isLikelyMissingTable(error)) {
      return apiError("Resumes table is missing. Run the migrations first.", {
        status: 501,
        headers: mergeHeaders(rateLimit.headers),
      });
    }
    return apiError("Failed to save resume", { status: 500, headers: mergeHeaders(rateLimit.headers) }, error.message);
  }

  return apiSuccess(row as ResumeRow, { status: 201, headers: mergeHeaders(rateLimit.headers) });
}
