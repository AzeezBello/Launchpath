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
  sanitizeOpportunityMeta,
  sanitizeOpportunityTitle,
  sanitizeOpportunityType,
} from "@/lib/server/opportunities";

type SavedOpportunityRow = {
  id: string;
  user_id: string;
  opportunity_id: string;
  opportunity_type: string;
  title: string;
  meta: Record<string, string>;
  created_at: string;
};

const SELECT_COLUMNS = "id, user_id, opportunity_id, opportunity_type, title, meta, created_at";

export async function GET(req: Request) {
  const preAuth = applyPreAuthRateLimit(req, "bookmarks:get");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "bookmarks:get",
    userId: user.id,
    limit: 120,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const { searchParams } = new URL(req.url);
  const page = clampInt(searchParams.get("page"), 1, 1, 1000);
  const limit = clampInt(searchParams.get("limit"), 60, 1, 200);

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("saved_opportunities")
    .select(SELECT_COLUMNS, { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
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
      "Failed to load saved opportunities",
      { status: 500, headers: mergeHeaders(rateLimit.headers) },
      error.message
    );
  }

  const rows = (data || []) as SavedOpportunityRow[];
  const total = count || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return apiSuccess(rows, { status: 200, headers: mergeHeaders(rateLimit.headers) }, { page, totalPages, total });
}

export async function POST(req: Request) {
  const preAuth = applyPreAuthRateLimit(req, "bookmarks:post");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "bookmarks:post",
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
  const opportunityId = sanitizeOpportunityId(body.opportunityId);
  const opportunityType = sanitizeOpportunityType(body.opportunityType);
  const title = sanitizeOpportunityTitle(body.title);
  const meta = sanitizeOpportunityMeta(body.meta);

  if (!opportunityId || !opportunityType) {
    return apiError(
      "opportunityId and a valid opportunityType are required",
      { status: 422, headers: mergeHeaders(rateLimit.headers) }
    );
  }

  const { data, error } = await supabase
    .from("saved_opportunities")
    .insert({
      user_id: user.id,
      opportunity_id: opportunityId,
      opportunity_type: opportunityType,
      title,
      meta,
    })
    .select(SELECT_COLUMNS)
    .single();

  if (error) {
    if (isLikelyMissingTable(error)) {
      return apiError(
        "Saved opportunities table is missing. Run the latest migration to enable bookmarking.",
        { status: 501, headers: mergeHeaders(rateLimit.headers) }
      );
    }

    if (isUniqueViolation(error)) {
      // Already saved — treat as idempotent success instead of an error.
      const { data: existing } = await supabase
        .from("saved_opportunities")
        .select(SELECT_COLUMNS)
        .eq("user_id", user.id)
        .eq("opportunity_id", opportunityId)
        .eq("opportunity_type", opportunityType)
        .maybeSingle();

      if (existing) {
        return apiSuccess(existing as SavedOpportunityRow, {
          status: 200,
          headers: mergeHeaders(rateLimit.headers),
        });
      }
    }

    return apiError(
      "Failed to save opportunity",
      { status: 500, headers: mergeHeaders(rateLimit.headers) },
      error.message
    );
  }

  return apiSuccess(data as SavedOpportunityRow, { status: 201, headers: mergeHeaders(rateLimit.headers) });
}

export async function DELETE(req: Request) {
  const preAuth = applyPreAuthRateLimit(req, "bookmarks:delete");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "bookmarks:delete",
    userId: user.id,
    limit: 60,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const opportunityId = sanitizeOpportunityId(searchParams.get("opportunityId"));
  const opportunityType = sanitizeOpportunityType(searchParams.get("opportunityType"));

  let query = supabase.from("saved_opportunities").delete().eq("user_id", user.id);

  if (id) {
    query = query.eq("id", id);
  } else if (opportunityId && opportunityType) {
    query = query.eq("opportunity_id", opportunityId).eq("opportunity_type", opportunityType);
  } else {
    return apiError(
      "Provide either id or (opportunityId and opportunityType)",
      { status: 422, headers: mergeHeaders(rateLimit.headers) }
    );
  }

  const { error } = await query;

  if (error) {
    if (isLikelyMissingTable(error)) {
      return apiSuccess(null, { status: 200, headers: mergeHeaders(rateLimit.headers) });
    }
    return apiError(
      "Failed to remove saved opportunity",
      { status: 500, headers: mergeHeaders(rateLimit.headers) },
      error.message
    );
  }

  return apiSuccess(null, { status: 200, headers: mergeHeaders(rateLimit.headers) });
}
