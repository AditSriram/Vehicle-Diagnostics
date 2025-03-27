import type { MetalFatigueData } from "@/types"

/**
 * Analyzes vibration signatures to detect metal fatigue
 * @returns A fatigue score between 0-1 (higher means more fatigue)
 */
export function analyzeMetalFatigue(metalFatigueData: MetalFatigueData[]): Record<string, number> {
  // Define frequency ranges for different components
  const componentFrequencyRanges = {
    crankshaft: [20, 100],
    pistons: [100, 500],
    valves: [500, 2000],
    bearings: [2000, 5000],
    camshaft: [50, 200],
  }

  // Calculate fatigue scores for each component
  const fatigueScores: Record<string, number> = {}

  for (const [component, [minFreq, maxFreq]] of Object.entries(componentFrequencyRanges)) {
    // Filter vibration data in the component's frequency range
    const relevantData = metalFatigueData.filter((data) => data.frequency >= minFreq && data.frequency <= maxFreq)

    if (relevantData.length === 0) {
      fatigueScores[component] = 0
      continue
    }

    // Calculate average amplitude in the frequency range
    const avgAmplitude = relevantData.reduce((sum, data) => sum + data.amplitude, 0) / relevantData.length

    // Calculate trend over time
    const sortedData = [...relevantData].sort((a, b) => a.timestamp - b.timestamp)
    let amplitudeTrend = 0

    if (sortedData.length > 1) {
      const firstAmplitude = sortedData[0].amplitude
      const lastAmplitude = sortedData[sortedData.length - 1].amplitude
      const timeSpan = (sortedData[sortedData.length - 1].timestamp - sortedData[0].timestamp) / (1000 * 60 * 60 * 24) // in days

      if (timeSpan > 0) {
        amplitudeTrend = (lastAmplitude - firstAmplitude) / timeSpan
      }
    }

    // Calculate fatigue score based on amplitude and trend
    // Normalize to 0-1 range
    const normalizedAmplitude = Math.min(avgAmplitude / 10, 1)
    const normalizedTrend = Math.min(Math.max(amplitudeTrend, 0) / 0.5, 1)

    fatigueScores[component] = 0.7 * normalizedAmplitude + 0.3 * normalizedTrend
  }

  return fatigueScores
}

