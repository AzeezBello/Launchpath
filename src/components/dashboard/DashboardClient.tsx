"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/providers/SupabaseProvider"
import { Topbar } from "@/components/topbar/Topbar"

export default function DashboardClient({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, supabase } = useSupabase()
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // ✅ On mount, check current session (and set loading states properly)
  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error) {
        console.error("Error fetching user:", error)
      }

      // Wait until Supabase confirms user state
      if (!data?.user) {
        router.push("/login")
      }

      setLoading(false)
    }

    checkUser()
  }, [supabase, router])

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
