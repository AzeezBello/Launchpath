import { Scholarship } from "../types";

// 🧠 Normalize data from hypothetical API Abroad
export const normalizeApiAbroad = (items: any[]): Scholarship[] => {
  return items.map((item: any) => ({
    id: `apiabroad-${item.id}`,
    title: item.title || "Unknown Scholarship",
    provider: item.provider || "API Abroad",
    amount: item.amount || "",
    amountMin: item.min_amount,
    amountMax: item.max_amount,
    deadline: item.deadline || "N/A",
    country: item.country || "Unknown",
    description: item.description || "",
    url: item.url || "#",
    fields: item.fields || [],
    eligibilityLevel: (item.eligibility as Scholarship["eligibilityLevel"]) || "All",
  }));
};

// 🧠 Normalize data from another external source (mock example)
export const normalizeScholarshipOwl = (items: any[]): Scholarship[] => {
  return items.map((item: any) => ({
    id: `owl-${item.id}`,
    title: item.name,
    provider: item.organization || "Scholarship Owl",
    amount: item.amount_display,
    amountMin: item.min || undefined,
    amountMax: item.max || undefined,
    deadline: item.deadline || "N/A",
    country: item.country || "Global",
    description: item.summary || "",
    url: item.link || "#",
    fields: item.categories || [],
    eligibilityLevel: "All",
  }));
};
