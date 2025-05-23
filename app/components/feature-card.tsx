import { ReactNode } from 'react'
import { Card } from '@/components/ui/card'

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  step: number
}

export default function FeatureCard({ icon, title, description, step }: FeatureCardProps) {
  return (
    <Card className="relative flex flex-col items-center text-center p-6 bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
      {/* Step number */}
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-semibold">
          {step}
        </div>
      </div>
      
      {/* Icon */}
      <div className="mb-4 mt-4">{icon}</div>
      
      {/* Content */}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </Card>
  )
} 