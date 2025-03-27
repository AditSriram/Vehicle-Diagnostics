"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { EngineFailurePredictionOutput } from "@/types"
import { Clock, PenToolIcon as Tool, ShoppingCart, AlertCircle } from "lucide-react"

interface EnginePredictionCardProps {
  prediction: EngineFailurePredictionOutput
  onAlertClick?: () => void
}

export function EnginePredictionCard({ prediction, onAlertClick }: EnginePredictionCardProps) {
  const [expanded, setExpanded] = useState(false)

  // Find highest probability component
  const highestProbComponent = Object.entries(prediction.failureProbabilityHeatmap).reduce(
    (highest, [component, probability]) => {
      return probability > highest.probability ? { component, probability } : highest
    },
    { component: "", probability: 0 },
  )

  // Determine severity level and color
  const getSeverityColor = (probability: number) => {
    if (probability >= 85) return "bg-red-500"
    if (probability >= 70) return "bg-orange-500"
    if (probability >= 50) return "bg-yellow-500"
    return "bg-green-500"
  }

  const severityColor = getSeverityColor(highestProbComponent.probability)

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex justify-between items-center">
          <span>Engine Failure Prediction</span>
          {highestProbComponent.probability >= 70 && (
            <AlertCircle className="h-5 w-5 text-red-500 cursor-pointer" onClick={onAlertClick} />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Highest Failure Risk: {highestProbComponent.component}</span>
              <span className="text-sm font-medium">{highestProbComponent.probability.toFixed(1)}%</span>
            </div>
            <Progress value={highestProbComponent.probability} className="h-2" indicatorClassName={severityColor} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Remaining Life</p>
                <p className="font-medium">{Math.round(prediction.remainingUsefulLife.hours)} hrs</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tool className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground">Maintenance Items</p>
                <p className="font-medium">{prediction.maintenancePriorities.filter((p) => p.priority >= 5).length}</p>
              </div>
            </div>
          </div>

          <button
            className="text-sm text-primary hover:underline w-full text-center"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Show Less" : "Show More"}
          </button>

          {expanded && (
            <div className="pt-2 space-y-3 border-t">
              <h4 className="text-sm font-medium">Remaining Useful Life</h4>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div>Hours:</div>
                <div>{Math.round(prediction.remainingUsefulLife.hours)}</div>
                <div>Kilometers:</div>
                <div>{Math.round(prediction.remainingUsefulLife.kilometers)}</div>
              </div>

              <h4 className="text-sm font-medium">Top Maintenance Priorities</h4>
              <div className="space-y-2">
                {prediction.maintenancePriorities.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        item.priority >= 8 ? "bg-red-500" : item.priority >= 5 ? "bg-orange-500" : "bg-yellow-500"
                      }`}
                    ></span>
                    <span className="text-sm">
                      {item.component}: {item.recommendedAction}
                    </span>
                  </div>
                ))}
              </div>

              <h4 className="text-sm font-medium">Upcoming Spare Parts</h4>
              <div className="space-y-2">
                {prediction.sparePartsConsumptionForecast.slice(0, 3).map((part, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {part.part} x{part.quantity} - {new Date(part.estimatedReplacementDate).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

