"use server"

import { Client } from "@googlemaps/google-maps-services-js"
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

// Create a Google Maps client
const client = new Client({})

// Get place predictions for autocomplete
export async function getPlacePredictions(input: string) {
  const MAPS_API_KEY = getApiKey()

  if (!MAPS_API_KEY) {
    console.error("Google Maps API key is not configured")
    return []
  }

  try {
    const response = await client.placeAutocomplete({
      params: {
        input,
        key: MAPS_API_KEY,
        components: ["country:au"],
      },
    })

    return response.data.predictions
  } catch (error) {
    console.error("Error fetching place predictions:", error)
    return []
  }
}

// Get place details
export async function getPlaceDetails(placeId: string) {
  const MAPS_API_KEY = getApiKey()

  if (!MAPS_API_KEY) {
    console.error("Google Maps API key is not configured")
    return null
  }

  try {
    const response = await client.placeDetails({
      params: {
        place_id: placeId,
        key: MAPS_API_KEY,
      },
    })

    return {
      formatted_address: response.data.result.formatted_address,
      geometry: response.data.result.geometry,
    }
  } catch (error) {
    console.error("Error fetching place details:", error)
    return null
  }
}

// Calculate distance between two addresses
export async function calculateDistance(destinationAddress: string) {
  const MAPS_API_KEY = getApiKey()

  if (!MAPS_API_KEY) {
    console.error("Google Maps API key is not configured")
    return simulateDistanceCalculation(destinationAddress)
  }

  try {
    // Geocode the origin address
    const originGeocode = await client.geocode({
      params: {
        address: COMPANY_ADDRESS,
        key: MAPS_API_KEY,
      },
    })

    if (!originGeocode.data.results.length) {
      return { distance: 0, fee: 0, error: "Origin address not found", usingFallback: true }
    }

    // Geocode the destination address
    const destinationGeocode = await client.geocode({
      params: {
        address: destinationAddress,
        key: MAPS_API_KEY,
      },
    })

    if (!destinationGeocode.data.results.length) {
      return { distance: 0, fee: 0, error: "Destination address not found", usingFallback: true }
    }

    // Get the coordinates
    const origin = originGeocode.data.results[0].geometry.location
    const destination = destinationGeocode.data.results[0].geometry.location

    // Calculate distance using Distance Matrix API
    const distanceMatrix = await client.distancematrix({
      params: {
        origins: [`${origin.lat},${origin.lng}`],
        destinations: [`${destination.lat},${destination.lng}`],
        key: MAPS_API_KEY,
      },
    })

    // Extract the distance value
    const distanceValue = distanceMatrix.data.rows[0].elements[0].distance.value
    const distanceInKm = distanceValue / 1000

    // Calculate delivery fee
    let fee = BASE_FEE
    if (distanceInKm > BASE_DISTANCE) {
      fee += (distanceInKm - BASE_DISTANCE) * ADDITIONAL_KM_RATE
    }

    return { distance: distanceInKm, fee, error: null, usingFallback: false }
  } catch (error) {
    console.error("Error calculating distance:", error)
    return simulateDistanceCalculation(destinationAddress)
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

  return {
    distance: simulatedDistance,
    fee,
    usingFallback: true,
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
