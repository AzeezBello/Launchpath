import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

/**
 * Handle POST /api/auth/signup
 * Accepts JSON: { email, password, fullName? }
 * Creates a new user account
 */
export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json()
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName || "" },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/login`,
      },
    })

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { success: true, message: "Account created successfully", user: data.user },
      { status: 201 }
    )
  } catch (err: any) {
    console.error("Signup error:", err)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
