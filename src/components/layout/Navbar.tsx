"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = useMemo(
    () => [
      { label: "Product", href: "/#product" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Resources", href: "/#faq" },
      { label: "About", href: "/about" },
    ],
    []
  );

  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center gap-3">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tight">
          LaunchPath
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white/70 hover:text-white transition"
            >
              {link.label}
            </Link>
          ))}

          <Link href="/login">
            <Button variant="ghost" className="text-white">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20">
              Start free
            </Button>
          </Link>

          <ThemeToggle />
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="md:hidden p-2 rounded-md hover:bg-white/10"
          aria-label="Toggle navigation"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-3 border-t border-white/5 bg-slate-950/90 backdrop-blur-xl">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-white/80 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="flex gap-2 pt-2">
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full">
                Log in
              </Button>
            </Link>
            <Link href="/signup" className="w-full">
              <Button className="w-full bg-emerald-500 text-white">
                Start free
              </Button>
            </Link>
          </div>
          <ThemeToggle />
        </div>
      )}
    </nav>
  );
}
