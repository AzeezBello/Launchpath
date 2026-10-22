"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        className="relative overflow-hidden rounded-xl"
        disabled
      >
        <span className="size-4" />
      </Button>
    )
  }

  const isDark = resolvedTheme === "dark"
  const toggleTheme = () => setTheme(isDark ? "light" : "dark")

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      className="relative overflow-hidden rounded-xl border border-transparent hover:border-border/70 hover:bg-accent/60"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: -45, scale: 0.85, filter: "blur(2px)" }}
            animate={{ opacity: 1, rotate: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, rotate: 45, scale: 0.85, filter: "blur(2px)" }}
            transition={{ type: "spring", duration: 0.28, bounce: 0.08 }}
            className="flex items-center justify-center"
          >
            <Sun className="size-4 text-amber-400" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: 45, scale: 0.85, filter: "blur(2px)" }}
            animate={{ opacity: 1, rotate: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, rotate: -45, scale: 0.85, filter: "blur(2px)" }}
            transition={{ type: "spring", duration: 0.28, bounce: 0.08 }}
            className="flex items-center justify-center"
          >
            <Moon className="size-4 text-foreground" />
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  )
}
