export const SETTINGS_COOKIE_KEY = "launchpath_settings";
export const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export type Settings = {
  profile: {
    name?: string;
    email?: string;
    company?: string;
  };
  integrations: {
    meta_token?: string;
    tiktok_token?: string;
    google_refresh?: string;
  };
  security: {
    twofa?: boolean;
    session_alerts?: boolean;
  };
  appearance: {
    theme?: "light" | "dark" | "system";
    accent?: "violet" | "indigo" | "fuchsia" | "emerald" | "cyan";
  };
};

export const DEFAULT_SETTINGS: Settings = {
  profile: { name: "", email: "", company: "" },
  integrations: { meta_token: "", tiktok_token: "", google_refresh: "" },
  security: { twofa: false, session_alerts: false },
  appearance: { theme: "light", accent: "indigo" },
};

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

const VALID_THEMES = new Set(["light", "dark", "system"]);
const VALID_ACCENTS = new Set(["violet", "indigo", "fuchsia", "emerald", "cyan"]);

function normalizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export function deepMerge<T extends Record<string, unknown>>(base: T, patch: DeepPartial<T>): T {
  const output: Record<string, unknown> = { ...base };

  for (const key of Object.keys(patch) as (keyof T)[]) {
    const value = patch[key];

    if (value && typeof value === "object" && !Array.isArray(value)) {
      const nestedBase = (base as Record<string, unknown>)[key as string] as Record<string, unknown> | undefined;
      output[key as string] = deepMerge(nestedBase || {}, value as Record<string, unknown>);
      continue;
    }

    if (value !== undefined) {
      output[key as string] = value as unknown;
    }
  }

  return output as T;
}

export function sanitizeSettingsPatch(input: unknown): DeepPartial<Settings> | null {
  if (!input || typeof input !== "object") return null;
  const patch = input as Record<string, unknown>;

  const profile = patch.profile;
  const integrations = patch.integrations;
  const security = patch.security;
  const appearance = patch.appearance;

  const sanitized: DeepPartial<Settings> = {};

  if (profile && typeof profile === "object") {
    const profileRecord = profile as Record<string, unknown>;
    const profilePatch: Settings["profile"] = {};
    if ("name" in profileRecord) profilePatch.name = normalizeText(profileRecord.name, 120);
    if ("email" in profileRecord) profilePatch.email = normalizeText(profileRecord.email, 160);
    if ("company" in profileRecord) profilePatch.company = normalizeText(profileRecord.company, 120);
    if (Object.keys(profilePatch).length > 0) sanitized.profile = profilePatch;
  }

  if (integrations && typeof integrations === "object") {
    const integrationsRecord = integrations as Record<string, unknown>;
    const integrationsPatch: Settings["integrations"] = {};
    if ("meta_token" in integrationsRecord) {
      integrationsPatch.meta_token = normalizeText(integrationsRecord.meta_token, 500);
    }
    if ("tiktok_token" in integrationsRecord) {
      integrationsPatch.tiktok_token = normalizeText(integrationsRecord.tiktok_token, 500);
    }
    if ("google_refresh" in integrationsRecord) {
      integrationsPatch.google_refresh = normalizeText(integrationsRecord.google_refresh, 500);
    }
    if (Object.keys(integrationsPatch).length > 0) sanitized.integrations = integrationsPatch;
  }

  if (security && typeof security === "object") {
    const securityRecord = security as Record<string, unknown>;
    const securityPatch: Settings["security"] = {};
    if ("twofa" in securityRecord) securityPatch.twofa = Boolean(securityRecord.twofa);
    if ("session_alerts" in securityRecord) securityPatch.session_alerts = Boolean(securityRecord.session_alerts);
    if (Object.keys(securityPatch).length > 0) sanitized.security = securityPatch;
  }

  if (appearance && typeof appearance === "object") {
    const appearanceRecord = appearance as Record<string, unknown>;
    const theme =
      typeof appearanceRecord.theme === "string" && VALID_THEMES.has(appearanceRecord.theme)
        ? (appearanceRecord.theme as Settings["appearance"]["theme"])
        : undefined;
    const accent =
      typeof appearanceRecord.accent === "string" && VALID_ACCENTS.has(appearanceRecord.accent)
        ? (appearanceRecord.accent as Settings["appearance"]["accent"])
        : undefined;

    const appearancePatch: Settings["appearance"] = {
      ...(theme ? { theme } : {}),
      ...(accent ? { accent } : {}),
    };
    if (Object.keys(appearancePatch).length > 0) sanitized.appearance = appearancePatch;
  }

  return sanitized;
}

export function isLikelyMissingTable(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const code = "code" in error ? (error.code as string | undefined) : undefined;
  if (code === "42P01") return true;

  const message = "message" in error ? String(error.message || "") : "";
  return message.toLowerCase().includes("relation") && message.toLowerCase().includes("does not exist");
}
