import {
  apiError,
  apiSuccess,
  applyPreAuthRateLimit,
  applyRateLimit,
  mergeHeaders,
  requireApiUser,
} from "@/lib/server/api";
import { isLikelyMissingTable } from "@/lib/server/settings";

type LinkedApplicationRow = {
  opportunity_id: string;
  opportunity_type: string;
  status: string;
};

// Lightweight, unpaginated list of {opportunity_id, opportunity_type} for every
// application the user created via "Apply" — used only to render "Applied"
// state on opportunity cards, so it skips the page/limit machinery in
// GET /api/applications and caps at a flat 500 rows.
export async function GET(req: Request) {
  const preAuth = applyPreAuthRateLimit(req, "applications:linked:get");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "applications:linked:get",
    userId: user.id,
    limit: 120,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const { data, error } = await supabase
    .from("applications")
    .select("opportunity_id, opportunity_type, status")
    .eq("user_id", user.id)
    .not("opportunity_id", "is", null)
    .limit(500);

  if (error) {
    if (isLikelyMissingTable(error)) {
      return apiSuccess([], { status: 200, headers: mergeHeaders(rateLimit.headers) }, { source: "empty-fallback" });
    }
    return apiError(
      "Failed to load linked applications",
      { status: 500, headers: mergeHeaders(rateLimit.headers) },
      error.message
    );
  }

  return apiSuccess((data || []) as LinkedApplicationRow[], {
    status: 200,
    headers: mergeHeaders(rateLimit.headers),
  });
}
