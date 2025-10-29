"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (error) {
      toast.error(error.message || "Failed to reset password.")
    } else {
      toast.success("Password updated successfully! Please log in.")
      router.push("/login")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/10">
      <form
        onSubmit={handleResetPassword}
        className="bg-background border p-6 rounded-xl w-full max-w-sm space-y-4 shadow-lg"
      >
        <h1 className="text-2xl font-semibold text-center">Reset Password</h1>
        <p className="text-sm text-center text-muted-foreground">
          Enter your new password below.
        </p>

        <Input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </div>
  )
}
