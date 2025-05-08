// A direct test script for GoHighLevel API
// This bypasses your Next.js API and tests the GHL API directly

// Replace with your actual API key and location ID
const API_KEY = process.env.GHL_API_KEY || process.env.CDV_API_KEY || "your-api-key-here"
const LOCATION_ID = process.env.GHL_LOCATION_ID || process.env.CDV_LOCATION_ID || "your-location-id-here"

// Create a timestamp to make the email unique
const timestamp = Date.now()

// Create a minimal contact payload
const contactData = {
  locationId: LOCATION_ID,
  contactData: {
    firstName: "Test",
    lastName: "User",
    email: `test${timestamp}@example.com`,
    phone: "0400000000",
    source: "Direct API Test",
  },
}

console.log("Using API key:", API_KEY ? `${API_KEY.substring(0, 5)}...` : "undefined")
console.log("Using Location ID:", LOCATION_ID)
console.log("Sending contact data:", JSON.stringify(contactData, null, 2))

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
