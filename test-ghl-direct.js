// A direct test script to verify your GoHighLevel API key works
// Run this with: node test-ghl-direct.js

// Use fetch in Node.js
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args))

// Replace these with your actual values or use environment variables
const API_KEY = process.env.CDV_API_KEY || process.env.GHL_API_KEY || "your_api_key_here"
const LOCATION_ID = process.env.CDV_LOCATION_ID || process.env.GHL_LOCATION_ID || "your_location_id_here"

// Log which variables we're using
console.log("Using API key:", API_KEY ? `${API_KEY.substring(0, 5)}...` : "undefined")
console.log("Using Location ID:", LOCATION_ID)

// Create the absolute minimum contact data
const contactData = {
  locationId: LOCATION_ID,
  contactData: {
    firstName: "Test",
    lastName: "User",
    email: `test${Date.now()}@example.com`, // Use timestamp to make email unique
    phone: "0400000000",
    // No source, no tags, nothing else
  },
}

console.log("Sending data:", JSON.stringify(contactData, null, 2))

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
      } else {
        console.error("ERROR: Failed to create contact")
      }
    } catch (e) {
      console.error("ERROR: Invalid JSON response")
    }
  })
  .catch((error) => {
    console.error("ERROR:", error)
  })
