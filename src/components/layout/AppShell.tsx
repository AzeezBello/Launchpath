"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Toaster } from "sonner";

type Props = {
  children: React.ReactNode;
};

/**
 * Client shell that handles marketing chrome vs. in-app chrome.
 * Dashboard routes stay full-bleed; marketing routes use the centered container.
 */
export function AppShell({ children }: Props) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <>
      {!isDashboard && <Navbar />}
      <main className={isDashboard ? "" : "max-w-7xl mx-auto px-4 py-10"}>
        {children}
      </main>
      {!isDashboard && <Footer />}
      <Toaster richColors position="top-right" closeButton />
    </>
  );
}
