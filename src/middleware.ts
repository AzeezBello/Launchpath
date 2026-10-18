import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth-token";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  const pathname = request.nextUrl.pathname;
  const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding");
  const isAuthPage = pathname.startsWith("/login");
  const isMfaPage = pathname === "/mfa";

  if (!session && (isProtected || isMfaPage)) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (session) {
    const needsMfa = session.nextAal === "aal2" && session.aal !== "aal2";

    if (needsMfa && (isProtected || isAuthPage)) {
      const redirectUrl = new URL("/mfa", request.url);
      if (isProtected) redirectUrl.searchParams.set("redirectedFrom", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (!needsMfa && (isAuthPage || isMfaPage)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding", "/login", "/mfa"],
};
