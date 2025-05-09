import Cookies from "js-cookie"

export function getMapsApiKey(): string {
  // Check for API key in different sources with priority order

  // 1. Check URL query parameter via sessionStorage (set by IframeHandler)
  if (typeof window !== "undefined") {
    const storedApiKey = sessionStorage.getItem("maps_api_key")
    if (storedApiKey) return storedApiKey
  }

  // 2. Check cookies (also set by IframeHandler)
  const cookieApiKey = Cookies.get("maps_api_key")
  if (cookieApiKey) return cookieApiKey

  // 3. Return empty string instead of environment variable
  // We'll use server actions/components to get the API key when needed
  return ""
}
