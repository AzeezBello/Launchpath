import SignupForm from "@/components/auth/SignupForm"

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />

      <div className="absolute top-10 right-10 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />

      <div className="glass max-w-md w-full p-8 rounded-2xl border border-white/10 backdrop-blur-xl bg-white/10 shadow-xl z-10">
        <h1 className="text-3xl font-bold text-center mb-6 text-white">Create Your Account 🎉</h1>
        <p className="text-center text-gray-300 mb-8">
          Join <span className="font-semibold text-white">LaunchPath</span> and unlock your full potential.
        </p>
        <SignupForm />
        <p className="mt-4 text-sm text-center text-gray-400">
          Already have an account?{" "}
          <a href="/login" className="text-emerald-400 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  )
}
