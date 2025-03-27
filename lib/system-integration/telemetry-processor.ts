import type { TelemetryData, SystemIntegrationConfig } from "@/types"
import { predictTireBurst } from "../tire-analysis/tire-burst-prediction"
import { predictEngineFailure } from "../engine-analysis/engine-failure-prediction"

export class TelemetryProcessor {
  private config: SystemIntegrationConfig
  private fleetData: Map<string, TelemetryData[]> = new Map()
  private processingQueue: TelemetryData[] = []
  private isProcessing = false

  constructor(config: SystemIntegrationConfig) {
    this.config = config
  }

  public async processTelemetry(data: TelemetryData): Promise<{
    tirePrediction: ReturnType<typeof predictTireBurst>
    enginePrediction: ReturnType<typeof predictEngineFailure>
    processingTime: number
  }> {
    const startTime = performance.now()

    // Add to processing queue
    this.processingQueue.push(data)

    // Start processing if not already in progress
    if (!this.isProcessing) {
      this.isProcessing = true
      await this.processQueue()
    }

    // Store telemetry data for fleet-wide learning
    if (this.config.adaptiveLearningEnabled) {
      this.storeFleetData(data)
    }

    // Process predictions
    const tirePrediction = predictTireBurst(data.tireData)
    const enginePrediction = predictEngineFailure(data.engineData)

    // Calculate processing time
    const processingTime = performance.now() - startTime

    // Check if processing time exceeds latency threshold
    if (processingTime > this.config.telemetryLatencyThreshold) {
      console.warn(`Telemetry processing exceeded latency threshold: ${processingTime.toFixed(2)}ms`)
    }

    return {
      tirePrediction,
      enginePrediction,
      processingTime,
    }
  }

  private async processQueue(): Promise<void> {
    while (this.processingQueue.length > 0) {
      const batch = this.processingQueue.splice(0, 10) // Process in batches of 10

      // Process batch in parallel
      await Promise.all(
        batch.map(async (data) => {
          // Simulate processing time
          await new Promise((resolve) => setTimeout(resolve, 50))
        }),
      )
    }

    this.isProcessing = false
  }

  private storeFleetData(data: TelemetryData): void {
    const vehicleId = data.vehicleId

    if (!this.fleetData.has(vehicleId)) {
      this.fleetData.set(vehicleId, [])
    }

    const vehicleData = this.fleetData.get(vehicleId)!
    vehicleData.push(data)

    // Limit stored data to last 1000 entries per vehicle
    if (vehicleData.length > 1000) {
      vehicleData.shift()
    }
  }

  public getFleetInsights(): Record<string, any> {
    if (!this.config.adaptiveLearningEnabled || this.fleetData.size === 0) {
      return {}
    }

    // Calculate fleet-wide averages and patterns
    const fleetInsights = {
      averageTireBurstProbability: 0,
      averageEngineRemainingLife: 0,
      commonMaintenanceIssues: [] as string[],
      vehicleCount: this.fleetData.size,
    }

    let totalTireBurstProbability = 0
    let totalEngineRemainingLife = 0
    const maintenanceIssueCounter: Record<string, number> = {}

    // Process each vehicle's latest data
    for (const [_, vehicleData] of this.fleetData.entries()) {
      if (vehicleData.length === 0) continue

      // Get latest data
      const latestData = vehicleData[vehicleData.length - 1]

      // Calculate predictions
      const tirePrediction = predictTireBurst(latestData.tireData)
      const enginePrediction = predictEngineFailure(latestData.engineData)

      // Accumulate values
      totalTireBurstProbability += tirePrediction.burstProbability
      totalEngineRemainingLife += enginePrediction.remainingUsefulLife.hours

      // Count maintenance issues
      for (const priority of enginePrediction.maintenancePriorities) {
        if (priority.priority >= 7) {
          // High priority issues
          const issue = priority.component
          maintenanceIssueCounter[issue] = (maintenanceIssueCounter[issue] || 0) + 1
        }
      }
    }

    // Calculate averages
    fleetInsights.averageTireBurstProbability = totalTireBurstProbability / this.fleetData.size
    fleetInsights.averageEngineRemainingLife = totalEngineRemainingLife / this.fleetData.size

    // Find common maintenance issues
    fleetInsights.commonMaintenanceIssues = Object.entries(maintenanceIssueCounter)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([issue, count]) => `${issue} (${count} vehicles)`)

    return fleetInsights
  }
}

