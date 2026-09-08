import {
  apiError,
  apiSuccess,
  applyPreAuthRateLimit,
  applyRateLimit,
  clampInt,
  mergeHeaders,
  requireApiUser,
} from "@/lib/server/api";
import { PLAN_LIMIT_ERROR_CODE, checkPlanLimit } from "@/lib/server/plans";
import { isLikelyMissingTable } from "@/lib/server/settings";
import {
  INTERVIEW_ALLOWED_STATUS as ALLOWED_STATUS,
  INTERVIEW_SELECT_COLUMNS,
  type InterviewRow,
  type InterviewStatus,
  sanitizeInterviewApplicationRef as sanitizeApplicationRef,
  sanitizeInterviewDate as sanitizeDate,
  sanitizeInterviewStatus as sanitizeStatus,
  sanitizeInterviewText as sanitizeText,
} from "@/lib/server/interviews";

export async function GET(req: Request) {
  const preAuth = applyPreAuthRateLimit(req, "interview:get");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "interview:get",
    userId: user.id,
    limit: 120,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const { searchParams } = new URL(req.url);
  const page = clampInt(searchParams.get("page"), 1, 1, 1000);
  const limit = clampInt(searchParams.get("limit"), 10, 1, 50);
  const rawStatus = searchParams.get("status");
  const statusFilter = rawStatus ? sanitizeStatus(rawStatus) : null;

  if (rawStatus && !ALLOWED_STATUS.has(rawStatus as InterviewStatus)) {
    return apiError("Invalid status filter", { status: 422, headers: mergeHeaders(rateLimit.headers) });
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("interviews")
    .select(INTERVIEW_SELECT_COLUMNS, { count: "exact" })
    .eq("user_id", user.id)
    .order("date", { ascending: true })
    .range(from, to);

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data, error, count } = await query;

  if (error) {
    if (isLikelyMissingTable(error)) {
      return apiSuccess(
        [],
        { status: 200, headers: mergeHeaders(rateLimit.headers) },
        { page, totalPages: 1, total: 0, source: "empty-fallback" }
      );
    }
    return apiError(
      "Failed to load interviews",
      { status: 500, headers: mergeHeaders(rateLimit.headers) },
      error.message
    );
  }

  const rows = (data || []) as InterviewRow[];
  const total = count || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return apiSuccess(
    rows,
    { status: 200, headers: mergeHeaders(rateLimit.headers) },
    {
      page,
      totalPages,
      total,
    }
  );
}

export async function POST(req: Request) {
  const preAuth = applyPreAuthRateLimit(req, "interview:post");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "interview:post",
    userId: user.id,
    limit: 40,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return apiError("Invalid JSON body", { status: 400, headers: mergeHeaders(rateLimit.headers) });
  }

  const body = payload as Record<string, unknown>;
  const candidate = sanitizeText(body.candidate, 120);
  const position = sanitizeText(body.position, 120);
  const date = sanitizeDate(body.date);
  const status = sanitizeStatus(body.status);
  const applicationId = sanitizeApplicationRef(body.applicationId);
  const notes = sanitizeText(body.notes, 4000);
  const location = sanitizeText(body.location, 200);

  if (!candidate || !position) {
    return apiError("Company and position are required", { status: 422, headers: mergeHeaders(rateLimit.headers) });
  }

  const planCheck = await checkPlanLimit(supabase, user, "interviews");
  if (!planCheck.ok) {
    return apiError(planCheck.message, { status: 402, headers: mergeHeaders(rateLimit.headers) }, {
      code: PLAN_LIMIT_ERROR_CODE,
      plan: planCheck.plan,
      used: planCheck.used,
      limit: planCheck.limit,
    });
  }

  const { data, error } = await supabase
    .from("interviews")
    .insert({
      user_id: user.id,
      candidate,
      position,
      date,
      status,
      application_id: applicationId,
      notes,
      location,
    })
    .select(INTERVIEW_SELECT_COLUMNS)
    .single();

  if (error) {
    if (isLikelyMissingTable(error)) {
      return apiError(
        "Interviews table is missing. Create table `interviews` to enable persistence.",
        { status: 501, headers: mergeHeaders(rateLimit.headers) }
      );
    }
    return apiError(
      "Failed to create interview",
      { status: 500, headers: mergeHeaders(rateLimit.headers) },
      error.message
    );
  }

  return apiSuccess(data as InterviewRow, { status: 201, headers: mergeHeaders(rateLimit.headers) });
}
