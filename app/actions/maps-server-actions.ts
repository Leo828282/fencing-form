"use server"

import { Client } from "@googlemaps/google-maps-services-js"

// Create a Google Maps client
const client = new Client({})

// Company address (starting point)
const COMPANY_ADDRESS = "21C Richmond Rd, Homebush NSW 2140"

// Constants for delivery fee calculation
const BASE_FEE = 100
const BASE_DISTANCE = 50 // km
const ADDITIONAL_KM_RATE = 2 // $ per km

// Get place predictions for autocomplete
export async function getPlacePredictions(input: string) {
  try {
    const response = await client.placeAutocomplete({
      params: {
        input,
        key: process.env.GOOGLE_MAPS_API_KEY!,
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
  try {
    const response = await client.placeDetails({
      params: {
        place_id: placeId,
        key: process.env.GOOGLE_MAPS_API_KEY!,
      },
    })

    return response.data
  } catch (error) {
    console.error("Error fetching place details:", error)
    return { result: null, error: "Failed to fetch place details" }
  }
}

// Calculate distance between two addresses
export async function calculateDistance(destinationAddress: string) {
  try {
    // Geocode the origin address
    const originGeocode = await client.geocode({
      params: {
        address: COMPANY_ADDRESS,
        key: process.env.GOOGLE_MAPS_API_KEY!,
      },
    })

    if (!originGeocode.data.results.length) {
      return { distance: 0, fee: 0, error: "Origin address not found" }
    }

    // Geocode the destination address
    const destinationGeocode = await client.geocode({
      params: {
        address: destinationAddress,
        key: process.env.GOOGLE_MAPS_API_KEY!,
      },
    })

    if (!destinationGeocode.data.results.length) {
      return { distance: 0, fee: 0, error: "Destination address not found" }
    }

    // Get the coordinates
    const origin = originGeocode.data.results[0].geometry.location
    const destination = destinationGeocode.data.results[0].geometry.location

    // Calculate distance using Distance Matrix API
    const distanceMatrix = await client.distancematrix({
      params: {
        origins: [`${origin.lat},${origin.lng}`],
        destinations: [`${destination.lat},${destination.lng}`],
        key: process.env.GOOGLE_MAPS_API_KEY!,
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

    return { distance: distanceInKm, fee, error: null }
  } catch (error) {
    console.error("Error calculating distance:", error)
    return { distance: 0, fee: 0, error: "Failed to calculate distance" }
  }
}
