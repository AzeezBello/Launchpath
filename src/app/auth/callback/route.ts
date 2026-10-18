import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") || "/dashboard";

  const db = await createServerSupabaseClient();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (user) {
    const { data } = await db
      .from("user_settings")
      .select("data")
      .eq("user_id", user.id)
      .maybeSingle<{ data: { onboarding?: { completed?: boolean } } | null }>();

    if (!data?.data?.onboarding?.completed) {
      return NextResponse.redirect(`${origin}/onboarding`);
    }

    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login`);
}
