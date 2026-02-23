import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { requireSupabasePublicEnv } from "@/lib/supabase-env"

export async function createServerSupabaseClient() {
  const cookieStore = await cookies() // ✅ await important
  const env = requireSupabasePublicEnv("createServerSupabaseClient")

  const supabase = createServerClient(
    env.url,
    env.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            console.error("Failed to set cookies:", error)
          }
        },
      },
    }
  )

  return supabase
}
