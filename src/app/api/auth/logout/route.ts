import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

/**
 * Handle POST /api/auth/logout
 * Signs out the user and clears session cookies
 */
export async function POST() {
  try {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Signed out successfully" }, { status: 200 })
  } catch (err: any) {
    console.error("Logout error:", err)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
