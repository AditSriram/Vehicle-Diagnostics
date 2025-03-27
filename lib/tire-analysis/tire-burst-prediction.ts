import type { TireBurstPredictionInput, TireBurstPredictionOutput } from "@/types"
import { calculateSelfHeating } from "./kraus-self-heating"
import { analyzeWearPattern } from "./wear-pattern-recognition"
import { detectStandingWaves } from "./standing-wave-detection"
import { modelCompoundDegradation } from "./compound-degradation"

export function predictTireBurst(input: TireBurstPredictionInput): TireBurstPredictionOutput {
  // Calculate heat accumulation using Kraus equations
  const predictedTemperature = calculateSelfHeating(
    input.materialProperties,
    input.temperatureData,
    input.speedDurationMatrix,
  )

  // Analyze wear patterns
  const wearPatternScore = analyzeWearPattern(input.loadDistribution, input.speedDurationMatrix)

  // Detect standing waves
  const standingWaveRisk = detectStandingWaves(
    input.materialProperties,
    input.temperatureData,
    input.speedDurationMatrix,
  )

  // Model compound degradation
  const degradationFactor = modelCompoundDegradation(input.materialProperties, input.temperatureData)

  // Calculate air pressure risk
  const latestPressure = input.airPressureData[input.airPressureData.length - 1]
  const pressureRisk = Math.max(0, 1 - latestPressure.pressure / 220) // Assuming 220 kPa is optimal

  // Calculate road surface risk
  const avgRoadTemp =
    input.roadSurfaceData.reduce((sum, data) => sum + data.temperature, 0) / input.roadSurfaceData.length
  const roadTempRisk = Math.min(avgRoadTemp / 80, 1) // Normalized to 0-1

  // Calculate proximity heat risk
  const maxProximityTemp = Math.max(
    ...input.proximityHeatSources.map((source) => source.temperature * (1 / (source.distance / 100))),
  )
  const proximityHeatRisk = Math.min(maxProximityTemp / 200, 1) // Normalized to 0-1

  // Calculate burst probability (0-100%)
  const burstProbability = Math.min(
    wearPatternScore * 20 +
      standingWaveRisk * 25 +
      degradationFactor * 25 +
      pressureRisk * 15 +
      roadTempRisk * 5 +
      proximityHeatRisk * 10,
    100,
  )

  // Determine critical temperature threshold based on compound type
  let criticalTemperatureThreshold
  switch (input.materialProperties.compoundType) {
    case "natural_rubber":
      criticalTemperatureThreshold = 85
      break
    case "synthetic_rubber":
      criticalTemperatureThreshold = 105
      break
    case "silica_compound":
      criticalTemperatureThreshold = 125
      break
    default:
      criticalTemperatureThreshold = 95
  }

  // Calculate safe operating envelope
  const safeOperatingEnvelope = {
    maxSpeed: 120 - burstProbability * 0.8, // km/h
    maxLoad: 1000 - burstProbability * 5, // kg
    maxTemperature: criticalTemperatureThreshold - 15, // °C
    maxDuration: 240 - burstProbability * 2, // minutes
  }

  // Set maintenance alerts
  const maintenanceAlerts = {
    level70: burstProbability >= 70,
    level85: burstProbability >= 85,
    level95: burstProbability >= 95,
  }

  return {
    burstProbability,
    criticalTemperatureThreshold,
    safeOperatingEnvelope,
    maintenanceAlerts,
  }
}

