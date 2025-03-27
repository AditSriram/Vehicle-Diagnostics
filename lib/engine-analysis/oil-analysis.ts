import type { OilDegradationData } from "@/types"

/**
 * Analyzes oil degradation data to assess engine health
 * @returns An oil health score between 0-1 (higher means worse condition)
 */
export function analyzeOilDegradation(oilDegradationData: OilDegradationData[]): number {
  if (oilDegradationData.length === 0) {
    return 0
  }

  // Sort data by timestamp
  const sortedData = [...oilDegradationData].sort((a, b) => a.timestamp - b.timestamp)
  const latestData = sortedData[sortedData.length - 1]

  // Calculate viscosity deviation from optimal
  // Assuming optimal viscosity is 10
  const viscosityDeviation = Math.abs(latestData.viscosity - 10) / 10

  // Normalize contamination (ppm)
  // Assuming 5000 ppm is critical
  const normalizedContamination = Math.min(latestData.contamination / 5000, 1)

  // Normalize acidity
  // Optimal pH is 7, lower is more acidic and worse
  const acidityFactor = Math.max(0, (7 - latestData.acidityLevel) / 7)

  // Calculate degradation rate over time
  let degradationRate = 0

  if (sortedData.length > 1) {
    const firstData = sortedData[0]
    const timeSpan = (latestData.timestamp - firstData.timestamp) / (1000 * 60 * 60 * 24) // in days

    if (timeSpan > 0) {
      const contaminationRate = (latestData.contamination - firstData.contamination) / timeSpan
      const viscosityRate = Math.abs(latestData.viscosity - firstData.viscosity) / timeSpan
      const acidityRate = Math.abs(latestData.acidityLevel - firstData.acidityLevel) / timeSpan

      // Normalize rates
      const normalizedContRate = Math.min(contaminationRate / 100, 1)
      const normalizedViscRate = Math.min(viscosityRate / 0.5, 1)
      const normalizedAcidRate = Math.min(acidityRate / 0.1, 1)

      degradationRate = (normalizedContRate + normalizedViscRate + normalizedAcidRate) / 3
    }
  }

  // Calculate overall oil health score
  const oilHealthScore =
    0.3 * viscosityDeviation + 0.3 * normalizedContamination + 0.2 * acidityFactor + 0.2 * degradationRate

  return Math.min(oilHealthScore, 1)
}

