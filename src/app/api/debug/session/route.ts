// src/app/api/debug/session/route.ts
import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.auth.getUser()
  return NextResponse.json({ user: data.user })
}

