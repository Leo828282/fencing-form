// Add this script to your form page to receive the configuration securely

// Listen for configuration from parent window
window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SETUP_CONFIG") {
    // Store configuration in a secure way
    const config = event.data.config

    // Set up environment variables for the form
    window.process = window.process || {}
    window.process.env = window.process.env || {}

    // Only set if values are provided
    if (config.BOOKING_URL) {
      window.process.env.NEXT_PUBLIC_BOOKING_URL = config.BOOKING_URL
    }

    console.log("Configuration received and applied")
  }
})

// Request configuration from parent window
function requestConfig() {
  window.parent.postMessage(
    {
      type: "REQUEST_CONFIG",
    },
    "*",
  )
}

// Request configuration on page load
document.addEventListener("DOMContentLoaded", () => {
  requestConfig()

  // Request again after a short delay to ensure it's received
  setTimeout(requestConfig, 1000)
})

// Notify parent window of height changes
function notifyHeightChange() {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage(
      {
        type: "resize-iframe",
        height: document.body.scrollHeight,
      },
      "*",
    )
  }
}

// Set up height notification
setInterval(notifyHeightChange, 500)
window.addEventListener("resize", notifyHeightChange)
