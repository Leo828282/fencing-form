// Simple script to test your GoHighLevel/CDV API integration
// Run with Node.js to verify your credentials are working

// Import fetch for Node.js environments
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args))

// Use environment variables or replace with actual values
const API_KEY = process.env.CDV_API_KEY || process.env.GHL_API_KEY || "your_api_key_here"
const LOCATION_ID = process.env.CDV_LOCATION_ID || process.env.GHL_LOCATION_ID || "your_location_id_here"

// Log which variables we're using
console.log("Testing GoHighLevel API integration")
console.log("API key:", API_KEY ? `${API_KEY.substring(0, 5)}...` : "undefined")
console.log("Location ID:", LOCATION_ID || "undefined")

// Create minimal test contact with timestamp to ensure uniqueness
const timestamp = Date.now()
const contactData = {
  locationId: LOCATION_ID,
  contactData: {
    firstName: "Test",
    lastName: "User",
    email: `test${timestamp}@example.com`, // Unique email
    phone: "0400000000", // Use a valid format
    source: "API Test",
    tags: ["API Test"],
  },
}

console.log("Sending test contact:", JSON.stringify(contactData, null, 2))

// Make the API request
fetch("https://rest.gohighlevel.com/v1/contacts/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
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
      if (json.id) {
        console.log("SUCCESS! Contact created with ID:", json.id)
        console.log("Your GoHighLevel API integration is working correctly!")
      } else {
        console.error("ERROR: Failed to create contact")
        console.error("Error details:", json.error || json.message || "Unknown error")
      }
    } catch (e) {
      console.error("ERROR: Invalid JSON response")
    }
  })
  .catch((error) => {
    console.error("ERROR making request:", error)
  })
