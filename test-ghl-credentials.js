// A simple test script to verify your GoHighLevel API credentials
// Run this with Node.js

// Define environment variables from process.env
const CDV_API_KEY = process.env.CDV_API_KEY
const CDV_LOCATION_ID = process.env.CDV_LOCATION_ID
const GHL_API_KEY = process.env.GHL_API_KEY
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID

// Use GHL variables as fallback if CDV variables are not available
const API_KEY = CDV_API_KEY || GHL_API_KEY
const LOCATION_ID = CDV_LOCATION_ID || GHL_LOCATION_ID

// Log available environment variables (without exposing full values)
console.log("Environment variables check:")
console.log("- CDV_API_KEY:", CDV_API_KEY ? "✓ Available" : "✗ Missing")
console.log("- CDV_LOCATION_ID:", CDV_LOCATION_ID ? "✓ Available" : "✗ Missing")
console.log("- GHL_API_KEY:", GHL_API_KEY ? "✓ Available" : "✗ Missing")
console.log("- GHL_LOCATION_ID:", GHL_LOCATION_ID ? "✓ Available" : "✗ Missing")
console.log("- Using API_KEY:", API_KEY ? `${API_KEY.substring(0, 5)}...` : "✗ Missing")
console.log("- Using LOCATION_ID:", LOCATION_ID || "✗ Missing")

// Create the absolute minimum contact data
const contactData = {
  locationId: LOCATION_ID,
  contactData: {
    firstName: "Test",
    lastName: "User",
    email: `test${Date.now()}@example.com`, // Use timestamp to make email unique
    phone: "0400000000",
  },
}

console.log("\nSending test contact to GoHighLevel API...")
console.log("Contact data:", JSON.stringify(contactData, null, 2))

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
    console.log("\nResponse status:", response.status)
    return response.text()
  })
  .then((text) => {
    console.log("Response body:", text)
    try {
      const json = JSON.parse(text)
      if (json.id) {
        console.log("\n✅ SUCCESS! Contact created with ID:", json.id)
        console.log("Your GoHighLevel API credentials are working correctly!")
      } else {
        console.error("\n❌ ERROR: Failed to create contact")
        console.error("Error details:", json.error || json.message || "Unknown error")
      }
    } catch (e) {
      console.error("\n❌ ERROR: Invalid JSON response")
    }
  })
  .catch((error) => {
    console.error("\n❌ ERROR:", error)
  })
