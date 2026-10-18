import {
  apiError,
  apiSuccess,
  applyPreAuthRateLimit,
  applyRateLimit,
  mergeHeaders,
  requireApiUser,
} from "@/lib/server/api";
import {
  RECOMMENDER_SELECT_COLUMNS,
  type RecommenderRow,
  sanitizeRecommenderApplicationRef,
  sanitizeRecommenderDate,
  sanitizeRecommenderEmail,
  sanitizeRecommenderStatus,
  sanitizeRecommenderText,
} from "@/lib/server/recommenders";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: RouteContext) {
  const { id } = await params;

  const preAuth = applyPreAuthRateLimit(req, "recommenders:patch");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "recommenders:patch",
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

  const body = (payload || {}) as Record<string, unknown>;
  const update: Record<string, unknown> = {};
  if ("name" in body) update.name = sanitizeRecommenderText(body.name, 120);
  if ("email" in body) update.email = sanitizeRecommenderEmail(body.email);
  if ("relationship" in body) update.relationship = sanitizeRecommenderText(body.relationship, 120);
  if ("status" in body) update.status = sanitizeRecommenderStatus(body.status);
  if ("dueDate" in body) update.due_date = sanitizeRecommenderDate(body.dueDate);
  if ("notes" in body) update.notes = sanitizeRecommenderText(body.notes, 2000);
  if ("applicationId" in body) update.application_id = sanitizeRecommenderApplicationRef(body.applicationId);

  if (Object.keys(update).length === 0) {
    return apiError("No valid fields to update", { status: 422, headers: mergeHeaders(rateLimit.headers) });
  }
  if (update.name === "") {
    return apiError("Name cannot be empty", { status: 422, headers: mergeHeaders(rateLimit.headers) });
  }

  const { data, error } = await supabase
    .from("recommenders")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id)
    .select(RECOMMENDER_SELECT_COLUMNS)
    .maybeSingle();

  if (error) {
    return apiError("Failed to update recommender", { status: 500, headers: mergeHeaders(rateLimit.headers) }, error.message);
  }
  if (!data) {
    return apiError("Recommender not found", { status: 404, headers: mergeHeaders(rateLimit.headers) });
  }

  return apiSuccess(data as RecommenderRow, { status: 200, headers: mergeHeaders(rateLimit.headers) });
}

export async function DELETE(req: Request, { params }: RouteContext) {
  const { id } = await params;

  const preAuth = applyPreAuthRateLimit(req, "recommenders:delete");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "recommenders:delete",
    userId: user.id,
    limit: 60,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const { error, count } = await supabase
    .from("recommenders")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return apiError("Failed to delete recommender", { status: 500, headers: mergeHeaders(rateLimit.headers) }, error.message);
  }
  if (!count) {
    return apiError("Recommender not found", { status: 404, headers: mergeHeaders(rateLimit.headers) });
  }

  return apiSuccess(null, { status: 200, headers: mergeHeaders(rateLimit.headers) });
}
