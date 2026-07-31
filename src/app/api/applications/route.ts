import {
  apiError,
  apiSuccess,
  applyPreAuthRateLimit,
  applyRateLimit,
  clampInt,
  mergeHeaders,
  requireApiUser,
} from "@/lib/server/api";
import { isLikelyMissingTable } from "@/lib/server/settings";
import {
  isUniqueViolation,
  sanitizeOpportunityId,
  sanitizeOpportunityType,
} from "@/lib/server/opportunities";
import {
  APPLICATION_SELECT_COLUMNS as SELECT_COLUMNS,
  type ApplicationRow,
  sanitizeApplicationDate as sanitizeDate,
  sanitizeApplicationProgram as sanitizeProgram,
  sanitizeApplicationStatus as sanitizeStatus,
} from "@/lib/server/applications";

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

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("applications")
    .select(SELECT_COLUMNS, { count: "exact" })
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .range(from, to);

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

  const { data, error } = await supabase
    .from("applications")
    .insert({
      user_id: user.id,
      program,
      status,
      date,
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
