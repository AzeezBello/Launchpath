import {
  apiError,
  apiSuccess,
  applyPreAuthRateLimit,
  applyRateLimit,
  mergeHeaders,
  requireApiUser,
} from "@/lib/server/api";
import { getAppBaseUrl, getStripe } from "@/lib/server/stripe";

// POST /api/billing/portal → { url } for the Stripe customer portal
// (change card, cancel, download invoices).
export async function POST(req: Request) {
  const preAuth = applyPreAuthRateLimit(req, "billing:portal");
  if (!preAuth.ok) return preAuth.response;

  const { user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "billing:portal",
    userId: user.id,
    limit: 10,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const stripe = getStripe();
  if (!stripe) {
    return apiError("Billing is not configured", { status: 501, headers: mergeHeaders(rateLimit.headers) });
  }

  const customerId = user.app_metadata?.stripe_customer_id;
  if (typeof customerId !== "string" || !customerId) {
    return apiError("No billing account yet. Upgrade first.", { status: 404, headers: mergeHeaders(rateLimit.headers) });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${getAppBaseUrl()}/dashboard/settings`,
    });
    return apiSuccess({ url: session.url }, { status: 200, headers: mergeHeaders(rateLimit.headers) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to open billing portal";
    return apiError(message, { status: 502, headers: mergeHeaders(rateLimit.headers) });
  }
}
