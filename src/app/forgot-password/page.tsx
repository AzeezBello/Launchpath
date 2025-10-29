"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)

    if (error) {
      toast.error(error.message || "Something went wrong.")
    } else {
      toast.success("Password reset email sent! Check your inbox.")
      setEmail("")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/10">
      <form
        onSubmit={handlePasswordReset}
        className="bg-background border p-6 rounded-xl w-full max-w-sm space-y-4 shadow-lg"
      >
        <h1 className="text-2xl font-semibold text-center">Forgot Password</h1>
        <p className="text-sm text-center text-muted-foreground">
          Enter your email to receive a password reset link.
        </p>

        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>
    </div>
  )
}
