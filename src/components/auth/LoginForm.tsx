"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Link from "next/link"
import { useSupabase } from "@/providers/SupabaseProvider"
import { useSearchParams } from "next/navigation"


export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { supabase } = useSupabase()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setLoading(false)

    if (error) {
      toast.error(error.message || "Login failed")
      return
    }

    toast.success("Logged in")
    const redirectTo = searchParams.get("redirectedFrom") || "/dashboard"
    router.push(redirectTo)
  }

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) toast.error("Google sign-in failed")
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <p className="text-sm text-right">
        <Link href="/forgot-password" className="text-primary hover:underline">
          Forgot password?
        </Link>
      </p>


      <div className="flex flex-col gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>

        <Button type="button" variant="outline" onClick={handleGoogle} disabled={loading}>
          Continue with Google
        </Button>
      </div>
    </form>
  )
}

