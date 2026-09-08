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
  isUniqueViolation,
  sanitizeOpportunityId,
  sanitizeOpportunityType,
} from "@/lib/server/opportunities";
import {
  APPLICATION_ALLOWED_STATUS,
  APPLICATION_OPEN_STATUSES,
  APPLICATION_SELECT_COLUMNS as SELECT_COLUMNS,
  type ApplicationRow,
  type ApplicationStatus,
  sanitizeApplicationDate as sanitizeDate,
  sanitizeApplicationDeadline as sanitizeDeadline,
  sanitizeApplicationNotes as sanitizeNotes,
  sanitizeApplicationProgram as sanitizeProgram,
  sanitizeApplicationRef as sanitizeRef,
  sanitizeApplicationStatus as sanitizeStatus,
  sanitizeApplicationUrl as sanitizeUrl,
} from "@/lib/server/applications";

type SortKey = "date" | "deadline";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

// GET /api/applications?page=&limit=&status=&sort=date|deadline&upcoming=1
//   status   filter to one status (exact match)
//   sort     "date" (newest first, default) or "deadline" (soonest first, nulls last)
//   upcoming only open-status rows with a deadline on/after today, soonest first
export async function GET(req: Request) {
  const preAuth = applyPreAuthRateLimit(req, "applications:get");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "applications:get",
    userId: user.id,
    limit: 120,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const { searchParams } = new URL(req.url);
  const page = clampInt(searchParams.get("page"), 1, 1, 1000);
  const limit = clampInt(searchParams.get("limit"), 20, 1, 100);
  const rawStatus = searchParams.get("status");
  const upcoming = searchParams.get("upcoming") === "1";
  const sort: SortKey = searchParams.get("sort") === "deadline" || upcoming ? "deadline" : "date";

  if (rawStatus && !APPLICATION_ALLOWED_STATUS.has(rawStatus as ApplicationStatus)) {
    return apiError("Invalid status filter", { status: 422, headers: mergeHeaders(rateLimit.headers) });
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("applications")
    .select(SELECT_COLUMNS, { count: "exact" })
    .eq("user_id", user.id);

  if (rawStatus) {
    query = query.eq("status", rawStatus);
  }

  if (upcoming) {
    query = query.in("status", APPLICATION_OPEN_STATUSES).gte("deadline", todayIso());
  }

  query =
    sort === "deadline"
      ? query.order("deadline", { ascending: true, nullsFirst: false }).order("date", { ascending: false })
      : query.order("date", { ascending: false }).order("created_at", { ascending: false });

  const { data, error, count } = await query.range(from, to);

  if (error) {
    if (isLikelyMissingTable(error)) {
      return apiSuccess(
        [],
        { status: 200, headers: mergeHeaders(rateLimit.headers) },
        { page, totalPages: 1, total: 0, source: "empty-fallback" }
      );
    }
    return apiError(
      "Failed to load applications",
      { status: 500, headers: mergeHeaders(rateLimit.headers) },
      error.message
    );
  }

  const rows = (data || []) as ApplicationRow[];
  const total = count || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return apiSuccess(
    rows,
    { status: 200, headers: mergeHeaders(rateLimit.headers) },
    {
      page,
      totalPages,
      total,
      sort,
    }
  );
}

export async function POST(req: Request) {
  const preAuth = applyPreAuthRateLimit(req, "applications:post");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "applications:post",
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
  const program = sanitizeProgram(body.program);
  const status = sanitizeStatus(body.status);
  const date = sanitizeDate(body.date);
  const deadline = sanitizeDeadline(body.deadline);
  const notes = sanitizeNotes(body.notes);
  const url = sanitizeUrl(body.url);
  const resumeId = sanitizeRef(body.resumeId);
  const coverLetterId = sanitizeRef(body.coverLetterId);

  // Optional: links this application back to the opportunity it came from
  // (set when created via the "Apply" action on a job/scholarship/grant/admission card).
  const opportunityId = body.opportunityId != null ? sanitizeOpportunityId(body.opportunityId) : "";
  const opportunityType = body.opportunityType != null ? sanitizeOpportunityType(body.opportunityType) : null;
  const hasOpportunityLink = Boolean(opportunityId && opportunityType);

  if (!program) {
    return apiError("Program is required", { status: 422, headers: mergeHeaders(rateLimit.headers) });
  }

  if ((opportunityId || opportunityType) && !hasOpportunityLink) {
    return apiError(
      "opportunityId and a valid opportunityType must both be provided",
      { status: 422, headers: mergeHeaders(rateLimit.headers) }
    );
  }

  const planCheck = await checkPlanLimit(supabase, user, "applications");
  if (!planCheck.ok) {
    return apiError(planCheck.message, { status: 402, headers: mergeHeaders(rateLimit.headers) }, {
      code: PLAN_LIMIT_ERROR_CODE,
      plan: planCheck.plan,
      used: planCheck.used,
      limit: planCheck.limit,
    });
  }

  const { data, error } = await supabase
    .from("applications")
    .insert({
      user_id: user.id,
      program,
      status,
      date,
      deadline,
      notes,
      url,
      resume_id: resumeId,
      cover_letter_id: coverLetterId,
      opportunity_id: hasOpportunityLink ? opportunityId : null,
      opportunity_type: hasOpportunityLink ? opportunityType : null,
    })
    .select(SELECT_COLUMNS)
    .single();

  if (error) {
    if (isLikelyMissingTable(error)) {
      return apiError(
        "Applications table is missing. Create table `applications` to enable cloud persistence.",
        { status: 501, headers: mergeHeaders(rateLimit.headers) }
      );
    }

    if (hasOpportunityLink && isUniqueViolation(error)) {
      // Already applied to this opportunity — return the existing row instead of erroring.
      const { data: existing } = await supabase
        .from("applications")
        .select(SELECT_COLUMNS)
        .eq("user_id", user.id)
        .eq("opportunity_id", opportunityId)
        .eq("opportunity_type", opportunityType)
        .maybeSingle();

      if (existing) {
        return apiSuccess(
          existing as ApplicationRow,
          { status: 200, headers: mergeHeaders(rateLimit.headers) },
          { alreadyApplied: true }
        );
      }
    }

    return apiError(
      "Failed to create application",
      { status: 500, headers: mergeHeaders(rateLimit.headers) },
      error.message
    );
  }

  return apiSuccess(data as ApplicationRow, { status: 201, headers: mergeHeaders(rateLimit.headers) });
}
