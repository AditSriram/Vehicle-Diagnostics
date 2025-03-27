import type { LoadDistribution, SpeedDurationMatrix } from "@/types"

/**
 * Analyzes load distribution and speed data to recognize wear patterns
 * @returns A wear pattern score between 0-1 (higher means more wear)
 */
export function analyzeWearPattern(
  loadDistribution: LoadDistribution[],
  speedDurationMatrix: SpeedDurationMatrix[],
): number {
  // Calculate load imbalance
  const avgLoadImbalance =
    loadDistribution.reduce((sum, data) => {
      const frontImbalance = Math.abs(data.frontLeft - data.frontRight)
      const rearImbalance = Math.abs(data.rearLeft - data.rearRight)
      const sideImbalance = Math.abs(data.frontLeft + data.rearLeft - (data.frontRight + data.rearRight))

      return sum + (frontImbalance + rearImbalance + sideImbalance) / 3
    }, 0) / loadDistribution.length

  // Calculate acceleration patterns
  const accelerationEvents = []
  for (let i = 1; i < speedDurationMatrix.length; i++) {
    const prevSpeed = speedDurationMatrix[i - 1].speed
    const currSpeed = speedDurationMatrix[i].speed
    const timeDiff = (speedDurationMatrix[i].timestamp - speedDurationMatrix[i - 1].timestamp) / 60000 // in minutes

    if (timeDiff > 0) {
      const acceleration = (currSpeed - prevSpeed) / timeDiff
      accelerationEvents.push(Math.abs(acceleration))
    }
  }

  const avgAcceleration =
    accelerationEvents.length > 0
      ? accelerationEvents.reduce((sum, acc) => sum + acc, 0) / accelerationEvents.length
      : 0

  // Normalize and combine factors
  const normalizedImbalance = Math.min(avgLoadImbalance / 500, 1)
  const normalizedAcceleration = Math.min(avgAcceleration / 20, 1)

  // Calculate wear pattern score (0-1)
  const wearPatternScore = 0.6 * normalizedImbalance + 0.4 * normalizedAcceleration

  return wearPatternScore
}

