import { toast } from "sonner";

export const PLAN_LIMIT_ERROR_CODE = "PLAN_LIMIT";

type ApiErrorPayload = { error?: string; details?: { code?: string } } | null | undefined;

/**
 * If an API error is a plan-limit rejection (402 + PLAN_LIMIT), show an
 * upgrade toast and return true so the caller can skip its generic error.
 */
export function handlePlanLimit(status: number, payload: ApiErrorPayload) {
  if (status !== 402 || payload?.details?.code !== PLAN_LIMIT_ERROR_CODE) return false;
  toast.error(payload?.error || "You've hit your plan limit", {
    description: "Upgrade to Pro for more headroom.",
    action: {
      label: "Upgrade",
      onClick: () => {
        window.location.assign("/dashboard/settings#billing");
      },
    },
  });
  return true;
}
