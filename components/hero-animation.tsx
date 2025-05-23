"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useAnimation, useInView } from "framer-motion"
import { Sparkles, Zap, TrendingUpIcon as TrendUp } from "lucide-react"
import Image from "next/image"

export default function HeroAnimation() {
  const [isClient, setIsClient] = useState(false)
  const controls = useAnimation()
  const ref = useRef(null)
  const inView = useInView(ref)

  useEffect(() => {
    setIsClient(true)
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])

  if (!isClient) {
    return (
      <div className="relative w-full max-w-[600px] h-[400px] rounded-xl bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400">Loading preview...</span>
      </div>
    )
  }

  return (
    <div ref={ref} className="relative w-full max-w-[600px] h-[400px]">
      {/* 3D Platform */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-x-0 bottom-0 h-16 rounded-xl bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-sm transform perspective-800 rotateX-10"
      />

      {/* Base thumbnail - MODIFIED */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 rounded-xl overflow-hidden shadow-xl"
      >
        <div className="relative w-full h-full">
          <Image
            src="/images/soccer-goal-kick-before.jpg" // New image path
            alt="Before AI Enhancement - Basic Thumbnail"
            fill
            className="object-cover"
          />
          {/* Updated "BEFORE" text box */}
          <div className="absolute bottom-4 left-4 bg-white text-gray-700 p-3 rounded-lg shadow-lg flex items-center gap-2">
            <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-800">BEFORE</h3>
              <p className="text-xs text-gray-500">Original Sketch</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI-enhanced thumbnail */}
      <motion.div
        initial={{ opacity: 0, x: 100, rotateY: 10 }}
        animate={{ opacity: 1, x: 0, rotateY: 0 }}
        transition={{ duration: 0.7, delay: 1.3 }}
        className="absolute inset-0 translate-x-[50%] translate-y-[15%] rounded-xl overflow-hidden shadow-2xl"
      >
        <div className="relative w-full h-full">
          <Image
            src="/images/thumbnail-example.png"
            alt="AI-Enhanced YouTube Thumbnail"
            fill
            className="object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-3 text-center">
            <p className="text-sm font-medium">AI-Enhanced</p>
          </div>
        </div>
      </motion.div>

      {/* Animated elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          delay: 1.2,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          repeatDelay: 3,
        }}
        className="absolute top-[10%] right-[15%] bg-white rounded-full p-2 shadow-lg"
      >
        <Sparkles className="h-6 w-6 text-purple-600" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.5 }}
        className="absolute bottom-[10%] left-[10%] bg-white rounded-lg p-3 shadow-lg"
      >
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium">AI Generated</span>
        </div>
      </motion.div>

      {/* Stats popup */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 2 }}
        className="absolute top-[20%] left-[5%] bg-white rounded-lg p-3 shadow-lg"
      >
        <div className="flex items-center gap-2">
          <TrendUp className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium text-green-600">+42% CTR</span>
        </div>
      </motion.div>

      {/* Energy effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.7, 0] }}
        transition={{
          duration: 2,
          delay: 1,
          repeat: Number.POSITIVE_INFINITY,
          repeatDelay: 3,
        }}
        className="absolute inset-0 translate-x-[50%] translate-y-[15%] rounded-xl overflow-hidden pointer-events-none"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 blur-xl"></div>
      </motion.div>

      {/* Zap effect */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: [0, 1, 0],
          scale: [0.5, 1.2, 0.5],
          x: [0, -10, 0],
          y: [0, -10, 0],
        }}
        transition={{
          duration: 1,
          delay: 2.5,
          repeat: Number.POSITIVE_INFINITY,
          repeatDelay: 4,
        }}
        className="absolute top-[40%] right-[30%]"
      >
        <Zap className="h-8 w-8 text-yellow-400 filter drop-shadow-lg" />
      </motion.div>
    </div>
  )
} 