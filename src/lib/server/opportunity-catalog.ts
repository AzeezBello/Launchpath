import { admissionData, grantData, jobData, scholarshipData } from "@/data/opportunities";
import { fetchRemotiveJobs } from "@/lib/providers/remotiveJobs";
import { fetchGrantsGovGrants } from "@/lib/providers/grantsGovGrants";
import { fetchCollegeScorecardAdmissions } from "@/lib/providers/collegeScorecardAdmissions";
import type { OpportunityType } from "@/lib/server/opportunities";

/**
 * One normalised shape for the detail page, regardless of whether the item
 * came from the static seed list or a live provider.
 */
export type OpportunityDetail = {
  id: string;
  type: OpportunityType;
  title: string;
  subtitle: string;
  href: string;
  country?: string;
  deadline?: string;
  amount?: string;
  level?: string;
  fields?: string[];
  description?: string;
  source: string;
  /** Extra label/value rows for the details panel. */
  meta: { label: string; value: string }[];
  /** Snapshot fields to store on a bookmark so the saved card can render offline. */
  bookmarkMeta: Record<string, string>;
};

type Scholarship = (typeof scholarshipData)[number];
type Grant = (typeof grantData)[number] & { sector?: string; description?: string };
type Job = (typeof jobData)[number] & { source?: string };
type Admission = (typeof admissionData)[number];

function scholarshipDetail(item: Scholarship): OpportunityDetail {
  return {
    id: item.id,
    type: "scholarship",
    title: item.title,
    subtitle: item.provider,
    href: item.link,
    country: item.country,
    deadline: item.deadline,
    amount: item.amount,
    level: item.level,
    fields: item.fields,
    description: item.description,
    source: "Curated",
    meta: [
      { label: "Provider", value: item.provider },
      { label: "Country", value: item.country },
      ...(item.amount ? [{ label: "Funding", value: item.amount }] : []),
      ...(item.level ? [{ label: "Level", value: item.level }] : []),
      ...(item.fields?.length ? [{ label: "Fields", value: item.fields.join(", ") }] : []),
    ],
    bookmarkMeta: {
      provider: item.provider,
      country: item.country,
      deadline: item.deadline || "",
      href: item.link,
    },
  };
}

function grantDetail(item: Grant, source: string): OpportunityDetail {
  return {
    id: item.id,
    type: "grant",
    title: item.title,
    subtitle: item.organization,
    href: item.link,
    country: item.country,
    amount: item.amount,
    fields: item.sector ? [item.sector] : undefined,
    description: item.description,
    source,
    meta: [
      { label: "Organization", value: item.organization },
      { label: "Country", value: item.country },
      ...(item.amount ? [{ label: "Amount", value: item.amount }] : []),
      ...(item.sector ? [{ label: "Sector", value: item.sector }] : []),
    ],
    bookmarkMeta: {
      organization: item.organization,
      amount: item.amount || "",
      country: item.country,
      href: item.link,
    },
  };
}

function jobDetail(item: Job): OpportunityDetail {
  return {
    id: item.id,
    type: "job",
    title: item.title,
    subtitle: item.company,
    href: item.link,
    country: item.location,
    source: item.source || "Curated",
    meta: [
      { label: "Company", value: item.company },
      { label: "Location", value: item.location },
      { label: "Type", value: item.type },
    ],
    bookmarkMeta: {
      company: item.company,
      location: item.location,
      type: item.type,
      href: item.link,
    },
  };
}

function admissionDetail(item: Admission, source: string): OpportunityDetail {
  return {
    id: item.id,
    type: "admission",
    title: item.name,
    subtitle: item.field,
    href: item.website,
    country: item.country,
    fields: [item.field],
    source,
    meta: [
      { label: "Country", value: item.country },
      { label: "Field", value: item.field },
    ],
    bookmarkMeta: {
      country: item.country,
      field: item.field,
      href: item.website,
    },
  };
}

/**
 * Resolve one opportunity by type + id. Static items are matched first (no
 * network); live provider lists are only consulted for ids they generated,
 * which each provider prefixes ("remotive-", "grants-", "scorecard-").
 */
export async function findOpportunity(type: OpportunityType, id: string): Promise<OpportunityDetail | null> {
  switch (type) {
    case "scholarship": {
      const item = scholarshipData.find((s) => s.id === id);
      return item ? scholarshipDetail(item) : null;
    }
    case "grant": {
      const local = grantData.find((g) => g.id === id);
      if (local) return grantDetail(local, "Curated");
      if (id.startsWith("grants-")) {
        const live = (await fetchGrantsGovGrants()).find((g) => g.id === id);
        return live ? grantDetail(live as Grant, "Grants.gov") : null;
      }
      return null;
    }
    case "job": {
      const local = jobData.find((j) => j.id === id);
      if (local) return jobDetail(local);
      if (id.startsWith("remotive-")) {
        const live = (await fetchRemotiveJobs()).find((j) => j.id === id);
        return live ? jobDetail(live) : null;
      }
      return null;
    }
    case "admission": {
      const local = admissionData.find((a) => a.id === id);
      if (local) return admissionDetail(local, "Curated");
      if (id.startsWith("scorecard-")) {
        const live = (await fetchCollegeScorecardAdmissions()).find((a) => a.id === id);
        return live ? admissionDetail(live, "College Scorecard") : null;
      }
      return null;
    }
    default:
      return null;
  }
}
