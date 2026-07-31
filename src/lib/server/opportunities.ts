export type OpportunityType = "scholarship" | "grant" | "job" | "admission";

export const OPPORTUNITY_TYPES = new Set<OpportunityType>([
  "scholarship",
  "grant",
  "job",
  "admission",
]);

export function sanitizeOpportunityType(value: unknown): OpportunityType | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase() as OpportunityType;
  return OPPORTUNITY_TYPES.has(normalized) ? normalized : null;
}

export function sanitizeOpportunityId(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 120);
}

export function sanitizeOpportunityTitle(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 200);
}

const META_KEY_ALLOWLIST = new Set([
  "label",
  "value",
  "href",
  "provider",
  "organization",
  "company",
  "country",
  "location",
  "type",
  "amount",
  "deadline",
  "field",
]);

// Meta is a small display-only snapshot (card subtitle fields), not arbitrary
// user data, so we allowlist keys and cap string length rather than storing
// whatever shape the client sends.
export function sanitizeOpportunityMeta(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const source = value as Record<string, unknown>;
  const sanitized: Record<string, string> = {};

  for (const key of Object.keys(source)) {
    if (!META_KEY_ALLOWLIST.has(key)) continue;
    const raw = source[key];
    if (typeof raw !== "string") continue;
    const trimmed = raw.trim().slice(0, 300);
    if (trimmed) sanitized[key] = trimmed;
  }

  return sanitized;
}

export function isUniqueViolation(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? (error.code as string | undefined) : undefined;
  return code === "23505";
}
