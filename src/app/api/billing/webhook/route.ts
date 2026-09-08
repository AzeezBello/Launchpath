import type Stripe from "stripe";
import { apiError, apiSuccess } from "@/lib/server/api";
import { getStripe } from "@/lib/server/stripe";
import { getSupabaseAdminClient } from "@/lib/server/supabase-admin";
import { logger } from "@/lib/logger";
import type { PlanKey } from "@/lib/server/plans";

// Stripe → LaunchPath. Verifies the signature, then mirrors subscription state
// into auth app_metadata: { plan, stripe_customer_id, stripe_subscription_id }.
// app_metadata is server-writable only, so users cannot grant themselves a plan.

const ACTIVE_STATUSES = new Set<Stripe.Subscription.Status>(["active", "trialing", "past_due"]);

async function setPlan(
  userId: string,
  plan: PlanKey,
  extra: { customerId?: string | null; subscriptionId?: string | null }
) {
  const admin = getSupabaseAdminClient();
  if (!admin) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");

  const { data: current } = await admin.auth.admin.getUserById(userId);
  const existing = (current?.user?.app_metadata || {}) as Record<string, unknown>;

  const { error } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: {
      ...existing,
      plan,
      ...(extra.customerId ? { stripe_customer_id: extra.customerId } : {}),
      ...(extra.subscriptionId !== undefined
        ? { stripe_subscription_id: extra.subscriptionId }
        : {}),
    },
  });
  if (error) throw error;
}

function customerIdOf(value: string | Stripe.Customer | Stripe.DeletedCustomer | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return apiError("Billing is not configured", 501);
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return apiError("Missing signature", 400);

  let event: Stripe.Event;
  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (error) {
    logger.warn("Stripe webhook signature check failed", error);
    return apiError("Invalid signature", 400);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.user_id;
        if (!userId) break;
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null;
        await setPlan(userId, "pro", {
          customerId: customerIdOf(session.customer),
          subscriptionId,
        });
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;
        if (!userId) {
          logger.warn("Subscription event without user_id metadata", { id: subscription.id });
          break;
        }
        const active = event.type !== "customer.subscription.deleted" && ACTIVE_STATUSES.has(subscription.status);
        await setPlan(userId, active ? "pro" : "starter", {
          customerId: customerIdOf(subscription.customer),
          subscriptionId: active ? subscription.id : null,
        });
        break;
      }

      default:
        // Other events are acknowledged but ignored.
        break;
    }
  } catch (error) {
    logger.error("Stripe webhook handling failed", { type: event.type, error });
    // 500 makes Stripe retry, which is what we want for transient Supabase errors.
    return apiError("Webhook handler failed", 500);
  }

  return apiSuccess({ received: true });
}
