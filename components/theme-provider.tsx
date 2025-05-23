"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  resolvedTheme?: "dark" | "light"
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({ children, defaultTheme = "system", storageKey = "theme" }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedTheme = localStorage.getItem(storageKey) as Theme | null
        if (storedTheme && (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system")) {
          return storedTheme
        }
      } catch (e) {
        console.warn("Failed to read theme from localStorage", e)
      }
    }
    return defaultTheme
  })

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const root = window.document.documentElement
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const getSystemTheme = (): "light" | "dark" => mediaQuery.matches ? "dark" : "light"

    const applyTheme = (themeToApply: Theme) => {
      let current = themeToApply
      if (current === "system") {
        current = getSystemTheme()
      }
      
    root.classList.remove("light", "dark")
      root.classList.add(current)
      setResolvedTheme(current)
      
      try {
        localStorage.setItem(storageKey, themeToApply)
      } catch (e) {
        console.warn("Failed to save theme to localStorage", e)
      }
    }

    applyTheme(theme)

    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system")
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme, storageKey])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  return <ThemeProviderContext.Provider value={{ theme, resolvedTheme, setTheme }}>{children}</ThemeProviderContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
} 