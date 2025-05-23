"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"

const stats = [
  { label: "Thumbnails Generated", value: 1250000, suffix: "+" },
  { label: "Average CTR Increase", value: 37, suffix: "%" },
  { label: "Happy Creators", value: 25000, suffix: "+" },
]

export default function StatsCounter() {
  const [isInView, setIsInView] = useState(false)
  const [displayValues, setDisplayValues] = useState(stats.map(() => 0))
  const animationRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setIsInView(true)

    if (isInView) {
      stats.forEach((stat, index) => {
        const startValue = 0
        const endValue = stat.value
        const duration = 1500
        const startTime = Date.now()

        const updateValue = () => {
          const currentTime = Date.now()
          const elapsed = currentTime - startTime
          const progress = Math.min(elapsed / duration, 1)

          const currentValue = Math.floor(progress * endValue)

          setDisplayValues((prev) => {
            const newValues = [...prev]
            newValues[index] = currentValue
            return newValues
          })

          if (progress < 1) {
            animationRef.current = setTimeout(updateValue, 16)
          }
        }

        updateValue()
      })
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current)
      }
    }
  }, [isInView])

  return (
    <div className="grid grid-cols-3 gap-4 my-6 max-w-[600px]">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="text-center"
        >
          <div className="text-2xl font-bold text-purple-600">
            {displayValues[index].toLocaleString()}
            {stat.suffix}
          </div>
          <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  )
}
