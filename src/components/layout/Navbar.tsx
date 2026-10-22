"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowRight, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Product", href: "/#product" },
  { label: "Workflow", href: "/#workflow" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname() ?? "/";

  return (
    <header className="sticky top-0 z-40 border-b border-border/75 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#3B82F6,#10B981)] font-display text-xs font-bold tracking-tight text-slate-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35),0_6px_16px_-4px_rgba(59,130,246,0.5)] scale-100 transition-transform duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.03]">
            LP
          </span>
          <span className="flex flex-col">
            <span className="font-display text-sm font-semibold tracking-tight leading-none">
              LaunchPath
            </span>
            <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground leading-none">
              Opportunity OS
            </span>
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-0.5 rounded-xl border border-border/80 bg-card/75 p-1 shadow-2xs md:flex"
        >
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
                  isActive
                    ? "bg-primary/12 text-primary"
                    : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Separator orientation="vertical" className="mx-0.5 h-5" />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup">
              Start free
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-1.5 md:hidden">
          <ThemeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Open navigation menu"
              >
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[84vw] max-w-xs p-0">
              <SheetHeader className="border-b border-border/75 px-5 py-5 text-left">
                <SheetTitle className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#3B82F6,#10B981)] font-display text-[11px] font-bold text-slate-950">
                    LP
                  </span>
                  LaunchPath
                </SheetTitle>
                <SheetDescription>
                  Scholarships, grants, jobs, and admissions in one calm workspace.
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-1 flex-col justify-between p-5">
                <nav className="flex flex-col gap-1">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-accent/70 hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div className="space-y-2.5 border-t border-border/75 pt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      Log in
                    </Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href="/signup" onClick={() => setIsOpen(false)}>
                      Start free
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
