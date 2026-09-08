import {
  apiError,
  apiSuccess,
  applyPreAuthRateLimit,
  applyRateLimit,
  mergeHeaders,
  requireApiUser,
} from "@/lib/server/api";
import { PLAN_LIMIT_ERROR_CODE, checkPlanLimit } from "@/lib/server/plans";
import { RESUME_SELECT_COLUMNS, type ResumeRow } from "@/lib/server/resumes";
import { tailorResume } from "@/lib/server/tailor-resume";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// POST /api/ai/tailor-resume
//   { resumeId, position, company?, jobDescription }
// Creates a NEW resume (the original is untouched) rewritten toward the job,
// and returns it with keyword coverage so the user can see what to add.
export async function POST(req: Request) {
  const preAuth = applyPreAuthRateLimit(req, "resume:tailor");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "resume:tailor",
    userId: user.id,
    limit: 15,
    windowMs: 60 * 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return apiError("Invalid JSON body", { status: 400, headers: mergeHeaders(rateLimit.headers) });
  }

  const body = (payload || {}) as Record<string, unknown>;
  const resumeId = typeof body.resumeId === "string" && UUID_RE.test(body.resumeId) ? body.resumeId : "";
  const position = typeof body.position === "string" ? body.position.trim().slice(0, 120) : "";
  const company = typeof body.company === "string" ? body.company.trim().slice(0, 120) : "";
  const jobDescription = typeof body.jobDescription === "string" ? body.jobDescription.trim().slice(0, 6000) : "";

  if (!resumeId || !position || jobDescription.length < 40) {
    return apiError("resumeId, position, and a job description (40+ characters) are required", {
      status: 422,
      headers: mergeHeaders(rateLimit.headers),
    });
  }

  const { data: source, error: loadError } = await supabase
    .from("resumes")
    .select(RESUME_SELECT_COLUMNS)
    .eq("id", resumeId)
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

  const result = await tailorResume({
    resume: { ...source.data, title: source.data?.title || source.title },
    position,
    company: company || undefined,
    jobDescription,
  });

  const title = result.data.title || `${source.title} — ${position}`;
  const { data: row, error } = await supabase
    .from("resumes")
    .insert({ user_id: user.id, title, data: result.data })
    .select(RESUME_SELECT_COLUMNS)
    .single();

  if (error) {
    return apiError("Failed to save tailored resume", { status: 500, headers: mergeHeaders(rateLimit.headers) }, error.message);
  }

  return apiSuccess(
    { resume: row as ResumeRow, source: result.source, matched: result.matched, missing: result.missing },
    { status: 201, headers: mergeHeaders(rateLimit.headers) }
  );
}
