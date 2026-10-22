"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
};

const BARE_ROUTE_PREFIXES = [
  "/dashboard",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/onboarding",
  "/mfa",
];

/**
 * Client shell that handles marketing chrome vs. in-app chrome.
 * Dashboard routes stay full-bleed; marketing routes use the centered container.
 */
export function AppShell({ children }: Props) {
  const pathname = usePathname() ?? "/";
  const isBareRoute = BARE_ROUTE_PREFIXES.some((route) => pathname.startsWith(route));

  return (
    <div className="relative flex min-h-screen flex-col">
      {!isBareRoute && (
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:border focus:border-primary/40 focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-foreground focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
      )}
      {!isBareRoute && <Navbar />}
      <main
        id={!isBareRoute ? "main-content" : undefined}
        tabIndex={!isBareRoute ? -1 : undefined}
        className={cn(
          "relative flex-1 outline-none",
          !isBareRoute &&
            "mx-auto w-full max-w-7xl px-5 pb-24 pt-10 sm:px-8 lg:px-12 lg:pb-36 lg:pt-16"
        )}
      >
        {children}
      </main>
      {!isBareRoute && <Footer />}
      <Toaster richColors position="top-right" closeButton />
    </div>
  );
}
