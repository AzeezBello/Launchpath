import {
  apiError,
  apiSuccess,
  applyPreAuthRateLimit,
  applyRateLimit,
  mergeHeaders,
  requireApiUser,
} from "@/lib/server/api";
import {
  ESSAY_SELECT_COLUMNS,
  type EssayRow,
  sanitizeEssayApplicationRef,
  sanitizeEssayStatus,
  sanitizeEssayText,
  sanitizeEssayWordLimit,
} from "@/lib/server/essays";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteContext) {
  const { id } = await params;

  const preAuth = applyPreAuthRateLimit(req, "essays:get-one");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "essays:get-one",
    userId: user.id,
    limit: 120,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const { data, error } = await supabase
    .from("essays")
    .select(ESSAY_SELECT_COLUMNS)
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return apiError("Failed to load essay", { status: 500, headers: mergeHeaders(rateLimit.headers) }, error.message);
  }
  if (!data) {
    return apiError("Essay not found", { status: 404, headers: mergeHeaders(rateLimit.headers) });
  }

  return apiSuccess(data as EssayRow, { status: 200, headers: mergeHeaders(rateLimit.headers) });
}

export async function PATCH(req: Request, { params }: RouteContext) {
  const { id } = await params;

  const preAuth = applyPreAuthRateLimit(req, "essays:patch");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "essays:patch",
    userId: user.id,
    limit: 120,
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
  const update: Record<string, unknown> = {};
  if ("title" in body) update.title = sanitizeEssayText(body.title, 200);
  if ("prompt" in body) update.prompt = sanitizeEssayText(body.prompt, 4000);
  if ("content" in body) update.content = sanitizeEssayText(body.content, 60000);
  if ("wordLimit" in body) update.word_limit = sanitizeEssayWordLimit(body.wordLimit);
  if ("status" in body) update.status = sanitizeEssayStatus(body.status);
  if ("applicationId" in body) update.application_id = sanitizeEssayApplicationRef(body.applicationId);

  if (Object.keys(update).length === 0) {
    return apiError("No valid fields to update", { status: 422, headers: mergeHeaders(rateLimit.headers) });
  }
  if (update.title === "") {
    return apiError("Title cannot be empty", { status: 422, headers: mergeHeaders(rateLimit.headers) });
  }

  const { data, error } = await supabase
    .from("essays")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id)
    .select(ESSAY_SELECT_COLUMNS)
    .maybeSingle();

  if (error) {
    return apiError("Failed to update essay", { status: 500, headers: mergeHeaders(rateLimit.headers) }, error.message);
  }
  if (!data) {
    return apiError("Essay not found", { status: 404, headers: mergeHeaders(rateLimit.headers) });
  }

  return apiSuccess(data as EssayRow, { status: 200, headers: mergeHeaders(rateLimit.headers) });
}

export async function DELETE(req: Request, { params }: RouteContext) {
  const { id } = await params;

  const preAuth = applyPreAuthRateLimit(req, "essays:delete");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "essays:delete",
    userId: user.id,
    limit: 60,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const { error, count } = await supabase
    .from("essays")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return apiError("Failed to delete essay", { status: 500, headers: mergeHeaders(rateLimit.headers) }, error.message);
  }
  if (!count) {
    return apiError("Essay not found", { status: 404, headers: mergeHeaders(rateLimit.headers) });
  }

  return apiSuccess(null, { status: 200, headers: mergeHeaders(rateLimit.headers) });
}
