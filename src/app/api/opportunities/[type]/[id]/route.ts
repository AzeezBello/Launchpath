import { apiError, apiSuccess, applyRateLimit, mergeHeaders } from "@/lib/server/api";
import { sanitizeOpportunityId, sanitizeOpportunityType } from "@/lib/server/opportunities";
import { findOpportunity } from "@/lib/server/opportunity-catalog";

type RouteContext = { params: Promise<{ type: string; id: string }> };

// Public, like the listing endpoints: opportunity data is not user-scoped.
export async function GET(req: Request, { params }: RouteContext) {
  const rateLimit = applyRateLimit({
    request: req,
    route: "opportunities:get-one",
    limit: 180,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const { type: rawType, id: rawId } = await params;
  const type = sanitizeOpportunityType(rawType);
  const id = sanitizeOpportunityId(decodeURIComponent(rawId));

  if (!type || !id) {
    return apiError("Invalid opportunity reference", { status: 422, headers: mergeHeaders(rateLimit.headers) });
  }

  const detail = await findOpportunity(type, id);
  if (!detail) {
    return apiError("Opportunity not found", { status: 404, headers: mergeHeaders(rateLimit.headers) });
  }

  return apiSuccess(detail, { status: 200, headers: mergeHeaders(rateLimit.headers) });
}
