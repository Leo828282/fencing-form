import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const input = searchParams.get("input")

  if (!input) {
    return NextResponse.json({ error: "Input parameter is required" }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    console.error("Google Maps API key is not configured")
    return NextResponse.json({ error: "API key not configured" }, { status: 500 })
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&components=country:au&key=${apiKey}`,
    )

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching place predictions:", error)
    return NextResponse.json({ error: "Failed to fetch predictions" }, { status: 500 })
  }
}
