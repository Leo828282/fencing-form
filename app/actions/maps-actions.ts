"use server"

export interface DistanceResult {
  distance: number
  fee: number
  error?: string
  usingFallback?: boolean
}

export async function calculateDistance(customerAddress: string): Promise<DistanceResult> {
  if (!customerAddress.trim()) {
    return {
      distance: 0,
      fee: 0,
      error: "Please enter a delivery address",
      usingFallback: true,
    }
  }

  try {
    // Use our server-side API endpoint
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const response = await fetch(`${appUrl}/api/places/distance?destination=${encodeURIComponent(customerAddress)}`, {
      cache: "no-store",
    })

    const result = await response.json()

    return {
      distance: result.distance,
      fee: result.fee,
      usingFallback: result.usingFallback,
    }
  } catch (error) {
    console.error("Error calculating distance:", error)
    return {
      distance: 0,
      fee: 0,
      error: "Failed to calculate distance",
      usingFallback: true,
    }
  }
}
