declare namespace NodeJS {
  interface ProcessEnv {
    // Server-side only Google Maps API key
    GOOGLE_MAPS_API_KEY: string

    // Public variables
    NEXT_PUBLIC_BOOKING_URL: string

    // GoHighLevel API credentials
    GHL_LOCATION_ID: string
    GHL_API_KEY: string

    // CDV API credentials
    CDV_API_KEY: string
    CDV_LOCATION_ID: string
    CDV_WEBHOOK_URL: string
  }
}
