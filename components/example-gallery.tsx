"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { useMediaQuery } from "@/hooks/use-media-query"

const examples = [
  {
    id: 1,
    title: "Gaming Thumbnail",
    before: "/images/gaming-before-sketch.jpg",
    after: "/images/gaming-thumbnail.png",
    description: "From a simple sketch to an eye-catching gaming thumbnail",
    stats: "+52% CTR",
  },
  {
    id: 2,
    title: "Tech Review",
    before: "/images/tech-review-before-sketch.jpg",
    after: "/images/tech-review-thumbnail.png",
    description: "Transform product photos into professional review thumbnails",
    stats: "+38% CTR",
  },
  {
    id: 3,
    title: "Tutorial Thumbnail",
    before: "/images/tutorial-thumbnail-before-sketch.jpg",
    after: "/images/tutorial-thumbnail.png",
    description: "Create clear, instructional thumbnails that drive engagement",
    stats: "+45% CTR",
  },
]

export default function ExampleGallery() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const nextExample = () => {
    setDirection(1)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % examples.length)
  }

  const prevExample = () => {
    setDirection(-1)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + examples.length) % examples.length)
  }

  const currentExample = examples[currentIndex]

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 200 : -200,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 200 : -200,
      opacity: 0,
    }),
  }

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`before-${currentExample.id}`}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5 }}
            className="flex-1 relative group w-full"
          >
            <Dialog>
              <DialogTrigger asChild>
                <div className="rounded-lg overflow-hidden border-0 shadow-lg cursor-pointer relative w-full">
                  <div className="w-full h-[250px] md:h-[350px] bg-gray-100">
                    <img
                      src={currentExample.before || "/placeholder.svg"}
                      alt={`Before: ${currentExample.title}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 md:p-4 bg-gray-100">
                    <h3 className="font-medium text-center text-sm md:text-base">Before</h3>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Maximize2 className="h-6 w-6 text-white" />
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] md:max-w-3xl">
                <img
                  src={currentExample.before || "/placeholder.svg"}
                  alt={`Before: ${currentExample.title}`}
                  className="w-full h-auto"
                />
              </DialogContent>
            </Dialog>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-center my-2 md:my-0">
          <div className="hidden md:flex w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 items-center justify-center shadow-lg">
            <ArrowRight className="h-8 w-8 text-white" />
          </div>
          <div className="flex md:hidden w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 items-center justify-center shadow-lg">
            <ArrowRight className="h-6 w-6 text-white rotate-90" />
          </div>
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`after-${currentExample.id}`}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5 }}
            className="flex-1 relative group w-full"
          >
            <Dialog>
              <DialogTrigger asChild>
                <div className="rounded-lg overflow-hidden border-0 shadow-xl cursor-pointer relative w-full">
                  <div className="w-full h-[250px] md:h-[350px] bg-purple-50">
                    <img
                      src={currentExample.after || "/placeholder.svg"}
                      alt={`After: ${currentExample.title}`}
                      className="w-full h-full object-cover"
                      style={{ objectPosition: "center" }}
                    />
                  </div>
                  <div className="p-3 md:p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-sm md:text-base">After (AI Generated)</h3>
                      <span className="text-xs bg-white text-purple-600 px-2 py-0.5 rounded-full font-medium">
                        {currentExample.stats}
                      </span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Maximize2 className="h-6 w-6 text-white" />
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] md:max-w-3xl">
                <img
                  src={currentExample.after || "/placeholder.svg"}
                  alt={`After: ${currentExample.title}`}
                  className="w-full h-auto"
                />
              </DialogContent>
            </Dialog>
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.div
        key={`info-${currentExample.id}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="mt-6 md:mt-8 text-center"
      >
        <h3 className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
          {currentExample.title}
        </h3>
        <p className="text-sm md:text-base text-gray-500 mt-1 md:mt-2">{currentExample.description}</p>
      </motion.div>

      <div className="flex justify-center mt-4 md:mt-6 gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={prevExample}
          className="rounded-full border-0 shadow-md hover:shadow-lg h-8 w-8 md:h-10 md:w-10"
        >
          <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
          <span className="sr-only">Previous example</span>
        </Button>
        <div className="flex gap-1 items-center">
          {examples.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1)
                setCurrentIndex(index)
              }}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
                index === currentIndex ? "bg-gradient-to-r from-purple-600 to-pink-600 scale-110" : "bg-gray-300"
              }`}
              aria-label={`Go to example ${index + 1}`}
            />
          ))}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={nextExample}
          className="rounded-full border-0 shadow-md hover:shadow-lg h-8 w-8 md:h-10 md:w-10"
        >
          <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
          <span className="sr-only">Next example</span>
        </Button>
      </div>
    </div>
  )
} 