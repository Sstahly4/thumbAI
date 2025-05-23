"use client"
import { motion } from "framer-motion"

interface PricingToggleProps {
  isYearly: boolean
  onPeriodChange: (isYearly: boolean) => void
}

export default function PricingToggle({ isYearly, onPeriodChange }: PricingToggleProps) {
  const handleToggle = () => {
    onPeriodChange(!isYearly)
  }

  return (
    <div className="flex flex-col items-center justify-center mb-8">
      <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 p-1 rounded-full">
        <button
          onClick={() => {
            if (isYearly) handleToggle()
          }}
          className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors ${
            !isYearly
              ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => {
            if (!isYearly) handleToggle()
          }}
          className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors ${
            isYearly
              ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <span className="relative">
            Yearly
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isYearly ? 1 : 0, scale: isYearly ? 1 : 0.8 }}
              className="absolute -top-3 -right-12 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400 text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap"
            >
              Save 20%
            </motion.span>
          </span>
        </button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        {isYearly ? "Get 2 months free with yearly billing!" : "Switch to yearly for best value"}
      </p>
    </div>
  )
}
