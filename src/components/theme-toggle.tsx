"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")

  return (
   <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative overflow-hidden rounded-full transition-colors duration-300 bg-transparent hover:bg-muted/50 dark:hover:bg-muted/70"
    >

      <AnimatePresence mode="wait" initial={false}>
        {theme === "dark" ? (
          <motion.div
            key="sun"
            initial={{ opacity: 0, x: -10, rotate: -90, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, rotate: 90, scale: 0.8 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <Sun className="h-5 w-5" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ opacity: 0, x: 10, rotate: 90, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, rotate: -90, scale: 0.8 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <Moon className="h-5 w-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  )
}
