"use client"

import { useState } from "react"
import { Eye, BarChart3, TrendingUpIcon as TrendUp, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export default function ThumbnailAnalyzer() {
  const [activeTab, setActiveTab] = useState("heatmap")

  return (
    <div className="rounded-xl border bg-white shadow-lg overflow-hidden">
      <div className="grid md:grid-cols-2 gap-0">
        <div className="p-6 border-b md:border-b-0 md:border-r">
          <h3 className="font-medium mb-4">Thumbnail Preview</h3>

          <div className="relative rounded-lg overflow-hidden shadow-md">
            <img src="/placeholder.svg?height=300&width=500" alt="Sample thumbnail" className="w-full h-auto" />

            {activeTab === "heatmap" && (
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-red-500/40 mix-blend-multiply">
                <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-red-500 rounded-full mix-blend-screen filter blur-xl opacity-60"></div>
                <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-red-500 rounded-full mix-blend-screen filter blur-xl opacity-40"></div>
              </div>
            )}

            {activeTab === "elements" && (
              <div className="absolute inset-0">
                <div className="absolute top-[10%] left-[10%] right-[10%] h-12 border-2 border-green-500 rounded bg-green-500/10 flex items-center justify-center">
                  <span className="text-xs text-green-700 font-medium">Title Text (High Impact)</span>
                </div>
                <div className="absolute top-[40%] left-[20%] w-24 h-24 border-2 border-blue-500 rounded bg-blue-500/10 flex items-center justify-center">
                  <span className="text-xs text-blue-700 font-medium">Face (High Engagement)</span>
                </div>
                <div className="absolute bottom-[10%] right-[10%] w-32 h-12 border-2 border-yellow-500 rounded bg-yellow-500/10 flex items-center justify-center">
                  <span className="text-xs text-yellow-700 font-medium">Product (Focus Area)</span>
                </div>
              </div>
            )}

            {activeTab === "metrics" && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-white p-4 rounded-lg shadow-lg max-w-[80%]">
                  <div className="text-center font-bold text-lg mb-2">Predicted CTR: 8.2%</div>
                  <div className="text-xs text-gray-500 mb-1">Above average for your niche</div>
                  <TrendUp className="h-4 w-4 text-green-500 mx-auto" />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant={activeTab === "heatmap" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("heatmap")}
              className={activeTab === "heatmap" ? "bg-purple-600 hover:bg-purple-700" : ""}
            >
              <Eye className="h-4 w-4 mr-1" />
              Attention Heatmap
            </Button>
            <Button
              variant={activeTab === "elements" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("elements")}
              className={activeTab === "elements" ? "bg-purple-600 hover:bg-purple-700" : ""}
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              Key Elements
            </Button>
            <Button
              variant={activeTab === "metrics" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("metrics")}
              className={activeTab === "metrics" ? "bg-purple-600 hover:bg-purple-700" : ""}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Metrics
            </Button>
          </div>
        </div>

        <div className="p-6">
          <h3 className="font-medium mb-4">Performance Analysis</h3>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Click-Through Rate</span>
                <span className="text-sm font-medium text-green-600">8.2%</span>
              </div>
              <Progress value={82} className="h-2 bg-gray-100" indicatorClassName="bg-green-500" />
              <p className="text-xs text-gray-500 mt-1">32% higher than average</p>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Attention Capture</span>
                <span className="text-sm font-medium text-purple-600">76%</span>
              </div>
              <Progress value={76} className="h-2 bg-gray-100" indicatorClassName="bg-purple-500" />
              <p className="text-xs text-gray-500 mt-1">Strong visual hierarchy</p>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Emotional Response</span>
                <span className="text-sm font-medium text-orange-600">65%</span>
              </div>
              <Progress value={65} className="h-2 bg-gray-100" indicatorClassName="bg-orange-500" />
              <p className="text-xs text-gray-500 mt-1">Moderate emotional impact</p>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Brand Consistency</span>
                <span className="text-sm font-medium text-blue-600">90%</span>
              </div>
              <Progress value={90} className="h-2 bg-gray-100" indicatorClassName="bg-blue-500" />
              <p className="text-xs text-gray-500 mt-1">Excellent brand alignment</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-sm mb-2">AI Recommendations</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <TrendUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Increase text contrast by 15% to improve readability</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Add a subtle facial expression to boost emotional response</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Consider A/B testing with a brighter background color</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
