"use client"

import type React from "react"

import { motion } from "framer-motion"
import { CheckCircle, Star, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface FeatureGroup {
  title: string
  icon: React.ReactNode
  features: string[]
}

interface PricingCardProps {
  title: string
  price: string
  yearlyPrice?: string
  isYearly: boolean
  description: string
  sessions: string
  thumbnails: string
  overage?: string
  featureGroups: FeatureGroup[]
  buttonText: string
  buttonVariant: "default" | "outline"
  popular?: boolean
  bestValue?: boolean
  index?: number
}

export default function PricingCard({
  title,
  price,
  yearlyPrice,
  isYearly,
  description,
  sessions,
  thumbnails,
  overage,
  featureGroups,
  buttonText,
  buttonVariant,
  popular = false,
  bestValue = false,
  index = 0,
}: PricingCardProps) {
  const displayPrice = isYearly ? yearlyPrice || price : price

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{
        y: -10,
        transition: { duration: 0.2 },
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
    >
      <Card
        className={`h-full relative overflow-hidden ${
          popular
            ? "border-purple-600 dark:border-purple-500 shadow-xl bg-purple-50/50 dark:bg-purple-900/10"
            : "border-0 shadow-lg dark:border-gray-800"
        }`}
      >
        {popular && (
          <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3">
            <motion.div
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-8 py-1 rounded-full shadow-md transform -rotate-12"
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                ],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 2,
                repeatType: "reverse",
              }}
            >
              POPULAR
            </motion.div>
          </div>
        )}

        {bestValue && (
          <div className="absolute top-0 left-0 right-0 bg-green-500 text-white text-xs font-bold py-1 text-center">
            BEST VALUE
          </div>
        )}

        <CardHeader className={`relative ${bestValue ? "pt-8" : ""}`}>
          <CardTitle className="text-xl flex items-center gap-2">
            {title}
            {popular && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
          </CardTitle>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-bold">{displayPrice}</span>
            <span className="text-gray-500 dark:text-gray-400">{isYearly ? "/year" : "/month"}</span>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 relative space-y-6">
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
            <div className="flex flex-col space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Usage</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">{sessions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">{thumbnails}</span>
              </div>
              {overage && (
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-1 cursor-help">
                        <HelpCircle className="h-3 w-3" />
                        Need more?
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-[200px]">{overage} without changing your plan</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          </div>

          {featureGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-2">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                {group.icon}
                {group.title}
              </div>
              <ul className="space-y-1.5">
                {group.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
        <CardFooter className="relative">
          <motion.div
            className="w-full"
            whileHover={{
              scale: 1.03,
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant={buttonVariant}
              className={`w-full ${
                popular && buttonVariant === "default"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 shadow-md"
                  : ""
              }`}
            >
              {buttonText}
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
