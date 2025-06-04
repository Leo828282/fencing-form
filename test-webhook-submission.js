// Test the GoHighLevel webhook directly
async function testWebhookSubmission() {
  const webhookUrl =
    "https://services.leadconnectorhq.com/hooks/K6IXtrByTpRfuWTrjizN/webhook-trigger/4ce7fd0e-c2e5-4ef1-8b11-ee0dc547d1df"

  const testData = {
    firstName: "John",
    lastName: "Test",
    email: "john.test@example.com",
    phone: "+61455764322",
    companyName: "Test Company",
    address1: "Po box 106 casula",
    state: "NSW",
    postalCode: "2170",
    source: "Calculator Enquiry",
    quote_type: "hire",
    fence_panel_type: "Builder's Temporary Smart Duty",
    feet_option: "Premium Plastic Temporary Fencing Feet",
    fencing_meters_required: "50",
    hire_duration: "4",
    duration_unit: "weeks",
    total_price: "1250.00",
    number_of_panels: "21",
    number_of_clamps: "21",
    number_of_feet: "22",
    number_of_braces: "3",
    notes:
      "Option: Hire\nFence Type: Builder's Temporary Smart Duty\nFeet Option: Premium Plastic Temporary Fencing Feet\nMeters Required: 50\nDuration: 4 weeks\nTotal Price: $1,250.00",
    country: "Australia",
    tags: [
      "Calculator Enquiry",
      "Multi Form Enquiry",
      "NSW",
      "hire",
      "Builder's Temporary Smart Duty",
      "0-50m",
      "1–4 weeks",
    ],
    enquiry_type: "Multi Form Enquiry",
    lead_source_detail: "Calculator Enquiry",
  }

  console.log("🧪 Testing webhook submission...")
  console.log("📡 Webhook URL:", webhookUrl)
  console.log("📦 Test data:", JSON.stringify(testData, null, 2))

  try {
    const startTime = Date.now()

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(testData),
    })

    const endTime = Date.now()
    const responseTime = endTime - startTime

    console.log(`⏱️ Response time: ${responseTime}ms`)
    console.log(`📊 Status: ${response.status} ${response.statusText}`)
    console.log("📋 Response headers:", Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log("📄 Response body:", responseText)

    if (response.ok) {
      console.log("✅ SUCCESS: Webhook accepted the data!")

      // Try to parse as JSON
      try {
        const jsonResponse = JSON.parse(responseText)
        console.log("📝 Parsed response:", jsonResponse)
      } catch (e) {
        console.log("ℹ️ Response is not JSON format")
      }
    } else {
      console.log("❌ FAILED: Webhook rejected the data")
      console.log(`🚨 Error: ${response.status} - ${responseText}`)
    }
  } catch (error) {
    console.log("💥 NETWORK ERROR:", error.message)
    console.log("🔍 Full error:", error)
  }
}

// Run the test
testWebhookSubmission()
