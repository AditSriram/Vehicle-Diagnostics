import type { BearingWearData } from "@/types"

/**
 * Analyzes bearing wear acoustic profiles
 * @returns A bearing wear score between 0-1 (higher means more wear)
 */
export function analyzeBearingWear(bearingData: BearingWearData[]): Record<string, number> {
  // Define frequency ranges for different bearing types
  const bearingTypes = {
    mainBearing: [1000, 2000],
    rodBearing: [2000, 3000],
    camshaftBearing: [3000, 4000],
    auxiliaryBearing: [4000, 5000],
  }

  // Calculate wear scores for each bearing type
  const wearScores: Record<string, number> = {}

  for (const [bearingType, [minFreq, maxFreq]] of Object.entries(bearingTypes)) {
    // Filter data in the bearing's frequency range
    const relevantData = bearingData.filter((data) => data.frequency >= minFreq && data.frequency <= maxFreq)

    if (relevantData.length === 0) {
      wearScores[bearingType] = 0
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

    // Analyze acoustic profile patterns
    const acousticPatterns = relevantData.map((data) => {
      // Analyze frequency distribution in the acoustic profile
      const profile = data.acousticProfile
      const peakFrequency = profile.indexOf(Math.max(...profile))
      const peakRatio = profile[peakFrequency] / profile.reduce((sum, val) => sum + val, 0)

      return {
        peakFrequency,
        peakRatio,
        harmonics: profile.filter((val, idx) => val > profile[peakFrequency] * 0.5 && idx !== peakFrequency).length,
      }
    })

    // Calculate pattern-based wear indicator
    const patternScore =
      acousticPatterns.reduce((sum, pattern) => {
        // More harmonics and higher peak ratios indicate more wear
        return sum + pattern.harmonics * 0.1 + pattern.peakRatio * 0.5
      }, 0) / acousticPatterns.length

    // Calculate overall bearing wear score
    const normalizedAmplitude = Math.min(avgAmplitude / 5, 1)
    const normalizedTrend = Math.min(Math.max(amplitudeTrend, 0) / 0.2, 1)
    const normalizedPattern = Math.min(patternScore, 1)

    wearScores[bearingType] = 0.4 * normalizedAmplitude + 0.3 * normalizedTrend + 0.3 * normalizedPattern
  }

  return wearScores
}

