import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// Company address (starting point)
const COMPANY_ADDRESS = "21C Richmond Rd, Homebush NSW 2140"

// Constants for delivery fee calculation
const BASE_FEE = 100
const BASE_DISTANCE = 50 // km
const ADDITIONAL_KM_RATE = 2 // $ per km

// Get API key from cookies or environment variables
function getApiKey(): string {
  // Try to get from cookies first (set by IframeHandler)
  const cookieStore = cookies()
  const apiKey = cookieStore.get("maps_api_key")?.value

  // Fall back to environment variable
  return apiKey || process.env.GOOGLE_MAPS_API_KEY || ""
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const destination = searchParams.get("destination")

  if (!destination) {
    return NextResponse.json({ error: "Destination parameter is required" }, { status: 400 })
  }

  const apiKey = getApiKey()

  if (!apiKey) {
    console.error("Google Maps API key is not configured")
    return simulateDistanceCalculation(destination)
  }

  try {
    // Use Distance Matrix API
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(COMPANY_ADDRESS)}&destinations=${encodeURIComponent(destination)}&mode=driving&key=${apiKey}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== "OK") {
      console.error("Google Maps API error:", data.status)
      return simulateDistanceCalculation(destination)
    }

    const element = data.rows[0].elements[0]

    if (element.status !== "OK") {
      console.error("Route calculation error:", element.status)
      return simulateDistanceCalculation(destination)
    }

    // Convert meters to kilometers
    const distanceInKm = element.distance.value / 1000
    const fee = calculateDeliveryFee(distanceInKm)

    return NextResponse.json({
      distance: distanceInKm,
      fee,
      usingFallback: false,
    })
  } catch (error) {
    console.error("Error calculating distance:", error)
    return simulateDistanceCalculation(destination)
  }
}

// Calculate delivery fee based on distance
function calculateDeliveryFee(distanceInKm: number): number {
  if (distanceInKm <= BASE_DISTANCE) {
    return BASE_FEE
  } else {
    const additionalKm = distanceInKm - BASE_DISTANCE
    return BASE_FEE + additionalKm * ADDITIONAL_KM_RATE
  }
}

// Fallback simulation for when Google Maps API is not available
async function simulateDistanceCalculation(customerAddress: string) {
  // Generate a more realistic distance based on the address
  let simulatedDistance = 0
  const address = customerAddress.toLowerCase()

  // Sydney metro area suburbs
  const closeSuburbs = ["homebush", "strathfield", "concord", "burwood", "auburn", "lidcombe"]
  const midSuburbs = ["sydney", "parramatta", "chatswood", "ryde", "epping", "ashfield"]
  const farSuburbs = ["penrith", "campbelltown", "hornsby", "cronulla", "manly", "richmond"]

  if (closeSuburbs.some((suburb) => address.includes(suburb))) {
    simulatedDistance = 5 + Math.random() * 10 // 5-15km
  } else if (midSuburbs.some((suburb) => address.includes(suburb))) {
    simulatedDistance = 15 + Math.random() * 15 // 15-30km
  } else if (farSuburbs.some((suburb) => address.includes(suburb))) {
    simulatedDistance = 30 + Math.random() * 30 // 30-60km
  } else if (address.includes("nsw") || address.includes("new south wales")) {
    simulatedDistance = 20 + Math.random() * 80 // 20-100km for general NSW addresses
  } else {
    // Default fallback - generate a random distance between 10 and 100km
    simulatedDistance = 10 + Math.random() * 90
  }

  // Round to 1 decimal place
  simulatedDistance = Math.round(simulatedDistance * 10) / 10
  const fee = calculateDeliveryFee(simulatedDistance)

  return NextResponse.json({
    distance: simulatedDistance,
    fee,
    usingFallback: true,
  })
}
