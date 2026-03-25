import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/70 bg-background/35">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <div className="max-w-md">
          <p className="text-lg font-semibold tracking-tight text-foreground">LaunchPath</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            A cleaner operating system for scholarships, grants, jobs, admissions,
            resumes, and AI-assisted application work.
          </p>
        </div>

        <div className="flex flex-col gap-4 text-sm text-muted-foreground lg:items-end">
          <div className="flex flex-wrap gap-4">
            <Link href="/#product" className="hover:text-foreground">
              Product
            </Link>
            <Link href="/#pricing" className="hover:text-foreground">
              Pricing
            </Link>
            <Link href="/about" className="hover:text-foreground">
              About
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Contact
            </Link>
          </div>
          <p className="text-xs">
            © {new Date().getFullYear()} LaunchPath. Built for calmer, faster application workflows.
          </p>
        </div>
      </div>
    </footer>
  );
}
