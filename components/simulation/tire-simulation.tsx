"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

// Constants for simulation
const BASE_DURABILITY = 100
const TEMP_COEFFICIENT = 0.5
const FRICTION_FACTOR = 0.2
const CRITICAL_TEMP = 90

// Road surface types and their friction coefficients
const ROAD_SURFACES = {
  asphalt: { name: "Asphalt", frictionCoefficient: 1.0 },
  concrete: { name: "Concrete", frictionCoefficient: 0.9 },
  gravel: { name: "Gravel", frictionCoefficient: 1.3 },
  wet: { name: "Wet Road", frictionCoefficient: 1.5 },
  snow: { name: "Snow", frictionCoefficient: 1.8 },
}

interface SimulationData {
  distance: number
  temperature: number
  durability: number
  burstProbability: number
}

export function TireSimulation() {
  // Simulation parameters
  const [distance, setDistance] = useState(0)
  const [speed, setSpeed] = useState(60)
  const [roadSurface, setRoadSurface] = useState("asphalt")
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationData, setSimulationData] = useState<SimulationData[]>([])
  const [currentData, setCurrentData] = useState<SimulationData>({
    distance: 0,
    temperature: 30, // Starting ambient temperature
    durability: BASE_DURABILITY,
    burstProbability: 0,
  })

  // Canvas refs for charts
  const tempChartRef = useRef<HTMLCanvasElement>(null)
  const durabilityChartRef = useRef<HTMLCanvasElement>(null)
  const probabilityChartRef = useRef<HTMLCanvasElement>(null)

  // Simulation interval ref
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Calculate temperature based on distance, speed, and road surface
  const calculateTemperature = (distance: number, speed: number, roadType: string) => {
    const roadFactor = ROAD_SURFACES[roadType as keyof typeof ROAD_SURFACES].frictionCoefficient
    return 30 + distance * 0.5 * roadFactor + speed * 0.2
  }

  // Calculate durability based on temperature and distance
  const calculateDurability = (temp: number, distance: number, roadType: string) => {
    const roadFactor = ROAD_SURFACES[roadType as keyof typeof ROAD_SURFACES].frictionCoefficient
    return Math.max(0, BASE_DURABILITY - TEMP_COEFFICIENT * (temp - 30) - FRICTION_FACTOR * distance * roadFactor)
  }

  // Calculate burst probability using logistic function
  const calculateBurstProbability = (temp: number, durability: number, speed: number) => {
    // Logistic regression model parameters
    const beta0 = -10 // Intercept
    const beta1 = 0.1 // Temperature coefficient
    const beta2 = -0.1 // Durability coefficient
    const beta3 = 0.05 // Speed coefficient

    const z = beta0 + beta1 * temp + beta2 * durability + beta3 * speed
    const probability = 1 / (1 + Math.exp(-z))

    return Math.min(Math.max(probability, 0), 1) * 100 // Convert to percentage
  }

  // Start simulation
  const startSimulation = () => {
    if (isSimulating) return

    setIsSimulating(true)
    setDistance(0)
    setSimulationData([])
    setCurrentData({
      distance: 0,
      temperature: 30,
      durability: BASE_DURABILITY,
      burstProbability: 0,
    })

    // Run simulation at intervals
    simulationIntervalRef.current = setInterval(() => {
      setDistance((prev) => {
        const newDistance = prev + 1
        if (newDistance > 100) {
          stopSimulation()
          return 100
        }
        return newDistance
      })
    }, 300)
  }

  // Stop simulation
  const stopSimulation = () => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current)
      simulationIntervalRef.current = null
    }
    setIsSimulating(false)
  }

  // Reset simulation
  const resetSimulation = () => {
    stopSimulation()
    setDistance(0)
    setSimulationData([])
    setCurrentData({
      distance: 0,
      temperature: 30,
      durability: BASE_DURABILITY,
      burstProbability: 0,
    })
  }

  // Update simulation data when distance changes
  useEffect(() => {
    if (distance > 0) {
      const temp = calculateTemperature(distance, speed, roadSurface)
      const durability = calculateDurability(temp, distance, roadSurface)
      const burstProbability = calculateBurstProbability(temp, durability, speed)

      const newData = {
        distance,
        temperature: temp,
        durability,
        burstProbability,
      }

      setCurrentData(newData)
      setSimulationData((prev) => [...prev, newData])

      // If burst probability is too high, stop simulation
      if (burstProbability > 90) {
        stopSimulation()
      }
    }
  }, [distance, speed, roadSurface])

  // Draw temperature chart
  useEffect(() => {
    if (!tempChartRef.current || simulationData.length === 0) return

    const canvas = tempChartRef.current
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
    ctx.fillText("Distance (km)", width / 2, height - 10)

    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = "center"
    ctx.fillText("Temperature (°C)", 0, 0)
    ctx.restore()

    // Draw grid lines
    ctx.beginPath()
    ctx.strokeStyle = "#ddd"
    ctx.lineWidth = 1

    // Vertical grid lines (distance)
    for (let i = 20; i <= 100; i += 20) {
      const x = padding + (i / 100) * (width - 2 * padding)
      ctx.moveTo(x, height - padding)
      ctx.lineTo(x, padding)
      ctx.fillText(i.toString(), x, height - padding + 15)
    }

    // Horizontal grid lines (temperature)
    for (let i = 30; i <= 120; i += 30) {
      const y = height - padding - ((i - 30) / 90) * (height - 2 * padding)
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.fillText(i.toString(), padding - 15, y + 5)
    }

    ctx.stroke()

    // Draw temperature line
    ctx.beginPath()
    simulationData.forEach((data, index) => {
      const x = padding + (data.distance / 100) * (width - 2 * padding)
      const y = height - padding - ((data.temperature - 30) / 90) * (height - 2 * padding)

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.strokeStyle = "#ef4444" // red
    ctx.lineWidth = 3
    ctx.stroke()

    // Draw critical temperature line
    ctx.beginPath()
    const criticalY = height - padding - ((CRITICAL_TEMP - 30) / 90) * (height - 2 * padding)
    ctx.moveTo(padding, criticalY)
    ctx.lineTo(width - padding, criticalY)
    ctx.strokeStyle = "#ef4444" // red
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    ctx.stroke()
    ctx.setLineDash([])

    // Add critical temperature label
    ctx.fillStyle = "#ef4444"
    ctx.fillText(`Critical (${CRITICAL_TEMP}°C)`, width - padding - 50, criticalY - 5)
  }, [simulationData])

  // Draw durability chart
  useEffect(() => {
    if (!durabilityChartRef.current || simulationData.length === 0) return

    const canvas = durabilityChartRef.current
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
    ctx.fillText("Distance (km)", width / 2, height - 10)

    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = "center"
    ctx.fillText("Durability (%)", 0, 0)
    ctx.restore()

    // Draw grid lines
    ctx.beginPath()
    ctx.strokeStyle = "#ddd"
    ctx.lineWidth = 1

    // Vertical grid lines (distance)
    for (let i = 20; i <= 100; i += 20) {
      const x = padding + (i / 100) * (width - 2 * padding)
      ctx.moveTo(x, height - padding)
      ctx.lineTo(x, padding)
      ctx.fillText(i.toString(), x, height - padding + 15)
    }

    // Horizontal grid lines (durability)
    for (let i = 0; i <= 100; i += 20) {
      const y = height - padding - (i / 100) * (height - 2 * padding)
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.fillText(i.toString(), padding - 15, y + 5)
    }

    ctx.stroke()

    // Draw durability line
    ctx.beginPath()
    simulationData.forEach((data, index) => {
      const x = padding + (data.distance / 100) * (width - 2 * padding)
      const y = height - padding - (data.durability / 100) * (height - 2 * padding)

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.strokeStyle = "#3b82f6" // blue
    ctx.lineWidth = 3
    ctx.stroke()

    // Draw critical durability line (30%)
    ctx.beginPath()
    const criticalY = height - padding - (30 / 100) * (height - 2 * padding)
    ctx.moveTo(padding, criticalY)
    ctx.lineTo(width - padding, criticalY)
    ctx.strokeStyle = "#ef4444" // red
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    ctx.stroke()
    ctx.setLineDash([])

    // Add critical durability label
    ctx.fillStyle = "#ef4444"
    ctx.fillText("Critical (30%)", width - padding - 50, criticalY - 5)
  }, [simulationData])

  // Draw burst probability chart
  useEffect(() => {
    if (!probabilityChartRef.current || simulationData.length === 0) return

    const canvas = probabilityChartRef.current
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
    ctx.fillText("Distance (km)", width / 2, height - 10)

    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = "center"
    ctx.fillText("Burst Probability (%)", 0, 0)
    ctx.restore()

    // Draw grid lines
    ctx.beginPath()
    ctx.strokeStyle = "#ddd"
    ctx.lineWidth = 1

    // Vertical grid lines (distance)
    for (let i = 20; i <= 100; i += 20) {
      const x = padding + (i / 100) * (width - 2 * padding)
      ctx.moveTo(x, height - padding)
      ctx.lineTo(x, padding)
      ctx.fillText(i.toString(), x, height - padding + 15)
    }

    // Horizontal grid lines (probability)
    for (let i = 0; i <= 100; i += 20) {
      const y = height - padding - (i / 100) * (height - 2 * padding)
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.fillText(i.toString(), padding - 15, y + 5)
    }

    ctx.stroke()

    // Draw probability line with gradient
    const gradient = ctx.createLinearGradient(padding, height - padding, padding, padding)
    gradient.addColorStop(0, "#22c55e") // green
    gradient.addColorStop(0.5, "#eab308") // yellow
    gradient.addColorStop(0.7, "#f97316") // orange
    gradient.addColorStop(1, "#ef4444") // red

    // Draw probability area
    ctx.beginPath()
    ctx.moveTo(padding, height - padding)

    simulationData.forEach((data) => {
      const x = padding + (data.distance / 100) * (width - 2 * padding)
      const y = height - padding - (data.burstProbability / 100) * (height - 2 * padding)
      ctx.lineTo(x, y)
    })

    ctx.lineTo(
      padding + (simulationData[simulationData.length - 1].distance / 100) * (width - 2 * padding),
      height - padding,
    )
    ctx.closePath()
    ctx.fillStyle = "rgba(239, 68, 68, 0.2)" // light red
    ctx.fill()

    // Draw probability line
    ctx.beginPath()
    simulationData.forEach((data, index) => {
      const x = padding + (data.distance / 100) * (width - 2 * padding)
      const y = height - padding - (data.burstProbability / 100) * (height - 2 * padding)

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.strokeStyle = gradient
    ctx.lineWidth = 3
    ctx.stroke()

    // Draw critical probability line (70%)
    ctx.beginPath()
    const criticalY = height - padding - (70 / 100) * (height - 2 * padding)
    ctx.moveTo(padding, criticalY)
    ctx.lineTo(width - padding, criticalY)
    ctx.strokeStyle = "#ef4444" // red
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    ctx.stroke()
    ctx.setLineDash([])

    // Add critical probability label
    ctx.fillStyle = "#ef4444"
    ctx.fillText("Critical (70%)", width - padding - 50, criticalY - 5)
  }, [simulationData])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current)
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Virtual Tire Simulation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="distance-slider">Distance: {distance} km</Label>
                <Slider
                  id="distance-slider"
                  min={0}
                  max={100}
                  step={1}
                  value={[distance]}
                  onValueChange={(value) => !isSimulating && setDistance(value[0])}
                  disabled={isSimulating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="speed-slider">Speed: {speed} km/h</Label>
                <Slider
                  id="speed-slider"
                  min={40}
                  max={120}
                  step={5}
                  value={[speed]}
                  onValueChange={(value) => setSpeed(value[0])}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="road-surface">Road Surface</Label>
                <Select value={roadSurface} onValueChange={setRoadSurface}>
                  <SelectTrigger id="road-surface">
                    <SelectValue placeholder="Select road surface" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROAD_SURFACES).map(([key, { name }]) => (
                      <SelectItem key={key} value={key}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button onClick={startSimulation} disabled={isSimulating} className="w-32">
                Start
              </Button>
              <Button onClick={stopSimulation} disabled={!isSimulating} variant="outline" className="w-32">
                Pause
              </Button>
              <Button onClick={resetSimulation} variant="destructive" className="w-32">
                Reset
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-gray-50 p-4 rounded-md flex flex-col items-center">
                <div className="text-sm text-gray-500 mb-1">Temperature</div>
                <div className="text-2xl font-bold">{currentData.temperature.toFixed(1)}°C</div>
                <div
                  className={`text-xs mt-1 ${currentData.temperature >= CRITICAL_TEMP ? "text-red-500" : "text-green-500"}`}
                >
                  {currentData.temperature >= CRITICAL_TEMP ? "CRITICAL" : "NORMAL"}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md flex flex-col items-center">
                <div className="text-sm text-gray-500 mb-1">Durability</div>
                <div className="text-2xl font-bold">{currentData.durability.toFixed(1)}%</div>
                <div className={`text-xs mt-1 ${currentData.durability <= 30 ? "text-red-500" : "text-green-500"}`}>
                  {currentData.durability <= 30 ? "CRITICAL" : "NORMAL"}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md flex flex-col items-center">
                <div className="text-sm text-gray-500 mb-1">Burst Probability</div>
                <div className="text-2xl font-bold">{currentData.burstProbability.toFixed(1)}%</div>
                <div
                  className={`text-xs mt-1 ${currentData.burstProbability >= 70 ? "text-red-500" : "text-green-500"}`}
                >
                  {currentData.burstProbability >= 70 ? "HIGH RISK" : "LOW RISK"}
                </div>
              </div>
            </div>

            {currentData.burstProbability >= 70 && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>
                  <strong>Warning:</strong> Tire burst probability is critically high! Reduce speed and check tire
                  condition immediately.
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Temperature vs. Distance</CardTitle>
          </CardHeader>
          <CardContent>
            <canvas ref={tempChartRef} width={400} height={300} className="w-full h-[300px]"></canvas>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Durability vs. Distance</CardTitle>
          </CardHeader>
          <CardContent>
            <canvas ref={durabilityChartRef} width={400} height={300} className="w-full h-[300px]"></canvas>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Burst Probability vs. Distance</CardTitle>
          </CardHeader>
          <CardContent>
            <canvas ref={probabilityChartRef} width={400} height={300} className="w-full h-[300px]"></canvas>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Tire Condition Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Temperature</Label>
                <span className={currentData.temperature >= CRITICAL_TEMP ? "text-red-500" : "text-green-500"}>
                  {currentData.temperature.toFixed(1)}°C
                </span>
              </div>
              <Progress
                value={(currentData.temperature / 120) * 100}
                className="h-2"
                indicatorClassName={
                  currentData.temperature >= CRITICAL_TEMP
                    ? "bg-red-500"
                    : currentData.temperature >= 70
                      ? "bg-orange-500"
                      : currentData.temperature >= 50
                        ? "bg-yellow-500"
                        : "bg-green-500"
                }
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Durability</Label>
                <span className={currentData.durability <= 30 ? "text-red-500" : "text-green-500"}>
                  {currentData.durability.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={currentData.durability}
                className="h-2"
                indicatorClassName={
                  currentData.durability <= 30
                    ? "bg-red-500"
                    : currentData.durability <= 50
                      ? "bg-orange-500"
                      : currentData.durability <= 70
                        ? "bg-yellow-500"
                        : "bg-green-500"
                }
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Burst Probability</Label>
                <span className={currentData.burstProbability >= 70 ? "text-red-500" : "text-green-500"}>
                  {currentData.burstProbability.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={currentData.burstProbability}
                className="h-2"
                indicatorClassName={
                  currentData.burstProbability >= 70
                    ? "bg-red-500"
                    : currentData.burstProbability >= 50
                      ? "bg-orange-500"
                      : currentData.burstProbability >= 30
                        ? "bg-yellow-500"
                        : "bg-green-500"
                }
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Analysis</h3>
              <p className="text-sm text-gray-600">
                {currentData.burstProbability >= 70 ? (
                  <>
                    <strong className="text-red-500">Critical Risk:</strong> The tire is at high risk of bursting.
                    Temperature is {currentData.temperature >= CRITICAL_TEMP ? "above" : "approaching"} critical levels,
                    and durability has decreased to {currentData.durability.toFixed(1)}%. Immediate action is required.
                  </>
                ) : currentData.burstProbability >= 50 ? (
                  <>
                    <strong className="text-orange-500">Moderate Risk:</strong> The tire is showing signs of stress.
                    Temperature is {currentData.temperature.toFixed(1)}°C, and durability is at{" "}
                    {currentData.durability.toFixed(1)}%. Consider reducing speed and monitoring the tire condition.
                  </>
                ) : (
                  <>
                    <strong className="text-green-500">Low Risk:</strong> The tire is in good condition. Temperature is{" "}
                    {currentData.temperature.toFixed(1)}°C, well below critical levels. Durability remains strong at{" "}
                    {currentData.durability.toFixed(1)}%.
                  </>
                )}
              </p>

              <h3 className="font-medium mt-4 mb-2">Recommendations</h3>
              <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                {currentData.burstProbability >= 70 ? (
                  <>
                    <li>Reduce speed immediately to below {Math.max(40, speed - 40)} km/h</li>
                    <li>Pull over safely and inspect the tire as soon as possible</li>
                    <li>Consider replacing the tire if visible damage is present</li>
                    <li>Avoid rough road surfaces until the tire is inspected</li>
                  </>
                ) : currentData.burstProbability >= 50 ? (
                  <>
                    <li>Reduce speed to below {Math.max(40, speed - 20)} km/h</li>
                    <li>Monitor tire temperature and pressure</li>
                    <li>Plan for a tire inspection at the next stop</li>
                    <li>Avoid aggressive driving maneuvers</li>
                  </>
                ) : (
                  <>
                    <li>Maintain current driving conditions</li>
                    <li>Continue regular tire maintenance schedule</li>
                    <li>Check tire pressure at next refueling</li>
                    <li>Monitor for any changes in vehicle handling</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

