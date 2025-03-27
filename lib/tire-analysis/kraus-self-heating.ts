import type { TireTemperatureData, SpeedDurationMatrix, TireMaterialProperties } from "@/types"

/**
 * Implements the Kraus self-heating equations for tire temperature prediction
 * Based on the work of A.R. Kraus on rubber compound heat generation
 */
export function calculateSelfHeating(
  materialProperties: TireMaterialProperties,
  temperatureData: TireTemperatureData[],
  speedDurationMatrix: SpeedDurationMatrix[],
): number {
  // Constants for Kraus equation
  const KRAUS_CONSTANT = 0.4
  const POWER_FACTOR = 1.8

  // Calculate average speed and duration
  const avgSpeed = speedDurationMatrix.reduce((sum, data) => sum + data.speed, 0) / speedDurationMatrix.length
  const totalDuration = speedDurationMatrix.reduce((sum, data) => sum + data.duration, 0)

  // Get latest temperature readings
  const latestTemp = temperatureData[temperatureData.length - 1]

  // Calculate heat generation rate using Kraus equation
  // Q = K * (E" * ε² * ω * V)
  // Where:
  // - K is the Kraus constant
  // - E" is the loss modulus (derived from hardness)
  // - ε is the strain amplitude (derived from speed)
  // - ω is the frequency (derived from speed)
  // - V is the volume (constant for this implementation)

  const lossModulus = materialProperties.hardness * 0.15 // Approximation
  const strainAmplitude = avgSpeed / 100 // Approximation
  const frequency = avgSpeed / 20 // Approximation

  const heatGenerationRate = KRAUS_CONSTANT * lossModulus * Math.pow(strainAmplitude, POWER_FACTOR) * frequency

  // Calculate temperature rise based on heat generation, thermal conductivity, and heat capacity
  const temperatureRise =
    (heatGenerationRate * totalDuration) / (materialProperties.thermalConductivity * materialProperties.heatCapacity)

  // Predict final temperature
  const predictedTemperature = latestTemp.internal + temperatureRise

  return predictedTemperature
}

