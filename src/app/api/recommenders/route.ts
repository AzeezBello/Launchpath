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
  RECOMMENDER_SELECT_COLUMNS,
  type RecommenderRow,
  sanitizeRecommenderApplicationRef,
  sanitizeRecommenderDate,
  sanitizeRecommenderEmail,
  sanitizeRecommenderStatus,
  sanitizeRecommenderText,
} from "@/lib/server/recommenders";

export async function GET(req: Request) {
  const preAuth = applyPreAuthRateLimit(req, "recommenders:get");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "recommenders:get",
    userId: user.id,
    limit: 120,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const { searchParams } = new URL(req.url);
  const limit = clampInt(searchParams.get("limit"), 100, 1, 200);
  const applicationId = sanitizeRecommenderApplicationRef(searchParams.get("applicationId"));

  let query = supabase
    .from("recommenders")
    .select(RECOMMENDER_SELECT_COLUMNS)
    .eq("user_id", user.id)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (applicationId) query = query.eq("application_id", applicationId);

  const { data, error } = await query;

  if (error) {
    if (isLikelyMissingTable(error)) {
      return apiSuccess([], { status: 200, headers: mergeHeaders(rateLimit.headers) }, { source: "empty-fallback" });
    }
    return apiError("Failed to load recommenders", { status: 500, headers: mergeHeaders(rateLimit.headers) }, error.message);
  }

  return apiSuccess((data || []) as RecommenderRow[], { status: 200, headers: mergeHeaders(rateLimit.headers) });
}

export async function POST(req: Request) {
  const preAuth = applyPreAuthRateLimit(req, "recommenders:post");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "recommenders:post",
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
  const name = sanitizeRecommenderText(body.name, 120);
  if (!name) {
    return apiError("Name is required", { status: 422, headers: mergeHeaders(rateLimit.headers) });
  }

  const { data, error } = await supabase
    .from("recommenders")
    .insert({
      user_id: user.id,
      name,
      email: sanitizeRecommenderEmail(body.email),
      relationship: sanitizeRecommenderText(body.relationship, 120),
      status: sanitizeRecommenderStatus(body.status),
      due_date: sanitizeRecommenderDate(body.dueDate),
      notes: sanitizeRecommenderText(body.notes, 2000),
      application_id: sanitizeRecommenderApplicationRef(body.applicationId),
    })
    .select(RECOMMENDER_SELECT_COLUMNS)
    .single();

  if (error) {
    if (isLikelyMissingTable(error)) {
      return apiError("Recommenders table is missing. Run supabase/migrations/20260908_recommenders.sql.", {
        status: 501,
        headers: mergeHeaders(rateLimit.headers),
      });
    }
    return apiError("Failed to add recommender", { status: 500, headers: mergeHeaders(rateLimit.headers) }, error.message);
  }

  return apiSuccess(data as RecommenderRow, { status: 201, headers: mergeHeaders(rateLimit.headers) });
}
