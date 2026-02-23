"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/providers/SupabaseProvider"

export default function DashboardClient({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, router, user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground animate-pulse">
          Loading dashboard...
        </p>
      </div>
    )
  }

  // ✅ Prevent flashing before redirect
  if (!user) return null

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}
