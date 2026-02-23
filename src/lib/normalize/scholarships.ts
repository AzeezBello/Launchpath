import { Scholarship } from "../types";

type ApiAbroadItem = {
  id?: string;
  title?: string;
  provider?: string;
  amount?: string;
  min_amount?: number;
  max_amount?: number;
  deadline?: string;
  country?: string;
  description?: string;
  url?: string;
  fields?: string[];
  eligibility?: Scholarship["eligibilityLevel"];
};

type ScholarshipOwlItem = {
  id?: string;
  name?: string;
  organization?: string;
  amount_display?: string;
  min?: number;
  max?: number;
  deadline?: string;
  country?: string;
  summary?: string;
  link?: string;
  categories?: string[];
};

// 🧠 Normalize data from hypothetical API Abroad
export const normalizeApiAbroad = (items: ApiAbroadItem[]): Scholarship[] => {
  return items.map((item, index) => ({
    id: `apiabroad-${item.id ?? index}`,
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
    eligibilityLevel: item.eligibility || "All",
  }));
};

// 🧠 Normalize data from another external source (mock example)
export const normalizeScholarshipOwl = (items: ScholarshipOwlItem[]): Scholarship[] => {
  return items.map((item, index) => ({
    id: `owl-${item.id ?? index}`,
    title: item.name || "Scholarship",
    provider: item.organization || "Scholarship Owl",
    amount: item.amount_display,
    amountMin: item.min,
    amountMax: item.max,
    deadline: item.deadline || "N/A",
    country: item.country || "Global",
    description: item.summary || "",
    url: item.link || "#",
    fields: item.categories || [],
    eligibilityLevel: "All",
  }));
};
