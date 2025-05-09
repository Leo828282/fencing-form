import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const placeId = searchParams.get("place_id")

  if (!placeId) {
    return NextResponse.json({ error: "Place ID parameter is required" }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    console.error("Google Maps API key is not configured")
    return NextResponse.json({ error: "API key not configured" }, { status: 500 })
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=address_components,formatted_address,geometry&key=${apiKey}`,
    )

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching place details:", error)
    return NextResponse.json({ error: "Failed to fetch place details" }, { status: 500 })
  }
}
