import type { ThermalStressData } from "@/types"

/**
 * Analyzes thermal stress patterns in the engine
 * @returns A thermal stress score between 0-1 (higher means more stress)
 */
export function analyzeThermalStress(thermalStressData: ThermalStressData[]): number {
  if (thermalStressData.length === 0) {
    return 0
  }

  // Sort data by timestamp
  const sortedData = [...thermalStressData].sort((a, b) => a.timestamp - b.timestamp)
  const latestData = sortedData[sortedData.length - 1]

  // Calculate cold start impact
  // More cold starts create more thermal stress
  const coldStartFactor = Math.min(latestData.coldStartCount / 1000, 1)

  // Calculate operating temperature impact
  // Higher operating temperatures create more thermal stress
  // Assuming 90°C is normal and 120°C is critical
  const tempFactor = Math.max(0, (latestData.operatingTemperature - 90) / 30)

  // Calculate thermal cycle impact
  // More thermal cycles create more thermal stress
  const cycleFactor = Math.min(latestData.thermalCycleCount / 5000, 1)

  // Calculate thermal stress score
  const thermalStressScore = 0.3 * coldStartFactor + 0.4 * tempFactor + 0.3 * cycleFactor

  return Math.min(thermalStressScore, 1)
}

