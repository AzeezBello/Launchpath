import {
  apiError,
  apiSuccess,
  applyPreAuthRateLimit,
  applyRateLimit,
  mergeHeaders,
  requireApiUser,
} from "@/lib/server/api";
import {
  INTERVIEW_SELECT_COLUMNS,
  type InterviewRow,
  sanitizeInterviewApplicationRef,
  sanitizeInterviewDate,
  sanitizeInterviewStatus,
  sanitizeInterviewText,
} from "@/lib/server/interviews";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: RouteContext) {
  const { id } = await params;

  const preAuth = applyPreAuthRateLimit(req, "interview:patch");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "interview:patch",
    userId: user.id,
    limit: 60,
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
  const update: Record<string, unknown> = {};
  if ("candidate" in body) update.candidate = sanitizeInterviewText(body.candidate, 120);
  if ("position" in body) update.position = sanitizeInterviewText(body.position, 120);
  if ("date" in body) update.date = sanitizeInterviewDate(body.date);
  if ("status" in body) update.status = sanitizeInterviewStatus(body.status);
  if ("applicationId" in body) update.application_id = sanitizeInterviewApplicationRef(body.applicationId);
  if ("notes" in body) update.notes = sanitizeInterviewText(body.notes, 4000);
  if ("location" in body) update.location = sanitizeInterviewText(body.location, 200);

  if (Object.keys(update).length === 0) {
    return apiError("No valid fields to update", { status: 422, headers: mergeHeaders(rateLimit.headers) });
  }

  if (update.candidate === "" || update.position === "") {
    return apiError("Company and position cannot be empty", {
      status: 422,
      headers: mergeHeaders(rateLimit.headers),
    });
  }

  const { data, error } = await supabase
    .from("interviews")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id)
    .select(INTERVIEW_SELECT_COLUMNS)
    .maybeSingle();

  if (error) {
    return apiError(
      "Failed to update interview",
      { status: 500, headers: mergeHeaders(rateLimit.headers) },
      error.message
    );
  }

  if (!data) {
    return apiError("Interview not found", { status: 404, headers: mergeHeaders(rateLimit.headers) });
  }

  return apiSuccess(data as InterviewRow, { status: 200, headers: mergeHeaders(rateLimit.headers) });
}

export async function DELETE(req: Request, { params }: RouteContext) {
  const { id } = await params;

  const preAuth = applyPreAuthRateLimit(req, "interview:delete");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "interview:delete",
    userId: user.id,
    limit: 60,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const { error, count } = await supabase
    .from("interviews")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return apiError(
      "Failed to delete interview",
      { status: 500, headers: mergeHeaders(rateLimit.headers) },
      error.message
    );
  }

  if (!count) {
    return apiError("Interview not found", { status: 404, headers: mergeHeaders(rateLimit.headers) });
  }

  return apiSuccess(null, { status: 200, headers: mergeHeaders(rateLimit.headers) });
}
