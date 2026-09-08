import { decryptSecret, encryptSecret } from "@/lib/server/crypto";

export const SETTINGS_COOKIE_KEY = "launchpath_settings";
export const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export type OnboardingFocus = "scholarship" | "grant" | "job" | "admission";

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
  onboarding: {
    completed?: boolean;
    focus?: OnboardingFocus[];
    tourCompletedAt?: string;
  };
  notifications: {
    /** Daily email when an open application is 7/3/1/0 days from its deadline. Defaults on. */
    deadlineReminders?: boolean;
  };
};

export const DEFAULT_SETTINGS: Settings = {
  profile: { name: "", email: "", company: "" },
  integrations: { meta_token: "", tiktok_token: "", google_refresh: "" },
  security: { twofa: false, session_alerts: false },
  appearance: { theme: "light", accent: "indigo" },
  onboarding: { completed: false, focus: [] },
  notifications: { deadlineReminders: true },
};

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

const VALID_THEMES = new Set(["light", "dark", "system"]);
const VALID_ACCENTS = new Set(["violet", "indigo", "fuchsia", "emerald", "cyan"]);
const VALID_FOCUS = new Set<OnboardingFocus>(["scholarship", "grant", "job", "admission"]);

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

  const onboarding = patch.onboarding;
  if (onboarding && typeof onboarding === "object") {
    const onboardingRecord = onboarding as Record<string, unknown>;
    const onboardingPatch: Settings["onboarding"] = {};

    if ("completed" in onboardingRecord) {
      onboardingPatch.completed = Boolean(onboardingRecord.completed);
    }

    if ("focus" in onboardingRecord && Array.isArray(onboardingRecord.focus)) {
      onboardingPatch.focus = Array.from(
        new Set(
          onboardingRecord.focus.filter(
            (value): value is OnboardingFocus =>
              typeof value === "string" && VALID_FOCUS.has(value as OnboardingFocus)
          )
        )
      ).slice(0, 4);
    }

    if ("tourCompletedAt" in onboardingRecord) {
      onboardingPatch.tourCompletedAt = normalizeText(onboardingRecord.tourCompletedAt, 40) || undefined;
    }

    if (Object.keys(onboardingPatch).length > 0) sanitized.onboarding = onboardingPatch;
  }

  const notifications = patch.notifications;
  if (notifications && typeof notifications === "object") {
    const notificationsRecord = notifications as Record<string, unknown>;
    const notificationsPatch: Settings["notifications"] = {};
    if ("deadlineReminders" in notificationsRecord) {
      notificationsPatch.deadlineReminders = Boolean(notificationsRecord.deadlineReminders);
    }
    if (Object.keys(notificationsPatch).length > 0) sanitized.notifications = notificationsPatch;
  }

  return sanitized;
}

// Integration tokens are the only secrets in Settings — encrypt/decrypt just
// that section when moving between "storage" (DB row / cookie) and "client"
// (API response body) representations. See src/lib/server/crypto.ts.
export function encryptSettingsForStorage(settings: Settings): Settings {
  return {
    ...settings,
    integrations: {
      meta_token: encryptSecret(settings.integrations.meta_token),
      tiktok_token: encryptSecret(settings.integrations.tiktok_token),
      google_refresh: encryptSecret(settings.integrations.google_refresh),
    },
  };
}

export function decryptSettingsForClient(settings: Settings): Settings {
  return {
    ...settings,
    integrations: {
      meta_token: decryptSecret(settings.integrations.meta_token),
      tiktok_token: decryptSecret(settings.integrations.tiktok_token),
      google_refresh: decryptSecret(settings.integrations.google_refresh),
    },
  };
}

export function isLikelyMissingTable(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const code = "code" in error ? (error.code as string | undefined) : undefined;
  if (code === "42P01") return true;

  const message = "message" in error ? String(error.message || "") : "";
  return message.toLowerCase().includes("relation") && message.toLowerCase().includes("does not exist");
}
