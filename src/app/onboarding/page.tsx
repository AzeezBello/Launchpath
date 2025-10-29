"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function OnboardingPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />
      <div className="absolute top-0 left-0 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />

      <div className="glass max-w-2xl w-full p-10 rounded-3xl backdrop-blur-xl border border-white/10 text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to LaunchPath 🌟</h1>
        <p className="text-gray-300 text-lg max-w-md mx-auto">
          Let's personalize your experience. We’ll ask a few questions to help tailor your dashboard to your goals.
        </p>

        <Button
          onClick={() => router.push("/dashboard")}
          className="bg-cyan-500 hover:bg-cyan-400 text-white px-6 py-3 rounded-xl text-lg font-medium transition"
        >
          Get Started
        </Button>
      </div>
    </div>
  )
}
