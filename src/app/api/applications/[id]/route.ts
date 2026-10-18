import {
  apiError,
  apiSuccess,
  applyPreAuthRateLimit,
  applyRateLimit,
  mergeHeaders,
  requireApiUser,
} from "@/lib/server/api";
import {
  APPLICATION_SELECT_COLUMNS,
  type ApplicationRow,
  sanitizeApplicationDate,
  sanitizeApplicationDeadline,
  sanitizeApplicationNotes,
  sanitizeApplicationProgram,
  sanitizeApplicationRef,
  sanitizeApplicationStatus,
  sanitizeApplicationUrl,
} from "@/lib/server/applications";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteContext) {
  const { id } = await params;

  const preAuth = applyPreAuthRateLimit(req, "applications:get-one");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "applications:get-one",
    userId: user.id,
    limit: 120,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const { data, error } = await supabase
    .from("applications")
    .select(APPLICATION_SELECT_COLUMNS)
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return apiError(
      "Failed to load application",
      { status: 500, headers: mergeHeaders(rateLimit.headers) },
      error.message
    );
  }

  if (!data) {
    return apiError("Application not found", { status: 404, headers: mergeHeaders(rateLimit.headers) });
  }

  return apiSuccess(data as ApplicationRow, { status: 200, headers: mergeHeaders(rateLimit.headers) });
}

export async function PATCH(req: Request, { params }: RouteContext) {
  const { id } = await params;

  const preAuth = applyPreAuthRateLimit(req, "applications:patch");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "applications:patch",
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
  if ("program" in body) update.program = sanitizeApplicationProgram(body.program);
  if ("status" in body) update.status = sanitizeApplicationStatus(body.status);
  if ("date" in body) update.date = sanitizeApplicationDate(body.date);
  if ("deadline" in body) update.deadline = sanitizeApplicationDeadline(body.deadline);
  if ("notes" in body) update.notes = sanitizeApplicationNotes(body.notes);
  if ("url" in body) update.url = sanitizeApplicationUrl(body.url);
  if ("resumeId" in body) update.resume_id = sanitizeApplicationRef(body.resumeId);
  if ("coverLetterId" in body) update.cover_letter_id = sanitizeApplicationRef(body.coverLetterId);

  if (Object.keys(update).length === 0) {
    return apiError("No valid fields to update", { status: 422, headers: mergeHeaders(rateLimit.headers) });
  }

  if (update.program === "") {
    return apiError("Program cannot be empty", { status: 422, headers: mergeHeaders(rateLimit.headers) });
  }

  const { data, error } = await supabase
    .from("applications")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id)
    .select(APPLICATION_SELECT_COLUMNS)
    .maybeSingle();

  if (error) {
    return apiError(
      "Failed to update application",
      { status: 500, headers: mergeHeaders(rateLimit.headers) },
      error.message
    );
  }

  if (!data) {
    return apiError("Application not found", { status: 404, headers: mergeHeaders(rateLimit.headers) });
  }

  return apiSuccess(data as ApplicationRow, { status: 200, headers: mergeHeaders(rateLimit.headers) });
}

export async function DELETE(req: Request, { params }: RouteContext) {
  const { id } = await params;

  const preAuth = applyPreAuthRateLimit(req, "applications:delete");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "applications:delete",
    userId: user.id,
    limit: 60,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const { error, count } = await supabase
    .from("applications")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return apiError(
      "Failed to delete application",
      { status: 500, headers: mergeHeaders(rateLimit.headers) },
      error.message
    );
  }

  if (!count) {
    return apiError("Application not found", { status: 404, headers: mergeHeaders(rateLimit.headers) });
  }

  return apiSuccess(null, { status: 200, headers: mergeHeaders(rateLimit.headers) });
}
