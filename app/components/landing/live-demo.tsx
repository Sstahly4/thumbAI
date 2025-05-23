"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Upload, Sparkles, Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"

export default function LiveDemo() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState(50)

  const handleGenerate = () => {
    if (!prompt) return

    setIsGenerating(true)

    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false)
      setShowResults(true)
    }, 2500)
  }

  const handleReset = () => {
    setShowResults(false)
    setPrompt("")
    setStyle(50)
  }

  return (
    <div className="rounded-xl border bg-white shadow-lg overflow-hidden">
      <div className="p-6">
        <Tabs defaultValue="prompt" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="prompt">Text Prompt</TabsTrigger>
            <TabsTrigger value="upload">Upload Image</TabsTrigger>
            <TabsTrigger value="sketch">Quick Sketch</TabsTrigger>
          </TabsList>

          <TabsContent value="prompt" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Describe your thumbnail</label>
              <Textarea
                placeholder="E.g., A tech review thumbnail for the latest iPhone with a surprised expression and bold text saying 'MIND BLOWN!'"
                className="min-h-[100px]"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Style: Minimal to Dramatic</label>
              <Slider
                defaultValue={[50]}
                max={100}
                step={1}
                value={[style]}
                onValueChange={(value) => setStyle(value[0])}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Minimal</span>
                <span>Balanced</span>
                <span>Dramatic</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upload">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Drag and drop an image, or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
              <Button variant="outline" className="mt-4">
                Upload Image
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="sketch">
            <div className="border-2 border-gray-300 rounded-lg p-4 text-center bg-gray-50 h-[200px] flex items-center justify-center">
              <p className="text-sm text-gray-500">Canvas drawing feature would appear here</p>
            </div>
            <div className="flex justify-between mt-4">
              <Button variant="outline" size="sm">
                Clear
              </Button>
              <Button variant="outline" size="sm">
                Save Sketch
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {!showResults && (
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt}
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Thumbnails
              </>
            )}
          </Button>
        )}
      </div>

      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="border-t bg-gray-50 p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Generated Thumbnails</h3>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="relative group">
                <img
                  src={`/placeholder.svg?height=200&width=350&text=Thumbnail ${i}`}
                  alt={`Generated thumbnail ${i}`}
                  className="w-full h-auto rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="bg-white text-purple-600 hover:bg-white hover:text-purple-700"
                  >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download thumbnail</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0">
            <Download className="mr-2 h-4 w-4" />
            Download All Thumbnails
          </Button>
        </motion.div>
      )}
    </div>
  )
}
