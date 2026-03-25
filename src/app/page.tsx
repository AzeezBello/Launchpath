import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  FolderKanban,
  GraduationCap,
  HandCoins,
  LineChart,
  Search,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";

const stats = [
  { label: "Active opportunities", value: "1,200+" },
  { label: "Hours saved monthly", value: "12 hrs" },
  { label: "Teams and students", value: "3.4k" },
];

const featureTiles = [
  {
    title: "Discovery that stays organized",
    body: "Search scholarships, grants, jobs, and admissions without losing deadlines, notes, or requirements.",
    Icon: Search,
  },
  {
    title: "Application assets in one place",
    body: "Generate cover letters, build resumes, and keep every draft tied to the right opportunity.",
    Icon: WandSparkles,
  },
  {
    title: "A calmer dashboard",
    body: "See what is due, what is active, and what needs attention from one clean command center.",
    Icon: FolderKanban,
  },
  {
    title: "Production-ready foundation",
    body: "Supabase auth, API fallbacks, theme support, and structured data make this more than a mockup.",
    Icon: ShieldCheck,
  },
];

const workflow = [
  {
    step: "01",
    title: "Track every path",
    body: "Scholarships, grants, jobs, and admissions live in a single pipeline instead of scattered tabs.",
  },
  {
    step: "02",
    title: "Create faster",
    body: "Use AI support and saved profile data to draft stronger materials without starting from zero.",
  },
  {
    step: "03",
    title: "Stay application-ready",
    body: "Know what is next, where you are stuck, and which opportunities deserve attention today.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "$0",
    detail: "For solo applicants getting organized fast.",
    perks: ["Unlimited searches", "Usage tracking", "AI cover letter fallback"],
    href: "/signup",
    cta: "Start free",
    featured: false,
  },
  {
    name: "Pro",
    price: "$18",
    detail: "For teams and serious applicants managing more volume.",
    perks: ["Saved resumes and letters", "Workspace profiles", "Priority support"],
    href: "/contact",
    cta: "Talk to us",
    featured: true,
  },
];

const faqs = [
  {
    question: "Does it work without third-party APIs?",
    answer:
      "Yes. Opportunity data and cover-letter generation have fallbacks so the product remains usable even when external services are unavailable.",
  },
  {
    question: "Can I use it for both school and career applications?",
    answer:
      "That is the core model. Scholarships, grants, admissions, interviews, jobs, resumes, and cover letters all share the same workspace.",
  },
  {
    question: "Is this a starter or a finished product shell?",
    answer:
      "It is much closer to a product shell. Auth, dashboard routing, settings, and persistence are already in place so you can extend rather than rebuild.",
  },
];

export default function Home() {
  return (
    <div className="space-y-16 pb-6 md:space-y-24">
      <section className="surface-panel relative overflow-hidden px-6 py-8 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-sky-400/15 blur-3xl" />
        </div>

        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <Badge variant="outline" className="w-fit">
              <Sparkles className="h-3.5 w-3.5" />
              Opportunity workspace
            </Badge>

            <div className="space-y-4">
              <h1 className="text-balance max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                A cleaner way to run scholarships, jobs, grants, and admissions.
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                LaunchPath keeps discovery, application writing, and progress tracking
                in one calm workspace so you can move faster without feeling scattered.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Start for free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/dashboard">Explore the dashboard</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/45 px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Responsive dashboard shell
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/45 px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Auth and settings included
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/45 px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                AI with graceful fallbacks
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-border/80 bg-background/50 p-5 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.45)] backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
                    Today
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">Your application pulse</h2>
                </div>
                <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Live
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  {
                    label: "Scholarships with fit score",
                    value: "124 matches",
                    accent: "bg-emerald-400/14 text-emerald-600 dark:text-emerald-300",
                  },
                  {
                    label: "Applications due this week",
                    value: "7 deadlines",
                    accent: "bg-sky-400/14 text-sky-600 dark:text-sky-300",
                  },
                  {
                    label: "Draft cover letters ready",
                    value: "4 saved drafts",
                    accent: "bg-amber-400/14 text-amber-600 dark:text-amber-300",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-[1.35rem] border border-border/80 bg-card/85 px-4 py-4"
                  >
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="mt-1 text-lg font-semibold">{item.value}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.accent}`}>
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-border/80 bg-card/80 p-4">
                <p className="text-sm text-muted-foreground">Built for</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-background/60 px-3 py-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    Scholarships
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-background/60 px-3 py-2 text-sm">
                    <BriefcaseBusiness className="h-4 w-4 text-primary" />
                    Jobs
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-background/60 px-3 py-2 text-sm">
                    <HandCoins className="h-4 w-4 text-primary" />
                    Grants
                  </span>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-border/80 bg-card/80 p-4">
                <p className="text-sm text-muted-foreground">What teams notice</p>
                <p className="mt-3 text-lg font-semibold">
                  Clearer status, less tab fatigue, and fewer missed deadlines.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="product" className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="hover-card rounded-[1.5rem] border border-border/80 bg-card/80 p-6 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.45)]"
          >
            <p className="text-3xl font-semibold">{stat.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="space-y-4">
          <Badge variant="outline" className="w-fit">
            <LineChart className="h-3.5 w-3.5" />
            Why it feels cleaner
          </Badge>
          <h2 className="text-balance text-3xl font-semibold sm:text-4xl">
            Less clutter, better context, and a clearer path from search to submission.
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            The product now leans into clearer hierarchy, stronger spacing, and calmer
            surfaces so the interface supports momentum instead of adding noise.
          </p>

          <div className="space-y-4 pt-2">
            {workflow.map((item) => (
              <div
                key={item.step}
                className="rounded-[1.5rem] border border-border/80 bg-card/80 p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    {item.step}
                  </span>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {featureTiles.map(({ title, body, Icon }) => (
            <div
              key={title}
              className="hover-card rounded-[1.75rem] border border-border/80 bg-card/82 p-6 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.45)]"
            >
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="surface-panel p-6 sm:p-8">
          <Badge variant="outline" className="w-fit">
            Pricing
          </Badge>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
            Pricing that respects your runway.
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Start with the free plan, keep the product usable out of the box, and
            upgrade when saved assets and team workflows matter.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-[1.75rem] border p-6 ${
                  plan.featured
                    ? "border-primary/30 bg-primary/10 shadow-[0_20px_55px_-36px_rgba(20,184,166,0.45)]"
                    : "border-border/80 bg-background/45"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-2xl font-semibold">{plan.name}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{plan.detail}</p>
                  </div>
                  {plan.featured && <Badge>Recommended</Badge>}
                </div>

                <p className="mt-6 text-4xl font-semibold">
                  {plan.price}
                  <span className="ml-1 text-sm font-medium text-muted-foreground">/mo</span>
                </p>

                <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      {perk}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.featured ? "default" : "outline"}
                  className="mt-6 w-full"
                  asChild
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div id="faq" className="space-y-5">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="rounded-[1.75rem] border border-border/80 bg-card/82 p-6"
            >
              <h3 className="text-xl font-semibold">{faq.question}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {faq.answer}
              </p>
            </div>
          ))}

          <div className="surface-panel p-6">
            <h3 className="text-2xl font-semibold">Ready to simplify the workflow?</h3>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              Open the dashboard, start a draft, and see how the cleaner shell feels
              across jobs, scholarships, grants, admissions, and writing tools.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/signup">Create an account</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/login">Log in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
