import { type NextRequest, NextResponse } from "next/server"
import type { TelemetryData, SystemIntegrationConfig } from "@/types"
import { TelemetryProcessor } from "@/lib/system-integration/telemetry-processor"
import { AlertSystem } from "@/lib/system-integration/alert-system"
import { OEMIntegration } from "@/lib/system-integration/oem-integration"

// Initialize system components
const systemConfig: SystemIntegrationConfig = {
  telemetryLatencyThreshold: 200, // ms
  adaptiveLearningEnabled: true,
  alertConfig: {
    visual: true,
    audio: true,
    haptic: true,
    threshold: 70, // %
  },
  oem: {
    protocol: "HTTPS",
    version: "1.0",
    endpoint: "https://api.example-oem.com/diagnostics",
  },
}

const telemetryProcessor = new TelemetryProcessor(systemConfig)
const alertSystem = new AlertSystem(systemConfig.alertConfig)
const oemIntegration = new OEMIntegration(systemConfig)

export async function POST(request: NextRequest) {
  try {
    const data: TelemetryData = await request.json()

    // Validate input data
    if (!data.vehicleId || !data.timestamp || !data.tireData || !data.engineData) {
      return NextResponse.json({ error: "Missing required telemetry data" }, { status: 400 })
    }

    // Process telemetry data
    const result = await telemetryProcessor.processTelemetry(data)

    // Check for alerts
    if (result.tirePrediction.burstProbability >= systemConfig.alertConfig.threshold) {
      alertSystem.triggerAlert(
        "tire",
        result.tirePrediction.burstProbability,
        `Tire burst probability: ${result.tirePrediction.burstProbability.toFixed(1)}%`,
      )
    }

    const engineFailureProbability = Object.values(result.enginePrediction.failureProbabilityHeatmap).reduce(
      (max, prob) => Math.max(max, prob),
      0,
    )

    if (engineFailureProbability >= systemConfig.alertConfig.threshold) {
      alertSystem.triggerAlert(
        "engine",
        engineFailureProbability,
        `Engine failure probability: ${engineFailureProbability.toFixed(1)}%`,
      )
    }

    // Send diagnostic data to OEM
    await oemIntegration.sendDiagnosticData(data.vehicleId, {
      timestamp: data.timestamp,
      tirePrediction: result.tirePrediction,
      enginePrediction: result.enginePrediction,
    })

    return NextResponse.json({
      processingTime: result.processingTime,
      tirePrediction: result.tirePrediction,
      enginePrediction: result.enginePrediction,
    })
  } catch (error) {
    console.error("Error processing telemetry data:", error)
    return NextResponse.json({ error: "Failed to process telemetry data" }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Get fleet-wide insights
    const fleetInsights = telemetryProcessor.getFleetInsights()

    return NextResponse.json(fleetInsights)
  } catch (error) {
    console.error("Error retrieving fleet insights:", error)
    return NextResponse.json({ error: "Failed to retrieve fleet insights" }, { status: 500 })
  }
}

