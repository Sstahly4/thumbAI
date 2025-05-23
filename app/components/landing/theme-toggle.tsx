"use client"

import { useTheme } from "@/components/theme-provider"
import { motion } from "framer-motion"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative h-8 w-8 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
    >
      <div className="relative w-4 h-4 overflow-hidden">
        <motion.div
          initial={false}
          animate={{ y: theme === "light" ? 0 : -20 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sun className="h-4 w-4" />
        </motion.div>
        <motion.div
          initial={false}
          animate={{ y: theme === "light" ? 20 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Moon className="h-4 w-4" />
        </motion.div>
      </div>
    </button>
  )
}
