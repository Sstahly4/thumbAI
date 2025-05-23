"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonials = [
  {
    id: 1,
    name: "Alex Rodriguez",
    role: "Tech Reviewer",
    avatar: "/placeholder.svg?height=80&width=80",
    content:
      "I used to spend $200 per video just on thumbnails, plus hours taking reference shots. ThumbAI gives me studio-quality results instantly. Game changer.",
    rating: 5,
    before: "/placeholder.svg?height=150&width=250&text=Before",
    after: "/placeholder.svg?height=150&width=250&text=After",
    stats: "+47% CTR",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    role: "Gaming Creator",
    avatar: "/placeholder.svg?height=80&width=80",
    content:
      "I used to spend hours designing thumbnails. Now I can create multiple options in minutes and they perform better than my manual designs ever did.",
    rating: 5,
    before: "/placeholder.svg?height=150&width=250&text=Before",
    after: "/placeholder.svg?height=150&width=250&text=After",
    stats: "+32% Views",
  },
  {
    id: 3,
    name: "Michael Chen",
    role: "Tutorial Channel",
    avatar: "/placeholder.svg?height=80&width=80",
    content:
      "The thumbnail analyzer feature is a game-changer. It helped me understand what was working and what wasn't in my previous designs.",
    rating: 4,
    before: "/placeholder.svg?height=150&width=250&text=Before",
    after: "/placeholder.svg?height=150&width=250&text=After",
    stats: "+28% Subscribers",
  },
]

export default function TestimonialSlider() {
  const [current, setCurrent] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  const next = () => {
    setCurrent((current + 1) % testimonials.length)
  }

  const prev = () => {
    setCurrent((current - 1 + testimonials.length) % testimonials.length)
  }

  useEffect(() => {
    if (!autoplay) return

    const timer = setTimeout(next, 5000)
    return () => clearTimeout(timer)
  }, [current, autoplay])

  return (
    <div
      className="relative rounded-xl border bg-white shadow-lg overflow-hidden"
      onMouseEnter={() => setAutoplay(false)}
      onMouseLeave={() => setAutoplay(true)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={testimonials[current].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-start gap-4 mb-6">
                <img
                  src={testimonials[current].avatar || "/placeholder.svg"}
                  alt={testimonials[current].name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-bold text-lg">{testimonials[current].name}</h3>
                  <p className="text-gray-500">{testimonials[current].role}</p>
                  <div className="flex mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < testimonials[current].rating ? "text-yellow-400" : "text-gray-300"}`}
                        fill={i < testimonials[current].rating ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative mb-6">
                <Quote className="h-8 w-8 text-purple-200 absolute -top-2 -left-2" />
                <blockquote className="text-gray-700 pl-6 relative">"{testimonials[current].content}"</blockquote>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-4 text-center">Results</h4>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <div className="relative">
                  <img
                    src={testimonials[current].before || "/placeholder.svg"}
                    alt="Before using ThumbAI"
                    className="rounded-lg shadow-sm"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs py-1 text-center">
                    Before
                  </div>
                </div>
                <div className="relative">
                  <img
                    src={testimonials[current].after || "/placeholder.svg"}
                    alt="After using ThumbAI"
                    className="rounded-lg shadow-md"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-purple-600 text-white text-xs py-1 text-center">
                    After
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <span className="inline-block bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                  {testimonials[current].stats}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between p-4 border-t">
        <Button variant="outline" size="icon" onClick={prev} className="rounded-full">
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous testimonial</span>
        </Button>

        <div className="flex gap-1 items-center">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === current ? "bg-purple-600" : "bg-gray-300"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        <Button variant="outline" size="icon" onClick={next} className="rounded-full">
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next testimonial</span>
        </Button>
      </div>
    </div>
  )
}
