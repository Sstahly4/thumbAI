"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  step: number
}

export default function FeatureCard({ icon, title, description, step }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: step * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className="h-full border-0 shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-400 to-pink-500 transform origin-left group-hover:scale-y-110 transition-transform"></div>
        <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-0 group-hover:opacity-30 transition-opacity"></div>

        <CardHeader className="pb-2 relative">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100">
            {icon}
          </div>
          <div className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold text-sm">
            {step}
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <p className="text-gray-500">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
