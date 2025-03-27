"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { TireBurstPredictionOutput } from "@/types"
import { AlertCircle, ThermometerIcon as ThermometerHot, Gauge } from "lucide-react"

interface TirePredictionCardProps {
  prediction: TireBurstPredictionOutput
  onAlertClick?: () => void
}

export function TirePredictionCard({ prediction, onAlertClick }: TirePredictionCardProps) {
  const [expanded, setExpanded] = useState(false)

  // Determine severity level and color
  const getSeverityColor = (probability: number) => {
    if (probability >= 85) return "bg-red-500"
    if (probability >= 70) return "bg-orange-500"
    if (probability >= 50) return "bg-yellow-500"
    return "bg-green-500"
  }

  const severityColor = getSeverityColor(prediction.burstProbability)

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex justify-between items-center">
          <span>Tire Burst Prediction</span>
          {(prediction.maintenanceAlerts.level70 ||
            prediction.maintenanceAlerts.level85 ||
            prediction.maintenanceAlerts.level95) && (
            <AlertCircle className="h-5 w-5 text-red-500 cursor-pointer" onClick={onAlertClick} />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Burst Probability</span>
              <span className="text-sm font-medium">{prediction.burstProbability.toFixed(1)}%</span>
            </div>
            <Progress value={prediction.burstProbability} className="h-2" indicatorClassName={severityColor} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <ThermometerHot className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground">Critical Temp</p>
                <p className="font-medium">{prediction.criticalTemperatureThreshold}°C</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Max Speed</p>
                <p className="font-medium">{prediction.safeOperatingEnvelope.maxSpeed.toFixed(0)} km/h</p>
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
              <h4 className="text-sm font-medium">Safe Operating Envelope</h4>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div>Max Load:</div>
                <div>{prediction.safeOperatingEnvelope.maxLoad.toFixed(0)} kg</div>
                <div>Max Temperature:</div>
                <div>{prediction.safeOperatingEnvelope.maxTemperature.toFixed(1)}°C</div>
                <div>Max Duration:</div>
                <div>{prediction.safeOperatingEnvelope.maxDuration.toFixed(0)} min</div>
              </div>

              <h4 className="text-sm font-medium">Maintenance Alerts</h4>
              <div className="space-y-1">
                {prediction.maintenanceAlerts.level95 && (
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500"></span>
                    <span className="text-sm">Critical: Immediate attention required</span>
                  </div>
                )}
                {prediction.maintenanceAlerts.level85 && (
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                    <span className="text-sm">Warning: Service soon</span>
                  </div>
                )}
                {prediction.maintenanceAlerts.level70 && (
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                    <span className="text-sm">Caution: Monitor closely</span>
                  </div>
                )}
                {!prediction.maintenanceAlerts.level70 &&
                  !prediction.maintenanceAlerts.level85 &&
                  !prediction.maintenanceAlerts.level95 && (
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      <span className="text-sm">Normal: No action required</span>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

