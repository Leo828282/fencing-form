// This is a simple test script to verify your GoHighLevel/CDV integration
// You can run this with Node.js to test if your API key and location ID are working

import fetch from "node-fetch"

// Replace these with your actual values
const CDV_API_KEY = process.env.CDV_API_KEY || "your_api_key_here"
const CDV_LOCATION_ID = process.env.CDV_LOCATION_ID || "your_location_id_here"

async function testCDVIntegration() {
  console.log("Testing CDV/GoHighLevel integration...")
  console.log(`Using API key: ${CDV_API_KEY.substring(0, 5)}...`)
  console.log(`Using Location ID: ${CDV_LOCATION_ID}`)

  // Create a test contact
  const testContact = {
    locationId: CDV_LOCATION_ID,
    contactData: {
      firstName: "Test",
      lastName: "User",
      email: `test${Date.now()}@example.com`, // Use timestamp to make email unique
      phone: "0400000000",
      address1: "123 Test St",
      state: "NSW",
      postalCode: "2000",
      source: "API Test",
      tags: ["Test"],
      customField: {
        quote_type: "test",
        notes: "This is a test contact created to verify API integration",
      },
    },
  }

  try {
    console.log("Sending test contact to CDV API...")
    const response = await fetch("https://rest.gohighlevel.com/v1/contacts/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CDV_API_KEY}`,
      },
      body: JSON.stringify(testContact),
    })

    const responseText = await response.text()
    console.log(`Response status: ${response.status}`)
    console.log(`Response body: ${responseText}`)

    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      console.error("Failed to parse response as JSON:", e)
      responseData = { error: "Invalid JSON response" }
    }

    if (response.ok) {
      console.log("✅ SUCCESS! Your CDV/GoHighLevel integration is working correctly.")
      console.log("Contact created with ID:", responseData.id)
    } else {
      console.error("❌ ERROR: Failed to create test contact.")
      console.error("Error details:", responseData.error || responseData.message || "Unknown error")
    }
  } catch (error) {
    console.error("❌ ERROR: Exception occurred while testing CDV integration:", error)
  }
}

// Run the test
testCDVIntegration()
