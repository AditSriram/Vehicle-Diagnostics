import { type NextRequest, NextResponse } from "next/server"
import type { TireBurstPredictionInput } from "@/types"
import { predictTireBurst } from "@/lib/tire-analysis/tire-burst-prediction"

export async function POST(request: NextRequest) {
  try {
    const data: TireBurstPredictionInput = await request.json()

    // Validate input data
    if (!data.materialProperties || !data.temperatureData || !data.speedDurationMatrix) {
      return NextResponse.json({ error: "Missing required input parameters" }, { status: 400 })
    }

    // Process prediction
    const prediction = predictTireBurst(data)

    return NextResponse.json(prediction)
  } catch (error) {
    console.error("Error processing tire burst prediction:", error)
    return NextResponse.json({ error: "Failed to process prediction" }, { status: 500 })
  }
}

