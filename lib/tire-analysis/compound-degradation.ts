import type { TireTemperatureData, TireMaterialProperties } from "@/types"

/**
 * Models compound degradation based on thermal cycling
 * @returns A degradation factor between 0-1 (higher means more degradation)
 */
export function modelCompoundDegradation(
  materialProperties: TireMaterialProperties,
  temperatureData: TireTemperatureData[],
): number {
  // Count thermal cycles
  let thermalCycles = 0
  let risingTemperature = false
  const CYCLE_THRESHOLD = 10 // °C

  for (let i = 1; i < temperatureData.length; i++) {
    const tempDiff = temperatureData[i].internal - temperatureData[i - 1].internal

    if (tempDiff > CYCLE_THRESHOLD && !risingTemperature) {
      risingTemperature = true
    } else if (tempDiff < -CYCLE_THRESHOLD && risingTemperature) {
      risingTemperature = false
      thermalCycles++
    }
  }

  // Calculate maximum temperature reached
  const maxTemperature = Math.max(...temperatureData.map((data) => data.internal))

  // Calculate time spent above critical temperature
  // Critical temperature depends on compound type
  let criticalTemp
  switch (materialProperties.compoundType) {
    case "natural_rubber":
      criticalTemp = 80
      break
    case "synthetic_rubber":
      criticalTemp = 100
      break
    case "silica_compound":
      criticalTemp = 120
      break
    default:
      criticalTemp = 90
  }

  const timeAboveCritical = temperatureData.filter((data) => data.internal > criticalTemp).length
  const percentTimeAboveCritical = timeAboveCritical / temperatureData.length

  // Arrhenius relationship for temperature-based degradation
  // Higher temperatures cause exponentially faster degradation
  const temperatureFactor = Math.exp((maxTemperature - criticalTemp) / 20)

  // Calculate compound degradation factor (0-1)
  const degradationFactor = Math.min(
    (thermalCycles / 50) * 0.3 + percentTimeAboveCritical * 0.3 + (temperatureFactor / 10) * 0.4,
    1,
  )

  return degradationFactor
}

