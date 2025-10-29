"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold">
          LaunchPath
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="hover:text-primary transition">
            Home
          </Link>
          <Link href="/about" className="hover:text-primary transition">
            About
          </Link>
          <Link href="/contact" className="hover:text-primary transition">
            Contact
          </Link>

          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-primary text-white hover:bg-primary/90">
              Sign Up
            </Button>
          </Link>

          <ThemeToggle />
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-md hover:bg-accent"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-3 space-y-3">
          <Link href="/" className="block hover:text-primary">
            Home
          </Link>
          <Link href="/about" className="block hover:text-primary">
            About
          </Link>
          <Link href="/contact" className="block hover:text-primary">
            Contact
          </Link>

          <div className="flex gap-2">
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full">
                Login
              </Button>
            </Link>
            <Link href="/register" className="w-full">
              <Button className="w-full bg-primary text-white">
                Sign Up
              </Button>
            </Link>
          </div>
          <ThemeToggle />
        </div>
      )}
    </nav>
  );
}
