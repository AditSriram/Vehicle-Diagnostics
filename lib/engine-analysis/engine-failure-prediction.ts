import type { EngineFailurePredictionInput, EngineFailurePredictionOutput } from "@/types"
import { analyzeMetalFatigue } from "./vibration-analysis"
import { analyzeOilDegradation } from "./oil-analysis"
import { analyzeThermalStress } from "./thermal-stress-analysis"
import { analyzeCombustionEfficiency } from "./combustion-analysis"
import { analyzeBearingWear } from "./bearing-analysis"

export function predictEngineFailure(input: EngineFailurePredictionInput): EngineFailurePredictionOutput {
  // Analyze metal fatigue from vibration data
  const metalFatigueScores = analyzeMetalFatigue(input.metalFatigueData)

  // Analyze oil degradation
  const oilHealthScore = analyzeOilDegradation(input.oilDegradationData)

  // Analyze thermal stress
  const thermalStressScore = analyzeThermalStress(input.thermalStressData)

  // Analyze combustion efficiency
  const combustionEfficiencyScore = analyzeCombustionEfficiency(input.combustionEfficiencyData)

  // Analyze bearing wear
  const bearingWearScores = analyzeBearingWear(input.bearingWearData)

  // Calculate failure probability for each component
  const failureProbabilityHeatmap: Record<string, number> = {
    ...metalFatigueScores,
    ...bearingWearScores,
    oilSystem: oilHealthScore * 100,
    coolingSystem: thermalStressScore * 100,
    fuelSystem: combustionEfficiencyScore * 100,
  }

  // Calculate overall engine health
  const overallHealth =
    1 -
    Object.values(failureProbabilityHeatmap).reduce((sum, score) => sum + score, 0) /
      Object.values(failureProbabilityHeatmap).length /
      100

  // Calculate remaining useful life
  // Based on overall health and component-specific health
  const baseRemainingHours = 5000 // Base value for a healthy engine
  const remainingHoursMultiplier = Math.pow(overallHealth, 2) // Exponential decline as health decreases
  const remainingHours = baseRemainingHours * remainingHoursMultiplier

  // Convert hours to kilometers (assuming average speed of 60 km/h)
  const remainingKilometers = remainingHours * 60

  // Generate maintenance priorities
  const maintenancePriorities = Object.entries(failureProbabilityHeatmap)
    .map(([component, probability]) => ({
      component,
      priority: Math.ceil(probability / 10), // Convert to 1-10 scale
      recommendedAction: getRecommendedAction(component, probability),
    }))
    .sort((a, b) => b.priority - a.priority)

  // Generate spare parts consumption forecast
  const sparePartsConsumptionForecast = generateSparePartsForecast(failureProbabilityHeatmap, remainingHours)

  return {
    remainingUsefulLife: {
      hours: remainingHours,
      kilometers: remainingKilometers,
    },
    failureProbabilityHeatmap,
    maintenancePriorities,
    sparePartsConsumptionForecast,
  }
}

function getRecommendedAction(component: string, probability: number): string {
  if (probability >= 90) {
    return `Immediate replacement of ${component} required`
  } else if (probability >= 70) {
    return `Schedule ${component} replacement within 1000 km`
  } else if (probability >= 50) {
    return `Inspect ${component} at next service`
  } else if (probability >= 30) {
    return `Monitor ${component} condition`
  } else {
    return `No action required for ${component}`
  }
}

function generateSparePartsForecast(
  failureProbabilityHeatmap: Record<string, number>,
  remainingHours: number,
): Array<{ part: string; quantity: number; estimatedReplacementDate: Date }> {
  const forecast = []
  const now = new Date()

  for (const [component, probability] of Object.entries(failureProbabilityHeatmap)) {
    if (probability >= 30) {
      // Calculate time to replacement based on probability
      // Higher probability means sooner replacement
      const hoursToReplacement = remainingHours * (1 - probability / 100)
      const daysToReplacement = hoursToReplacement / 24

      const replacementDate = new Date(now)
      replacementDate.setDate(replacementDate.getDate() + Math.round(daysToReplacement))

      // Determine quantity based on component type
      let quantity = 1
      if (component.includes("bearing")) {
        quantity = 2 // Bearings often replaced in pairs
      } else if (component === "pistons") {
        quantity = 4 // Assuming 4-cylinder engine
      }

      forecast.push({
        part: componentToSparePart(component),
        quantity,
        estimatedReplacementDate: replacementDate,
      })
    }
  }

  return forecast.sort((a, b) => a.estimatedReplacementDate.getTime() - b.estimatedReplacementDate.getTime())
}

function componentToSparePart(component: string): string {
  const partMapping: Record<string, string> = {
    crankshaft: "Crankshaft Assembly",
    pistons: "Piston Set",
    valves: "Valve Set",
    camshaft: "Camshaft",
    mainBearing: "Main Bearing Set",
    rodBearing: "Rod Bearing Set",
    camshaftBearing: "Camshaft Bearing Set",
    auxiliaryBearing: "Auxiliary Bearing Set",
    oilSystem: "Oil Pump",
    coolingSystem: "Water Pump",
    fuelSystem: "Fuel Injector Set",
  }

  return partMapping[component] || `${component} Replacement Part`
}

