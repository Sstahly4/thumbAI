"use client"

import { useTheme } from "@/components/theme-provider"
import { motion } from "framer-motion"
import { Moon, Sun } from "lucide-react"

export function FloatingThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.3 }}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="fixed left-4 bottom-4 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow"
      aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
    >
      <div className="relative w-5 h-5 overflow-hidden">
        <motion.div
          initial={false}
          animate={{ y: theme === "light" ? 0 : -20 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sun className="h-5 w-5 text-amber-500" />
        </motion.div>
        <motion.div
          initial={false}
          animate={{ y: theme === "light" ? 20 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Moon className="h-5 w-5 text-purple-500" />
        </motion.div>
      </div>
    </motion.button>
  )
} 