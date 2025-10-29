import LoginForm from "@/components/auth/LoginForm"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />

      <div className="absolute top-0 left-0 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />

      <div className="glass max-w-md w-full p-8 rounded-2xl border border-white/10 backdrop-blur-xl bg-white/10 shadow-xl z-10">
        <h1 className="text-3xl font-bold text-center mb-6 text-white">Welcome Back 👋</h1>
        <p className="text-center text-gray-300 mb-8">
          Log in to continue your journey with <span className="font-semibold text-white">LaunchPath</span>
        </p>
        <LoginForm />
        <p className="mt-4 text-sm text-center text-gray-400">
          Don’t have an account?{" "}
          <a href="/signup" className="text-cyan-400 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}
