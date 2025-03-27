import type { SpeedDurationMatrix, TireTemperatureData, TireMaterialProperties } from "@/types"

/**
 * Detects standing waves in tires based on speed and material properties
 * Standing waves occur when the tire's rotational frequency matches its natural frequency
 * @returns A standing wave risk score between 0-1
 */
export function detectStandingWaves(
  materialProperties: TireMaterialProperties,
  temperatureData: TireTemperatureData[],
  speedDurationMatrix: SpeedDurationMatrix[],
): number {
  // Calculate critical speed for standing wave formation
  // Based on tire material properties and temperature

  // Estimate tire natural frequency based on material hardness
  // Harder compounds have higher natural frequencies
  const naturalFrequency = 10 + materialProperties.hardness * 0.5 // Hz

  // Calculate critical speed where standing waves form
  // Critical speed (km/h) = natural frequency (Hz) * tire circumference (m) * 3.6
  // Assuming average tire circumference of 2m
  const criticalSpeed = naturalFrequency * 2 * 3.6 // km/h

  // Check how long the tire has been operating near critical speed
  let timeNearCriticalSpeed = 0

  for (const speedData of speedDurationMatrix) {
    // If speed is within 10% of critical speed, count the duration
    if (Math.abs(speedData.speed - criticalSpeed) / criticalSpeed < 0.1) {
      timeNearCriticalSpeed += speedData.duration
    }
  }

  // Get average temperature
  const avgTemperature = temperatureData.reduce((sum, data) => sum + data.internal, 0) / temperatureData.length

  // Temperature factor - standing waves are more likely at higher temperatures
  const temperatureFactor = Math.min(avgTemperature / 100, 1)

  // Calculate standing wave risk (0-1)
  // Based on time spent near critical speed and temperature
  const standingWaveRisk = Math.min((timeNearCriticalSpeed / 60) * 0.7 + temperatureFactor * 0.3, 1)

  return standingWaveRisk
}

