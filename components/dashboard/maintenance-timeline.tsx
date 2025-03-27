"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { EngineFailurePredictionOutput } from "@/types"

interface MaintenanceTimelineProps {
  prediction: EngineFailurePredictionOutput
}

export function MaintenanceTimeline({ prediction }: MaintenanceTimelineProps) {
  // Sort spare parts by replacement date
  const sortedParts = [...prediction.sparePartsConsumptionForecast].sort(
    (a, b) => new Date(a.estimatedReplacementDate).getTime() - new Date(b.estimatedReplacementDate).getTime(),
  )

  // Group parts by month
  const partsByMonth: Record<string, typeof sortedParts> = {}

  sortedParts.forEach((part) => {
    const date = new Date(part.estimatedReplacementDate)
    const monthYear = `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`

    if (!partsByMonth[monthYear]) {
      partsByMonth[monthYear] = []
    }

    partsByMonth[monthYear].push(part)
  })

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Maintenance Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(partsByMonth).map(([monthYear, parts], monthIndex) => (
            <div key={monthYear} className="relative">
              {/* Timeline connector */}
              {monthIndex < Object.keys(partsByMonth).length - 1 && (
                <div className="absolute left-3.5 top-6 bottom-0 w-0.5 bg-gray-200"></div>
              )}

              <div className="flex items-start gap-3">
                {/* Timeline node */}
                <div className="mt-0.5 h-7 w-7 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                  {monthIndex + 1}
                </div>

                <div className="flex-1">
                  <h3 className="font-medium text-lg">{monthYear}</h3>

                  <div className="mt-2 space-y-3">
                    {parts.map((part, partIndex) => (
                      <div key={partIndex} className="bg-gray-50 p-3 rounded-md">
                        <div className="flex justify-between">
                          <span className="font-medium">{part.part}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(part.estimatedReplacementDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">Quantity: {part.quantity}</div>

                        {/* Priority indicator based on date proximity */}
                        <div className="mt-2 flex items-center">
                          <div className="text-xs font-medium mr-2">Priority:</div>
                          <div className="flex">
                            {Array.from({ length: getPriorityLevel(part.estimatedReplacementDate) }).map((_, i) => (
                              <div
                                key={i}
                                className={`h-2 w-2 rounded-full mr-0.5 ${getPriorityColor(part.estimatedReplacementDate)}`}
                              ></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {Object.keys(partsByMonth).length === 0 && (
            <div className="text-center py-8 text-gray-500">No maintenance items scheduled</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to determine priority level (1-5) based on date proximity
function getPriorityLevel(date: Date): number {
  const now = new Date()
  const daysUntil = Math.ceil((new Date(date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntil <= 7) return 5
  if (daysUntil <= 30) return 4
  if (daysUntil <= 90) return 3
  if (daysUntil <= 180) return 2
  return 1
}

// Helper function to determine priority color based on date proximity
function getPriorityColor(date: Date): string {
  const now = new Date()
  const daysUntil = Math.ceil((new Date(date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntil <= 7) return "bg-red-500"
  if (daysUntil <= 30) return "bg-orange-500"
  if (daysUntil <= 90) return "bg-yellow-500"
  if (daysUntil <= 180) return "bg-blue-500"
  return "bg-green-500"
}

