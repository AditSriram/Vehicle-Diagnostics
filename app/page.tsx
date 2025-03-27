"use client"

import { useState, useEffect } from "react"
import type { TireBurstPredictionOutput, EngineFailurePredictionOutput } from "@/types"
import { TirePredictionCard } from "@/components/dashboard/tire-prediction-card"
import { EnginePredictionCard } from "@/components/dashboard/engine-prediction-card"
import { SafeOperatingEnvelope } from "@/components/dashboard/safe-operating-envelope"
import { FailureHeatmap } from "@/components/dashboard/failure-heatmap"
import { MaintenanceTimeline } from "@/components/dashboard/maintenance-timeline"
import { TireSimulation } from "@/components/simulation/tire-simulation"
import { NavigationDashboard } from "@/components/maps/navigation-dashboard"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Gauge, AlertTriangle, Clock, Activity, BarChart3, Navigation, MessageSquare } from "lucide-react"

// Sample data for demonstration
const sampleTirePrediction: TireBurstPredictionOutput = {
  burstProbability: 65,
  criticalTemperatureThreshold: 105,
  safeOperatingEnvelope: {
    maxSpeed: 90,
    maxLoad: 800,
    maxTemperature: 90,
    maxDuration: 180,
  },
  maintenanceAlerts: {
    level70: false,
    level85: false,
    level95: false,
  },
}

const sampleEngineFailurePrediction: EngineFailurePredictionOutput = {
  remainingUsefulLife: {
    hours: 1250,
    kilometers: 75000,
  },
  failureProbabilityHeatmap: {
    crankshaft: 25,
    pistons: 40,
    valves: 55,
    bearings: 70,
    camshaft: 30,
    oilSystem: 45,
    coolingSystem: 35,
    fuelSystem: 50,
  },
  maintenancePriorities: [
    {
      component: "Bearings",
      priority: 7,
      recommendedAction: "Schedule bearing replacement within 1000 km",
    },
    {
      component: "Valves",
      priority: 6,
      recommendedAction: "Inspect valves at next service",
    },
    {
      component: "Fuel System",
      priority: 5,
      recommendedAction: "Monitor fuel system condition",
    },
    {
      component: "Oil System",
      priority: 5,
      recommendedAction: "Change oil and filter",
    },
    {
      component: "Pistons",
      priority: 4,
      recommendedAction: "No immediate action required",
    },
  ],
  sparePartsConsumptionForecast: [
    {
      part: "Rod Bearing Set",
      quantity: 2,
      estimatedReplacementDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
    {
      part: "Valve Set",
      quantity: 1,
      estimatedReplacementDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    {
      part: "Fuel Injector Set",
      quantity: 1,
      estimatedReplacementDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    },
    {
      part: "Oil Pump",
      quantity: 1,
      estimatedReplacementDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    },
  ],
}

export default function Dashboard() {
  const [tirePrediction, setTirePrediction] = useState<TireBurstPredictionOutput>(sampleTirePrediction)
  const [enginePrediction, setEnginePrediction] = useState<EngineFailurePredictionOutput>(sampleEngineFailurePrediction)
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update tire prediction with small random variations
      setTirePrediction((prev) => ({
        ...prev,
        burstProbability: Math.min(100, Math.max(0, prev.burstProbability + (Math.random() * 6 - 3))),
        safeOperatingEnvelope: {
          ...prev.safeOperatingEnvelope,
          maxSpeed: Math.max(50, prev.safeOperatingEnvelope.maxSpeed + (Math.random() * 4 - 2)),
          maxLoad: Math.max(400, prev.safeOperatingEnvelope.maxLoad + (Math.random() * 20 - 10)),
        },
        maintenanceAlerts: {
          level70: prev.burstProbability >= 70,
          level85: prev.burstProbability >= 85,
          level95: prev.burstProbability >= 95,
        },
      }))

      // Update engine prediction with small random variations
      setEnginePrediction((prev) => {
        const updatedHeatmap = { ...prev.failureProbabilityHeatmap }

        // Update a random component
        const components = Object.keys(updatedHeatmap)
        const randomComponent = components[Math.floor(Math.random() * components.length)]
        updatedHeatmap[randomComponent] = Math.min(
          100,
          Math.max(0, updatedHeatmap[randomComponent] + (Math.random() * 6 - 3)),
        )

        // Recalculate remaining life based on highest probability
        const highestProb = Math.max(...Object.values(updatedHeatmap))
        const remainingHoursMultiplier = Math.pow(1 - highestProb / 100, 2)
        const remainingHours = 5000 * remainingHoursMultiplier

        return {
          ...prev,
          failureProbabilityHeatmap: updatedHeatmap,
          remainingUsefulLife: {
            hours: remainingHours,
            kilometers: remainingHours * 60,
          },
        }
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleTireAlert = () => {
    setAlertMessage(`TIRE ALERT: Tire burst probability is ${tirePrediction.burstProbability.toFixed(1)}%. 
      Critical temperature threshold: ${tirePrediction.criticalTemperatureThreshold}°C. 
      Reduce speed to below ${tirePrediction.safeOperatingEnvelope.maxSpeed.toFixed(0)} km/h and check tire pressure immediately.`)
    setAlertOpen(true)
  }

  const handleEngineAlert = () => {
    const highestComponent = Object.entries(enginePrediction.failureProbabilityHeatmap).reduce(
      (highest, [component, probability]) => {
        return probability > highest.probability ? { component, probability } : highest
      },
      { component: "", probability: 0 },
    )

    setAlertMessage(`ENGINE ALERT: ${highestComponent.component} failure probability is ${highestComponent.probability.toFixed(1)}%. 
      Estimated remaining useful life: ${Math.round(enginePrediction.remainingUsefulLife.hours)} hours / ${Math.round(enginePrediction.remainingUsefulLife.kilometers)} km. 
      Schedule maintenance as soon as possible.`)
    setAlertOpen(true)
  }

  return (
    <main className="container mx-auto py-6 px-4">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Vehicle Predictive Maintenance</h1>
          <Button variant="destructive" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Simulate Critical Alert
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tire Health</CardTitle>
              <CardDescription>Current Status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Gauge className="h-8 w-8 text-primary" />
                <div className="text-2xl font-bold">{(100 - tirePrediction.burstProbability).toFixed(0)}%</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Engine Health</CardTitle>
              <CardDescription>Current Status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Activity className="h-8 w-8 text-primary" />
                <div className="text-2xl font-bold">
                  {(100 - Math.max(...Object.values(enginePrediction.failureProbabilityHeatmap))).toFixed(0)}%
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Remaining Life</CardTitle>
              <CardDescription>Engine Estimate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Clock className="h-8 w-8 text-primary" />
                <div className="text-2xl font-bold">{Math.round(enginePrediction.remainingUsefulLife.hours)} hrs</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Maintenance Items</CardTitle>
              <CardDescription>High Priority</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <BarChart3 className="h-8 w-8 text-primary" />
                <div className="text-2xl font-bold">
                  {enginePrediction.maintenancePriorities.filter((p) => p.priority >= 5).length}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tire">Tire Analysis</TabsTrigger>
            <TabsTrigger value="engine">Engine Analysis</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="simulation">Simulation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TirePredictionCard prediction={tirePrediction} onAlertClick={handleTireAlert} />
              <EnginePredictionCard prediction={enginePrediction} onAlertClick={handleEngineAlert} />
            </div>

            <MaintenanceTimeline prediction={enginePrediction} />
          </TabsContent>

          <TabsContent value="tire" className="space-y-4 mt-4">
            <TirePredictionCard prediction={tirePrediction} onAlertClick={handleTireAlert} />
            <SafeOperatingEnvelope prediction={tirePrediction} />

            <Card>
              <CardHeader>
                <CardTitle>Tire Analysis Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Heat Accumulation Analysis</h3>
                    <p className="text-gray-600">
                      The Kraus self-heating equations indicate that the tire is operating within
                      {tirePrediction.burstProbability > 70 ? " unsafe" : " safe"} temperature ranges. Current heat
                      accumulation rate suggests monitoring is
                      {tirePrediction.burstProbability > 50 ? " strongly advised." : " recommended."}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Wear Pattern Recognition</h3>
                    <p className="text-gray-600">
                      Analysis of acceleration and strain data shows
                      {tirePrediction.burstProbability > 60 ? " concerning" : " normal"} wear patterns.
                      {tirePrediction.burstProbability > 70
                        ? " Immediate inspection recommended."
                        : tirePrediction.burstProbability > 50
                          ? " Regular inspection advised."
                          : " Continue with standard maintenance schedule."}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Standing Wave Detection</h3>
                    <p className="text-gray-600">
                      Standing wave analysis indicates
                      {tirePrediction.burstProbability > 80
                        ? " critical"
                        : tirePrediction.burstProbability > 60
                          ? " elevated"
                          : " minimal"}{" "}
                      risk. Recommended maximum speed: {tirePrediction.safeOperatingEnvelope.maxSpeed.toFixed(0)} km/h.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Compound Degradation</h3>
                    <p className="text-gray-600">
                      Thermal cycling analysis shows the compound has degraded by approximately
                      {(tirePrediction.burstProbability * 0.7).toFixed(0)}%. Critical temperature threshold:{" "}
                      {tirePrediction.criticalTemperatureThreshold}°C.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engine" className="space-y-4 mt-4">
            <EnginePredictionCard prediction={enginePrediction} onAlertClick={handleEngineAlert} />
            <FailureHeatmap prediction={enginePrediction} />

            <Card>
              <CardHeader>
                <CardTitle>Engine Analysis Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Vibration Analysis</h3>
                    <p className="text-gray-600">
                      Metal fatigue signatures indicate
                      {Math.max(...Object.values(enginePrediction.failureProbabilityHeatmap)) > 70
                        ? " significant"
                        : Math.max(...Object.values(enginePrediction.failureProbabilityHeatmap)) > 50
                          ? " moderate"
                          : " minimal"}{" "}
                      wear. Most affected components:{" "}
                      {Object.entries(enginePrediction.failureProbabilityHeatmap)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 2)
                        .map(([component]) => component)
                        .join(", ")}
                      .
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Oil Analysis</h3>
                    <p className="text-gray-600">
                      Oil degradation metrics show
                      {enginePrediction.failureProbabilityHeatmap.oilSystem > 70
                        ? " critical"
                        : enginePrediction.failureProbabilityHeatmap.oilSystem > 50
                          ? " concerning"
                          : " acceptable"}{" "}
                      levels.
                      {enginePrediction.failureProbabilityHeatmap.oilSystem > 60
                        ? " Oil change recommended."
                        : enginePrediction.failureProbabilityHeatmap.oilSystem > 40
                          ? " Monitor oil condition."
                          : " Continue with standard maintenance schedule."}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Thermal Stress Analysis</h3>
                    <p className="text-gray-600">
                      Thermal stress patterns indicate
                      {enginePrediction.failureProbabilityHeatmap.coolingSystem > 70
                        ? " critical"
                        : enginePrediction.failureProbabilityHeatmap.coolingSystem > 50
                          ? " elevated"
                          : " normal"}{" "}
                      stress levels. Cooling system efficiency:{" "}
                      {(100 - enginePrediction.failureProbabilityHeatmap.coolingSystem).toFixed(0)}%.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Combustion Efficiency</h3>
                    <p className="text-gray-600">
                      Fuel system analysis shows
                      {enginePrediction.failureProbabilityHeatmap.fuelSystem > 70
                        ? " poor"
                        : enginePrediction.failureProbabilityHeatmap.fuelSystem > 50
                          ? " suboptimal"
                          : " good"}{" "}
                      combustion efficiency. Estimated fuel economy impact:{" "}
                      {(enginePrediction.failureProbabilityHeatmap.fuelSystem * 0.2).toFixed(1)}% reduction.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="navigation" className="mt-4">
            <NavigationDashboard />
          </TabsContent>

          <TabsContent value="simulation" className="space-y-4 mt-4">
            <TireSimulation />
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Maintenance Alert</AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Dismiss</AlertDialogCancel>
            <AlertDialogAction>Schedule Service</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}

