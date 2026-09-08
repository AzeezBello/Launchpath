import {
  apiError,
  apiSuccess,
  applyPreAuthRateLimit,
  applyRateLimit,
  mergeHeaders,
  requireApiUser,
} from "@/lib/server/api";
import { resolvePlan } from "@/lib/server/plans";
import { getAppBaseUrl, getProPriceId, getStripe } from "@/lib/server/stripe";

// POST /api/billing/checkout → { url } for a Stripe Checkout subscription session.
export async function POST(req: Request) {
  const preAuth = applyPreAuthRateLimit(req, "billing:checkout");
  if (!preAuth.ok) return preAuth.response;

  const { user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "billing:checkout",
    userId: user.id,
    limit: 10,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const stripe = getStripe();
  const priceId = getProPriceId();
  if (!stripe || !priceId) {
    return apiError("Billing is not configured", { status: 501, headers: mergeHeaders(rateLimit.headers) });
  }

  if (resolvePlan(user) !== "starter") {
    return apiError("You already have a paid plan", { status: 409, headers: mergeHeaders(rateLimit.headers) });
  }

  const baseUrl = getAppBaseUrl();
  const existingCustomer =
    typeof user.app_metadata?.stripe_customer_id === "string" ? user.app_metadata.stripe_customer_id : undefined;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: user.id,
      ...(existingCustomer ? { customer: existingCustomer } : { customer_email: user.email || undefined }),
      // user_id on the subscription lets the webhook map renewals and
      // cancellations back to the account without a lookup table.
      subscription_data: { metadata: { user_id: user.id } },
      metadata: { user_id: user.id },
      allow_promotion_codes: true,
      success_url: `${baseUrl}/dashboard/settings?billing=success`,
      cancel_url: `${baseUrl}/dashboard/settings?billing=cancelled`,
    });

    if (!session.url) {
      return apiError("Stripe did not return a checkout URL", { status: 502, headers: mergeHeaders(rateLimit.headers) });
    }

    return apiSuccess({ url: session.url }, { status: 200, headers: mergeHeaders(rateLimit.headers) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to start checkout";
    return apiError(message, { status: 502, headers: mergeHeaders(rateLimit.headers) });
  }
}
