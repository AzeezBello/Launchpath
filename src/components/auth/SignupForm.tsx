"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Account created successfully! 🎉")
      router.push("/dashboard")
    }
  }

  const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" })
    if (error) toast.error("Google sign-up failed")
  }

  return (
    <form onSubmit={handleSignup} className="space-y-4">
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
      <div className="flex flex-col gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Sign Up"}
        </Button>
        <Button type="button" variant="outline" onClick={handleGoogleSignup}>
          Continue with Google
        </Button>
      </div>
    </form>
  )
}
