"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { EngineFailurePredictionOutput } from "@/types"

interface FailureHeatmapProps {
  prediction: EngineFailurePredictionOutput
}

export function FailureHeatmap({ prediction }: FailureHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions
    const width = canvas.width
    const height = canvas.height
    const padding = 20

    // Get heatmap data
    const heatmapData = Object.entries(prediction.failureProbabilityHeatmap).sort((a, b) => b[1] - a[1]) // Sort by probability (highest first)

    // Calculate bar dimensions
    const barWidth = (width - 2 * padding) / heatmapData.length
    const maxBarHeight = height - 2 * padding - 30 // Leave space for labels

    // Draw bars
    heatmapData.forEach((item, index) => {
      const [component, probability] = item

      // Calculate bar height
      const barHeight = (probability / 100) * maxBarHeight

      // Calculate position
      const x = padding + index * barWidth
      const y = height - padding - barHeight - 30 // 30px for labels

      // Determine color based on probability
      let color
      if (probability >= 85)
        color = "#ef4444" // red
      else if (probability >= 70)
        color = "#f97316" // orange
      else if (probability >= 50)
        color = "#eab308" // yellow
      else if (probability >= 30)
        color = "#84cc16" // light green
      else color = "#22c55e" // green

      // Draw bar
      ctx.fillStyle = color
      ctx.fillRect(x, y, barWidth - 5, barHeight)

      // Add probability text
      ctx.fillStyle = "#000"
      ctx.font = "10px Arial"
      ctx.textAlign = "center"
      ctx.fillText(`${Math.round(probability)}%`, x + (barWidth - 5) / 2, y - 5)

      // Add component label
      ctx.fillStyle = "#666"
      ctx.font = "10px Arial"
      ctx.textAlign = "center"

      // Shorten component name if too long
      let displayName = component
      if (displayName.length > 10) {
        displayName = displayName.substring(0, 8) + "..."
      }

      // Rotate text for better readability
      ctx.save()
      ctx.translate(x + (barWidth - 5) / 2, height - padding - 10)
      ctx.rotate(-Math.PI / 4)
      ctx.fillText(displayName, 0, 0)
      ctx.restore()
    })

    // Add title
    ctx.fillStyle = "#000"
    ctx.font = "bold 12px Arial"
    ctx.textAlign = "center"
    ctx.fillText("Component Failure Probability (%)", width / 2, 15)
  }, [prediction])

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Failure Probability Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px]">
          <canvas ref={canvasRef} width={500} height={300} className="w-full h-full"></canvas>
        </div>
      </CardContent>
    </Card>
  )
}

