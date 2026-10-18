import type { OpportunityType } from "@/lib/types";

/** In-app detail page for any opportunity, static or live. */
export function opportunityDetailHref(type: OpportunityType, id: string) {
  return `/dashboard/opportunities/${type}/${encodeURIComponent(id)}`;
}

/** Prefilled cover-letter generator link for a job-like opportunity. */
export function coverLetterHrefFor(position: string, company?: string, description?: string) {
  const params = new URLSearchParams({ position });
  if (company) params.set("company", company);
  if (description) params.set("description", description.slice(0, 1500));
  return `/dashboard/cover-letter?${params.toString()}`;
}
