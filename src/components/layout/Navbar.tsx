"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowRight, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Product", href: "/#product" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Resources", href: "/#faq" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 border-b border-border/70 bg-background/70 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-foreground">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(45,212,191,0.9),rgba(14,165,233,0.9))] text-sm font-bold text-slate-950 shadow-[0_14px_36px_-18px_rgba(20,184,166,0.9)]">
            LP
          </span>
          <span>
            <span className="block text-base font-semibold tracking-tight">LaunchPath</span>
            <span className="block text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Opportunity workspace
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 rounded-full border border-border/80 bg-card/70 p-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/70 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup">
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex size-10 items-center justify-center rounded-full border border-border/80 bg-card/70 text-foreground"
            aria-label="Toggle navigation"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-border/70 px-4 pb-4 md:hidden">
          <div className="mx-auto mt-4 flex max-w-7xl flex-col gap-4 rounded-[1.75rem] border border-border/80 bg-card/85 p-4 shadow-[0_22px_55px_-34px_rgba(15,23,42,0.45)] backdrop-blur-xl">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-2xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/70 hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button variant="outline" asChild>
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  Log in
                </Link>
              </Button>
              <Button asChild>
                <Link href="/signup" onClick={() => setIsOpen(false)}>
                  Start free
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
