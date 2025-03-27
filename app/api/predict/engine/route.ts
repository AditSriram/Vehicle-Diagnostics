import { type NextRequest, NextResponse } from "next/server"
import type { EngineFailurePredictionInput } from "@/types"
import { predictEngineFailure } from "@/lib/engine-analysis/engine-failure-prediction"

export async function POST(request: NextRequest) {
  try {
    const data: EngineFailurePredictionInput = await request.json()

    // Validate input data
    if (!data.metalFatigueData || !data.oilDegradationData || !data.thermalStressData) {
      return NextResponse.json({ error: "Missing required input parameters" }, { status: 400 })
    }

    // Process prediction
    const prediction = predictEngineFailure(data)

    return NextResponse.json(prediction)
  } catch (error) {
    console.error("Error processing engine failure prediction:", error)
    return NextResponse.json({ error: "Failed to process prediction" }, { status: 500 })
  }
}

