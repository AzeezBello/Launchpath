import {
  apiError,
  apiSuccess,
  applyPreAuthRateLimit,
  applyRateLimit,
  mergeHeaders,
  requireApiUser,
} from "@/lib/server/api";
import { PLAN_LIMIT_ERROR_CODE, checkPlanLimit } from "@/lib/server/plans";
import { RESUME_SELECT_COLUMNS, type ResumeRow, sanitizeResumeData } from "@/lib/server/resumes";

type RouteContext = { params: Promise<{ id: string }> };

// POST /api/resumes/:id/duplicate → a new resume titled "Copy of <title>".
export async function POST(req: Request, { params }: RouteContext) {
  const { id } = await params;

  const preAuth = applyPreAuthRateLimit(req, "resumes:duplicate");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "resumes:duplicate",
    userId: user.id,
    limit: 20,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const { data: source, error: loadError } = await supabase
    .from("resumes")
    .select(RESUME_SELECT_COLUMNS)
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle<ResumeRow>();

  if (loadError) {
    return apiError("Failed to load resume", { status: 500, headers: mergeHeaders(rateLimit.headers) }, loadError.message);
  }
  if (!source) {
    return apiError("Resume not found", { status: 404, headers: mergeHeaders(rateLimit.headers) });
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

  const title = `Copy of ${source.title || "Untitled Resume"}`.slice(0, 120);
  const data = sanitizeResumeData({ ...source.data, title });

  const { data: row, error } = await supabase
    .from("resumes")
    .insert({ user_id: user.id, title, data })
    .select(RESUME_SELECT_COLUMNS)
    .single();

  if (error) {
    return apiError("Failed to duplicate resume", { status: 500, headers: mergeHeaders(rateLimit.headers) }, error.message);
  }

  return apiSuccess(row as ResumeRow, { status: 201, headers: mergeHeaders(rateLimit.headers) });
}
