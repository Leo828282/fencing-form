// Simple script to test your GoHighLevel/CDV Webhook
// Run with Node.js to verify your webhook is working

// Import fetch for Node.js environments
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args))

// Use environment variables or replace with actual webhook URL
const WEBHOOK_URL =
  process.env.CDV_WEBHOOK_URL ||
  "https://services.leadconnectorhq.com/hooks/K6IXtrByTpRfuWTrjizN/webhook-trigger/4ce7fd0e-c2e5-4ef1-8b11-ee0dc547d1df"

// Log which variables we're using
console.log("Testing GoHighLevel Webhook integration")
console.log("Webhook URL:", WEBHOOK_URL ? `${WEBHOOK_URL.substring(0, 20)}...` : "undefined")

// Create minimal test contact with timestamp to ensure uniqueness
const timestamp = Date.now()
const contactData = {
  firstName: "Test",
  lastName: "Webhook",
  email: `test.webhook${timestamp}@example.com`,
  phone: "0400000000",
  address1: "123 Test St",
  city: "Sydney",
  state: "NSW",
  postalCode: "2000",
  source: "Webhook Test",

  // Quote details
  quote_type: "purchase",
  fence_panel_type: "Premium Grade Heavy Duty",
  feet_option: "Premium Plastic Temporary Fencing Feet",
  fencing_meters_required: "15",
  hire_duration: "2",
  duration_unit: "weeks",
  total_price: "1250",

  // Delivery information
  start_date: "2023-05-15",
  site_location_address: "456 Delivery St, Melbourne VIC 3000",
  delivery_fee: "120",

  // Notes
  notes: "This is a test quote request",

  // Tags
  tags: ["Webhook Test", "Fencing Quote", "Purchase"],
}

console.log("Sending test contact to webhook:", JSON.stringify(contactData, null, 2))

// Make the webhook request
fetch(WEBHOOK_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(contactData),
})
  .then((response) => {
    console.log("Response status:", response.status)
    return response.text()
  })
  .then((text) => {
    console.log("Response body:", text)
    try {
      const json = JSON.parse(text)
      if (json.success || json.id) {
        console.log("SUCCESS! Data sent to webhook!")
      } else {
        console.error("ERROR: Failed to send data to webhook")
        console.error("Error details:", json.error || json.message || "Unknown error")
      }
    } catch (e) {
      if (text.includes("success") || text.includes("200")) {
        console.log("SUCCESS! Webhook appears to be working (non-JSON response)")
      } else {
        console.error("ERROR: Invalid JSON response")
        console.log("Raw response:", text)
      }
    }
  })
  .catch((error) => {
    console.error("ERROR making request:", error)
  })
