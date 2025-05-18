// This script tests if the webhook URL is valid and accessible
// Run with: node test-webhook.js

import fetch from "node-fetch"

// Get the webhook URL from environment variables
const WEBHOOK_URL = process.env.CDV_WEBHOOK_URL

if (!WEBHOOK_URL) {
  console.error("Error: CDV_WEBHOOK_URL environment variable is not set")
  process.exit(1)
}

console.log(`Testing webhook URL: ${WEBHOOK_URL}`)

// Test data
const testData = {
  firstName: "Test",
  lastName: "User",
  email: "test@example.com",
  phone: "1234567890",
  companyName: "Test Company",
  message: "This is a test message from the webhook test script",
  source: "Webhook Test Script",
  tags: ["Test"],
}

async function testWebhook() {
  try {
    console.log("Sending test data to webhook...")

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    })

    console.log(`Response status: ${response.status}`)

    const responseText = await response.text()
    console.log("Response body:", responseText)

    if (response.ok) {
      console.log("✅ Webhook test successful!")
    } else {
      console.error("❌ Webhook test failed!")
    }
  } catch (error) {
    console.error("Error testing webhook:", error)
  }
}

testWebhook()
