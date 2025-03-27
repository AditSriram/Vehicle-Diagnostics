"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TireBurstPredictionOutput } from "@/types"

interface SafeOperatingEnvelopeProps {
  prediction: TireBurstPredictionOutput
}

export function SafeOperatingEnvelope({ prediction }: SafeOperatingEnvelopeProps) {
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
    const padding = 40

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding) // x-axis
    ctx.moveTo(padding, height - padding)
    ctx.lineTo(padding, padding) // y-axis
    ctx.strokeStyle = "#666"
    ctx.lineWidth = 2
    ctx.stroke()

    // Add labels
    ctx.fillStyle = "#666"
    ctx.font = "12px Arial"
    ctx.textAlign = "center"
    ctx.fillText("Speed (km/h)", width / 2, height - 10)

    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = "center"
    ctx.fillText("Load (kg)", 0, 0)
    ctx.restore()

    // Draw safe operating envelope
    const maxSpeed = prediction.safeOperatingEnvelope.maxSpeed
    const maxLoad = prediction.safeOperatingEnvelope.maxLoad

    // Scale factors
    const xScale = (width - 2 * padding) / 200 // Assuming max speed is 200 km/h
    const yScale = (height - 2 * padding) / 2000 // Assuming max load is 2000 kg

    // Draw safe area
    ctx.beginPath()
    ctx.moveTo(padding, height - padding)
    ctx.lineTo(padding + maxSpeed * xScale, height - padding)
    ctx.lineTo(padding + maxSpeed * xScale, height - padding - maxLoad * yScale)
    ctx.lineTo(padding, height - padding - maxLoad * yScale)
    ctx.closePath()

    // Fill with gradient based on burst probability
    const gradient = ctx.createLinearGradient(
      padding,
      height - padding,
      padding + maxSpeed * xScale,
      height - padding - maxLoad * yScale,
    )

    if (prediction.burstProbability < 50) {
      gradient.addColorStop(0, "rgba(34, 197, 94, 0.2)") // green
      gradient.addColorStop(1, "rgba(34, 197, 94, 0.5)")
    } else if (prediction.burstProbability < 70) {
      gradient.addColorStop(0, "rgba(234, 179, 8, 0.2)") // yellow
      gradient.addColorStop(1, "rgba(234, 179, 8, 0.5)")
    } else if (prediction.burstProbability < 85) {
      gradient.addColorStop(0, "rgba(249, 115, 22, 0.2)") // orange
      gradient.addColorStop(1, "rgba(249, 115, 22, 0.5)")
    } else {
      gradient.addColorStop(0, "rgba(239, 68, 68, 0.2)") // red
      gradient.addColorStop(1, "rgba(239, 68, 68, 0.5)")
    }

    ctx.fillStyle = gradient
    ctx.fill()

    ctx.strokeStyle =
      prediction.burstProbability < 50
        ? "#22c55e"
        : prediction.burstProbability < 70
          ? "#eab308"
          : prediction.burstProbability < 85
            ? "#f97316"
            : "#ef4444"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw grid lines
    ctx.beginPath()
    ctx.strokeStyle = "#ddd"
    ctx.lineWidth = 1

    // Vertical grid lines (speed)
    for (let i = 50; i <= 200; i += 50) {
      const x = padding + i * xScale
      ctx.moveTo(x, height - padding)
      ctx.lineTo(x, padding)
      ctx.fillText(i.toString(), x, height - padding + 15)
    }

    // Horizontal grid lines (load)
    for (let i = 500; i <= 2000; i += 500) {
      const y = height - padding - i * yScale
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.fillText(i.toString(), padding - 15, y)
    }

    ctx.stroke()

    // Draw current operating point
    // This would come from real-time data in a real application
    // For this example, we'll use 70% of the max values
    const currentSpeed = maxSpeed * 0.7
    const currentLoad = maxLoad * 0.7

    const pointX = padding + currentSpeed * xScale
    const pointY = height - padding - currentLoad * yScale

    ctx.beginPath()
    ctx.arc(pointX, pointY, 6, 0, Math.PI * 2)
    ctx.fillStyle = "#3b82f6" // blue
    ctx.fill()
    ctx.strokeStyle = "#1d4ed8"
    ctx.lineWidth = 2
    ctx.stroke()

    // Add legend for current point
    ctx.fillStyle = "#3b82f6"
    ctx.fillRect(width - 120, 20, 10, 10)
    ctx.fillStyle = "#666"
    ctx.textAlign = "left"
    ctx.fillText("Current Operation", width - 105, 30)
  }, [prediction])

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Safe Operating Envelope</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px]">
          <canvas ref={canvasRef} width={500} height={300} className="w-full h-full"></canvas>
        </div>
      </CardContent>
    </Card>
  )
}

