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
      {!isBareRoute && <Navbar />}
      <main
        className={cn(
          "relative flex-1",
          !isBareRoute &&
            "mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pb-24 lg:pt-10"
        )}
      >
        {children}
      </main>
      {!isBareRoute && <Footer />}
      <Toaster richColors position="top-right" closeButton />
    </div>
  );
}
