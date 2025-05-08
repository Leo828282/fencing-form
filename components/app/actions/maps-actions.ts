"use server"

// Constants for delivery fee calculation
const BASE_FEE = 100
const BASE_DISTANCE = 50 // km
const ADDITIONAL_KM_RATE = 2 // $ per km

// Company address (starting point)
const COMPANY_ADDRESS = "21C Richmond Rd, Homebush NSW 2140"

// Google Maps API key from environment variables (now safely used server-side only)
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || ""

type DistanceResult = {
  distance: number
  fee: number
  error?: string
  usingFallback: boolean
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
    // If no API key is available, use fallback
    if (!GOOGLE_MAPS_API_KEY) {
      return simulateDistanceCalculation(customerAddress)
    }

    // Use Google Maps Distance Matrix API
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
      COMPANY_ADDRESS,
    )}&destinations=${encodeURIComponent(customerAddress)}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== "OK") {
      console.error("Google Maps API error:", data.status)
      return simulateDistanceCalculation(customerAddress)
    }

    const element = data.rows[0].elements[0]

    if (element.status !== "OK") {
      console.error("Route calculation error:", element.status)
      return simulateDistanceCalculation(customerAddress)
    }

    // Convert meters to kilometers
    const distanceInKm = element.distance.value / 1000
    const fee = calculateDeliveryFee(distanceInKm)

    return {
      distance: distanceInKm,
      fee,
      usingFallback: false,
    }
  } catch (error) {
    console.error("Error calculating distance:", error)
    return simulateDistanceCalculation(customerAddress)
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
async function simulateDistanceCalculation(customerAddress: string): Promise<DistanceResult> {
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

  return {
    distance: simulatedDistance,
    fee,
    usingFallback: true,
  }
}
