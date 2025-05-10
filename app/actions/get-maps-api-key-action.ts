"use server"

import { cookies } from "next/headers"

export async function getServerMapsApiKey(): Promise<string> {
  // Try to get from cookies first (set by IframeHandler)
  const cookieStore = cookies()
  const apiKey = cookieStore.get("maps_api_key")?.value

  // Fall back to environment variable
  return apiKey || process.env.GOOGLE_MAPS_API_KEY || ""
}
