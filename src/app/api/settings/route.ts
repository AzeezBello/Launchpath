// File: app/api/settings/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_KEY = "vam_settings";
const ONE_YEAR = 60 * 60 * 24 * 365;

type Settings = {
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

const DEFAULTS: Settings = {
  profile: { name: "", email: "", company: "Viral Ad Media" },
  integrations: { meta_token: "", tiktok_token: "", google_refresh: "" },
  security: { twofa: false, session_alerts: false },
  appearance: { theme: "light", accent: "indigo" },
};

async function readSettings(): Promise<Settings> {
  const store = await cookies();
  const c = store.get(COOKIE_KEY)?.value;
  if (!c) return DEFAULTS;
  try {
    const parsed = JSON.parse(c);
    return deepMerge(DEFAULTS, parsed);
  } catch {
    return DEFAULTS;
  }
}

async function writeSettings(v: Settings) {
  const store = await cookies();
  store.set({
    name: COOKIE_KEY,
    value: JSON.stringify(v),
    httpOnly: false, // demo: allow client to read if needed; switch to true when using server reads only
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR,
  });
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

function deepMerge<T extends Record<string, unknown>>(base: T, patch: DeepPartial<T>): T {
  const output: Record<string, unknown> = { ...base };
  for (const key of Object.keys(patch) as (keyof T)[]) {
    const value = patch[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const nestedBase = (base as Record<string, unknown>)[key as string] as Record<string, unknown> | undefined;
      output[key as string] = deepMerge(nestedBase || {}, value as Record<string, unknown>);
    } else if (value !== undefined) {
      output[key as string] = value as unknown;
    }
  }
  return output as T;
}

export async function GET() {
  const data = await readSettings();
  return NextResponse.json(data, { status: 200 });
}

export async function PATCH(req: Request) {
  try {
    const patch = (await req.json()) as Partial<Settings>;
    // Basic validation / narrowing
    if (patch.appearance?.theme && !["light", "dark", "system"].includes(patch.appearance.theme))
      return NextResponse.json({ error: "Invalid theme" }, { status: 422 });
    if (
      patch.appearance?.accent &&
      !["violet", "indigo", "fuchsia", "emerald", "cyan"].includes(patch.appearance.accent)
    )
      return NextResponse.json({ error: "Invalid accent" }, { status: 422 });
    if (patch.profile?.email && typeof patch.profile.email !== "string")
      return NextResponse.json({ error: "Invalid email" }, { status: 422 });

    const current = await readSettings();
    const merged = deepMerge(current, patch);
    await writeSettings(merged);
    return NextResponse.json(merged, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
