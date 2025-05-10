// Add this at the beginning of the file to ensure it runs before other code
// This will help debug Google Maps issues

// Debug Google Maps loading
window.googleMapsDebug = {
  scriptLoaded: false,
  apiInitialized: false,
  errors: [],
}

// Log Google Maps loading status
function logGoogleMapsStatus(message) {
  console.log(`[Google Maps Debug]: ${message}`)
  window.googleMapsDebug.errors.push(message)
}

// Add a global error handler to catch script loading issues
window.addEventListener("error", (event) => {
  if (event.filename && event.filename.includes("maps.googleapis.com")) {
    logGoogleMapsStatus(`Error loading Google Maps: ${event.message}`)
  }
})

// Add this to the existing window.onload function or create it if it doesn't exist
// Make sure to merge with any existing window.onload functionality
const originalOnload = window.onload
window.onload = () => {
  if (originalOnload) {
    originalOnload()
  }

  // Check if Google Maps API is available
  if (window.google && window.google.maps) {
    window.googleMapsDebug.apiInitialized = true
    logGoogleMapsStatus("Google Maps API initialized successfully")
  } else {
    logGoogleMapsStatus("Google Maps API not available after page load")
  }

  // Check for script tag
  const mapsScript = document.querySelector('script[src*="maps.googleapis.com"]')
  window.googleMapsDebug.scriptLoaded = !!mapsScript
  logGoogleMapsStatus(`Google Maps script tag ${mapsScript ? "found" : "not found"}`)
}
