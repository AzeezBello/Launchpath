import { cookies } from "next/headers";
import { apiError, apiSuccess, applyRateLimit, mergeHeaders, requireApiUser } from "@/lib/server/api";
import {
  DEFAULT_SETTINGS,
  ONE_YEAR_SECONDS,
  SETTINGS_COOKIE_KEY,
  deepMerge,
  isLikelyMissingTable,
  sanitizeSettingsPatch,
  type Settings,
} from "@/lib/server/settings";

type SettingsRow = {
  user_id: string;
  data: Settings | null;
  updated_at: string | null;
};

function parseCookieSettings(raw: string | undefined) {
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return deepMerge(DEFAULT_SETTINGS, parsed);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

async function writeSettingsCookie(value: Settings) {
  const store = await cookies();
  store.set({
    name: SETTINGS_COOKIE_KEY,
    value: JSON.stringify(value),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });
}

export async function GET(req: Request) {
  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "settings:get",
    userId: user.id,
    limit: 120,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const store = await cookies();
  const fallback = parseCookieSettings(store.get(SETTINGS_COOKIE_KEY)?.value);

  const { data, error } = await supabase
    .from("user_settings")
    .select("data")
    .eq("user_id", user.id)
    .maybeSingle<SettingsRow>();

  if (error && !isLikelyMissingTable(error)) {
    return apiError(
      "Failed to load settings",
      { status: 500, headers: mergeHeaders(rateLimit.headers) },
      error.message
    );
  }

  const resolved = data?.data ? deepMerge(DEFAULT_SETTINGS, data.data) : fallback;
  await writeSettingsCookie(resolved);

  return apiSuccess(
    resolved,
    { status: 200, headers: mergeHeaders(rateLimit.headers) },
    {
      source: error ? "cookie-fallback" : "supabase",
    }
  );
}

export async function PATCH(req: Request) {
  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "settings:patch",
    userId: user.id,
    limit: 40,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return apiError("Invalid JSON body", { status: 400, headers: mergeHeaders(rateLimit.headers) });
  }

  const patch = sanitizeSettingsPatch(rawBody);
  if (!patch) {
    return apiError("Invalid settings payload", { status: 422, headers: mergeHeaders(rateLimit.headers) });
  }

  const store = await cookies();
  const fallback = parseCookieSettings(store.get(SETTINGS_COOKIE_KEY)?.value);

  const currentResult = await supabase
    .from("user_settings")
    .select("data")
    .eq("user_id", user.id)
    .maybeSingle<SettingsRow>();

  if (currentResult.error && !isLikelyMissingTable(currentResult.error)) {
    return apiError(
      "Failed to update settings",
      { status: 500, headers: mergeHeaders(rateLimit.headers) },
      currentResult.error.message
    );
  }

  const current = currentResult.data?.data
    ? deepMerge(DEFAULT_SETTINGS, currentResult.data.data)
    : fallback;
  const merged = deepMerge(current, patch);

  if (!isLikelyMissingTable(currentResult.error)) {
    const upsert = await supabase.from("user_settings").upsert(
      {
        user_id: user.id,
        data: merged,
      },
      {
        onConflict: "user_id",
      }
    );

    if (upsert.error) {
      return apiError(
        "Failed to persist settings",
        { status: 500, headers: mergeHeaders(rateLimit.headers) },
        upsert.error.message
      );
    }
  }

  await writeSettingsCookie(merged);
  return apiSuccess(
    merged,
    { status: 200, headers: mergeHeaders(rateLimit.headers) },
    {
      source: isLikelyMissingTable(currentResult.error) ? "cookie-fallback" : "supabase",
    }
  );
}
