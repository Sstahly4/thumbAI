"use client"

import { motion } from "framer-motion"
import { TrendingUpIcon as TrendUp, Star, Clock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const trendingStyles = [
  {
    id: 1,
    name: "Neon Minimalist",
    image: "/images/neon-minimalist-crypto.jpg",
    popularity: 92,
    growth: "+18%",
    description: "Clean backgrounds with vibrant neon accents and minimal text",
  },
  {
    id: 2,
    name: "Expressive Faces",
    image: "/images/expressive-face-shocked.jpg",
    popularity: 88,
    growth: "+24%",
    description: "Close-up reactions with exaggerated expressions and bold text overlays",
  },
  {
    id: 3,
    name: "Cinematic Frames",
    image: "/images/cinematic-desert-survival.jpg",
    popularity: 82,
    growth: "+22%",
    description: "Movie-like compositions with dramatic lighting and letterbox format",
  },
  {
    id: 4,
    name: "Whisper Pop",
    image: "/images/asmr-whisper-pop.jpg",
    popularity: 81,
    growth: "+35%",
    description: "Intimate close-ups with soft lighting and calming visual elements",
  },
  {
    id: 5,
    name: "Retro Wave",
    image: "/placeholder.svg?height=200&width=350&text=Retro Wave",
    popularity: 76,
    growth: "+28%",
    description: "80s inspired designs with grid backgrounds and vintage color schemes",
  },
  {
    id: 6,
    name: "Collage Style",
    image: "/placeholder.svg?height=200&width=350&text=Collage Style",
    popularity: 72,
    growth: "+21%",
    description: "Multiple images arranged in a collage with graphic elements",
  },
]

const upcomingStyles = [
  {
    id: 1,
    name: "Glassmorphism",
    image: "/placeholder.svg?height=200&width=350&text=Glassmorphism",
    prediction: "Will trend in Q3",
    description: "Frosted glass effects with subtle transparency and blur",
  },
  {
    id: 2,
    name: "Gradient Duotone",
    image: "/placeholder.svg?height=200&width=350&text=Gradient Duotone",
    prediction: "Rising in popularity",
    description: "Two-color gradients with high contrast and clean typography",
  },
  {
    id: 3,
    name: "Abstract 3D",
    image: "/placeholder.svg?height=200&width=350&text=Abstract 3D",
    prediction: "Early adoption phase",
    description: "Abstract three-dimensional shapes with vibrant colors",
  },
]

export default function TrendingStyles() {
  return (
    <Tabs defaultValue="current">
      <div className="flex justify-between items-center mb-6">
        <TabsList>
          <TabsTrigger value="current">Current Trends</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Trends</TabsTrigger>
        </TabsList>
        <div className="text-xs text-gray-500">Updated weekly</div>
      </div>

      <TabsContent value="current">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trendingStyles.map((style, index) => (
            <motion.div
              key={style.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group"
            >
              <div className="rounded-lg overflow-hidden shadow-md transition-all group-hover:shadow-lg">
                {style.image.startsWith("/images/") ? (
                  <div className="relative">
                    <img 
                      src={`/placeholder.svg?height=200&width=350&text=${encodeURIComponent(style.name.replace(/ /g, "+"))}`} 
                      alt=""
                      aria-hidden="true"
                      className="w-full h-auto opacity-0" 
                    />
                    <img 
                      src={style.image}
                      alt={style.name} 
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center">
                      <Star className="h-3 w-3 mr-1 text-yellow-400" />
                      <span>{style.popularity}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img 
                      src={style.image} 
                      alt={style.name} 
                      className="w-full h-auto" 
                    />
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center">
                      <Star className="h-3 w-3 mr-1 text-yellow-400" />
                      <span>{style.popularity}%</span>
                    </div>
                  </div>
                )}
                <div className="p-4 bg-white">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-medium">{style.name}</h3>
                    <div className="text-xs text-green-600 flex items-center">
                      <TrendUp className="h-3 w-3 mr-0.5" />
                      {style.growth}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{style.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="upcoming">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingStyles.map((style, index) => (
            <motion.div
              key={style.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group"
            >
              <div className="rounded-lg overflow-hidden shadow-md transition-all group-hover:shadow-lg">
                <div className="relative w-full aspect-[7/4]">
                  <img src={style.image || "/placeholder.svg"} alt={style.name} className="w-full h-full object-fill" />
                  <div className="absolute top-2 right-2 bg-purple-600/90 text-white text-xs px-2 py-1 rounded-full flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Upcoming</span>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-medium">{style.name}</h3>
                    <div className="text-xs text-purple-600">{style.prediction}</div>
                  </div>
                  <p className="text-sm text-gray-500">{style.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
} 