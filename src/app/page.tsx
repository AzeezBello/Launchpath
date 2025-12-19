import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Sparkles, Shield, Rocket } from "lucide-react";

const featureTiles = [
  {
    title: "Scholarships & Grants radar",
    body: "Curated funding leads filtered by country, level, and deadlines—ready to apply.",
  },
  {
    title: "Admissions tracker",
    body: "Keep shortlist, status, and requirements in one view with reminders.",
  },
  {
    title: "Career launchpad",
    body: "Remote-friendly jobs, AI cover letters, and resume builder that syncs with your profile.",
  },
  {
    title: "Team-ready SaaS",
    body: "Auth, settings, theming, and API routes wired for production—not a demo.",
  },
];

const stats = [
  { label: "Opportunities curated", value: "1,200+" },
  { label: "Time saved per month", value: "12 hrs" },
  { label: "Users on LaunchPath", value: "3.4k" },
];

const plans = [
  {
    name: "Starter",
    price: "$0",
    detail: "Perfect for getting started with opportunities.",
    perks: ["Unlimited searches", "AI cover letter fallback", "Saved settings on-device"],
    cta: "Start free",
    href: "/signup",
    popular: false,
  },
  {
    name: "Pro",
    price: "$18",
    detail: "For teams or power users who want exports & saved work.",
    perks: ["Workspace profiles", "Save resumes & letters to Supabase", "Priority support"],
    cta: "Talk to us",
    href: "/contact",
    popular: true,
  },
];

export default function Home() {
  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 px-6 py-16 shadow-2xl">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-16 -top-10 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        </div>

        <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70">
              <Sparkles className="h-4 w-4 text-emerald-300" />
              Opportunity OS
            </p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              LaunchPath is the{" "}
              <span className="bg-gradient-to-r from-emerald-300 via-cyan-200 to-white bg-clip-text text-transparent">
                complete SaaS
              </span>{" "}
              for scholarships, jobs, grants, and admissions.
            </h1>
            <p className="text-lg text-white/70 max-w-xl">
              A single workspace to discover opportunities, generate application assets, and keep your pipeline organized—built with production-grade auth, APIs, and UI.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/30">
                  Start for free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  View product
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-white/70">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Auth + dashboard ready
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                API routes with fallbacks
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Responsive + themed
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="glass rounded-2xl border border-white/15 bg-white/5 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-xl font-bold text-white">
                    LP
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Dashboard preview</p>
                    <p className="font-semibold">Your pipeline</p>
                  </div>
                </div>
                <Shield className="h-5 w-5 text-emerald-300" />
              </div>
              <div className="space-y-3">
                {[
                  { title: "Scholarships", value: "124 tracked", accent: "from-emerald-400 to-cyan-300" },
                  { title: "Jobs & internships", value: "34 active matches", accent: "from-cyan-400 to-blue-400" },
                  { title: "Grants", value: "18 open this month", accent: "from-indigo-300 to-purple-400" },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-white/70">{item.title}</p>
                      <span className={`text-xs font-medium text-white/80 rounded-full bg-gradient-to-r ${item.accent} px-3 py-1`}>
                        Live
                      </span>
                    </div>
                    <p className="text-lg font-semibold mt-1">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-3" id="product">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="glass flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-center shadow-lg"
          >
            <p className="text-3xl font-semibold">{stat.value}</p>
            <p className="text-sm text-white/70">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Feature grid */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white/10 p-2">
            <Rocket className="h-4 w-4 text-emerald-300" />
          </div>
          <div>
            <h2 className="text-3xl font-semibold">Everything to ship a SaaS, not a mock</h2>
            <p className="text-white/70">
              A real dashboard experience with Supabase auth, saved settings, AI cover letters, and resilient APIs.
            </p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {featureTiles.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl hover:-translate-y-1 transition duration-200"
            >
              <div className="mb-3 inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                {feature.title}
              </div>
              <p className="text-white/80">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="space-y-6" id="pricing">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-semibold">Pricing that respects your runway</h2>
            <p className="text-white/70 text-sm">
              Ship fast with the free tier; upgrade when you want cloud saves and exports.
            </p>
          </div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/60">
            Month-to-month • Cancel anytime
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border bg-white/5 p-6 shadow-xl ${plan.popular ? "border-emerald-400/50 shadow-emerald-500/30" : "border-white/10"}`}
            >
              {plan.popular && (
                <span className="mb-3 inline-flex rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                  Recommended
                </span>
              )}
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold">{plan.name}</h3>
                <p className="text-xl">{plan.price}<span className="text-sm text-white/60">/mo</span></p>
              </div>
              <p className="text-white/70 mt-2">{plan.detail}</p>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    {perk}
                  </li>
                ))}
              </ul>
              <Link href={plan.href}>
                <Button
                  className={`mt-6 w-full ${plan.popular ? "bg-emerald-500 hover:bg-emerald-400" : "bg-white/10 hover:bg-white/20"} text-white`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ / CTA */}
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]" id="faq">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl space-y-4">
          <h3 className="text-2xl font-semibold">Built to launch, not to prototype</h3>
          <div className="space-y-3 text-white/80 text-sm leading-relaxed">
            <p>
              LaunchPath ships with Supabase authentication, protected dashboard routes, resilient API routes with offline fallbacks, and a complete UI kit. Replace the sample data with your own sources when you are ready.
            </p>
            <p>
              Jobs, scholarships, grants, and admissions searches work without flaky third-party APIs. AI cover letters gracefully degrade when an OpenAI key is absent, so the experience always works.
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-white/10 p-6 shadow-xl space-y-4">
          <h4 className="text-xl font-semibold">Ready to see the dashboard?</h4>
          <p className="text-white/80 text-sm">
            Create an account and jump into the in-app tools—resume builder, AI cover letter, jobs, grants, scholarships, admissions, and settings.
          </p>
          <div className="flex gap-3">
            <Link href="/signup" className="w-full">
              <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-white">
                Create account
              </Button>
            </Link>
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full border-white/40 text-white hover:bg-white/10">
                Log in
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
