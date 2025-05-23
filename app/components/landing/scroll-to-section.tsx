"use client"

import type { ReactNode } from "react"

interface ScrollToSectionProps {
  targetId: string
  children: ReactNode
  className?: string
}

export default function ScrollToSection({ targetId, children, className }: ScrollToSectionProps) {
  const handleClick = () => {
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  )
}
