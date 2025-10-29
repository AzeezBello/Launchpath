"use client";

import "./globals.css"
import {Navbar} from "@/components/layout/Navbar"
import {Footer} from "@/components/layout/Footer"
import { usePathname } from "next/navigation";
import { Toaster } from "sonner"
import { SupabaseProvider } from "@/providers/SupabaseProvider"




export default function RootLayout({ children }: { children: React.ReactNode }) {

  const pathname = usePathname();

  // ✅ Check if we are on a dashboard route
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white antialiased overflow-x-hidden">
        <SupabaseProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* ✅ Show Navbar only on non-dashboard routes */}
          {!isDashboard && <Navbar />}
          <main className={isDashboard ? "p-0" : "max-w-7xl mx-auto px-4 py-6"}>
            {children}
            <Toaster richColors position="top-right" closeButton />
          
          </main>
          <Footer />

        </SupabaseProvider>
        
      </body>
    </html>
  )
}

