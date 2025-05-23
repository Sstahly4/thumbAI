"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

export default function ParallaxSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200])
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -300])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0])

  return (
    <section
      ref={ref}
      className="w-full py-24 md:py-32 lg:py-48 bg-gradient-to-br from-purple-900 to-black overflow-hidden relative"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=500&width=500')] bg-repeat opacity-5"></div>
      </div>

      <div className="container px-4 md:px-6 relative">
        <motion.div style={{ opacity }} className="text-center text-white mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Transform Your YouTube Channel</h2>
          <p className="text-lg md:text-xl text-purple-200 max-w-3xl mx-auto">
            Join thousands of creators who are using AI to create thumbnails that drive more views
          </p>
        </motion.div>

        <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-5xl mx-auto">
          <motion.div style={{ y: y1 }} className="flex flex-col gap-4">
            <div className="rounded-lg overflow-hidden shadow-lg transform rotate-2">
              <img src="/placeholder.svg?height=200&width=300" alt="Thumbnail example" className="w-full h-auto" />
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg transform -rotate-3">
              <img src="/placeholder.svg?height=200&width=300" alt="Thumbnail example" className="w-full h-auto" />
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg transform rotate-1">
              <img src="/placeholder.svg?height=200&width=300" alt="Thumbnail example" className="w-full h-auto" />
            </div>
          </motion.div>

          <motion.div style={{ y: y2 }} className="flex flex-col gap-4 mt-12">
            <div className="rounded-lg overflow-hidden shadow-lg transform -rotate-2">
              <img src="/placeholder.svg?height=200&width=300" alt="Thumbnail example" className="w-full h-auto" />
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg transform rotate-3">
              <img src="/placeholder.svg?height=200&width=300" alt="Thumbnail example" className="w-full h-auto" />
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg transform -rotate-1">
              <img src="/placeholder.svg?height=200&width=300" alt="Thumbnail example" className="w-full h-auto" />
            </div>
          </motion.div>

          <motion.div style={{ y: y3 }} className="flex flex-col gap-4">
            <div className="rounded-lg overflow-hidden shadow-lg transform rotate-3">
              <img src="/placeholder.svg?height=200&width=300" alt="Thumbnail example" className="w-full h-auto" />
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg transform -rotate-2">
              <img src="/placeholder.svg?height=200&width=300" alt="Thumbnail example" className="w-full h-auto" />
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg transform rotate-2">
              <img src="/placeholder.svg?height=200&width=300" alt="Thumbnail example" className="w-full h-auto" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
