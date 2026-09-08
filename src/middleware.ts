import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { requireSupabasePublicEnv } from "@/lib/supabase-env"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const env = requireSupabasePublicEnv("middleware")

  const supabase = createServerClient(
    env.url,
    env.anonKey,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          request.cookies.delete(name)
          if (options) {
            response.cookies.delete({ name, ...options })
          } else {
            response.cookies.delete(name)
          }
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding")
  const isAuthPage = pathname.startsWith("/login")
  const isMfaPage = pathname === "/mfa"

  if (!user && (isProtected || isMfaPage)) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("redirectedFrom", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (user) {
    // Accounts with a verified TOTP factor must complete the challenge (aal2)
    // before reaching the app. getAuthenticatorAssuranceLevel reads the JWT
    // claims and the user's factors, so it costs no extra round trip here.
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    const needsMfa = aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2"

    if (needsMfa && (isProtected || isAuthPage)) {
      const redirectUrl = new URL("/mfa", request.url)
      if (isProtected) redirectUrl.searchParams.set("redirectedFrom", pathname)
      return NextResponse.redirect(redirectUrl)
    }

    if (!needsMfa && (isAuthPage || isMfaPage)) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding", "/login", "/mfa"],
}
