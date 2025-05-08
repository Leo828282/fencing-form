import { type NextRequest, NextResponse } from "next/server"

// The original webhook URL from GoHighLevel
const WEBHOOK_URL =
  process.env.CDV_WEBHOOK_URL ||
  "https://services.leadconnectorhq.com/hooks/K6IXtrByTpRfuWTrjizN/webhook-trigger/4ce7fd0e-c2e5-4ef1-8b11-ee0dc547d1df"

export async function POST(req: NextRequest) {
  try {
    // Log that the API route was called
    console.log("API route called - submit-quote using Inbound Webhook")

    // Check if webhook URL is configured
    if (!WEBHOOK_URL) {
      console.error("Missing webhook URL configuration")
      return NextResponse.json(
        {
          success: false,
          message: "Server configuration error: Missing webhook URL",
        },
        { status: 500 },
      )
    }

    const data = await req.json()
    console.log("Received form data:", JSON.stringify(data))

    // Validate required fields
    const missingFields = []
    if (!data.firstName) missingFields.push("firstName")
    if (!data.lastName) missingFields.push("lastName")
    if (!data.email) missingFields.push("email")
    if (!data.phone) missingFields.push("phone")

    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields)
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          details: { missingFields },
        },
        { status: 400 },
      )
    }

    // Format phone number - ensure it starts with a country code if not present
    let formattedPhone = data.phone.replace(/\D/g, "")
    // If Australian number and missing country code, add it
    if (formattedPhone.length === 10 && formattedPhone.startsWith("04")) {
      formattedPhone = `61${formattedPhone.substring(1)}`
    }

    // Determine panel type name
    const panelTypeName =
      data.selectedFenceType === "premium"
        ? "Premium Grade Heavy Duty"
        : data.selectedFenceType === "builders"
          ? "Builder's Temporary Smart Duty"
          : data.selectedFenceType === "pool"
            ? "Temporary Fence Pool Panels"
            : data.selectedFenceType === "crowd"
              ? "Crowd Control Barriers"
              : "Standard Panel"

    // Determine feet option name
    const feetOptionName =
      data.selectedFeetOption === "feet"
        ? "Premium Plastic Temporary Fencing Feet"
        : data.selectedFeetOption === "hookStay"
          ? "Hook Stay"
          : "Standard Feet"

    // Calculate prices for each item based on quantities
    const panelPrice = data.selectedFenceType === "premium" ? 80 : data.selectedFenceType === "pool" ? 95 : 50
    const feetPrice = data.selectedFeetOption === "hookStay" ? 35 : 25
    const clampPrice = 4
    const bracePrice = 35

    // Calculate total prices for each item
    const panelTotalPrice = (data.numPanels || 0) * panelPrice
    const feetTotalPrice = (data.numFeet || 0) * feetPrice
    const clampTotalPrice = (data.numClamps || 0) * clampPrice
    const braceTotalPrice = (data.numBraces || 0) * bracePrice
    const braceFeetTotalPrice = (data.numBraces || 0) * 2 * feetPrice // 2 feet per brace

    // Format prices to 2 decimal places
    const formatPrice = (price) => (price || 0).toFixed(2)

    // Prepare data for Inbound Webhook - format for GoHighLevel webhook automation
    const webhookData = {
      // Contact basics
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: formattedPhone,
      address1: data.address || "",
      city: data.city || "",
      state: data.state || "",
      postalCode: data.postalCode || data.zip || "",
      companyName: data.businessName || data.company || "",

      // Source tracking
      source: "Fencing Calculator",

      // Quote details as top-level fields for easier mapping
      quote_type: data.selectedOption || "purchase",
      fence_panel_type: panelTypeName,
      feet_option: feetOptionName,
      fencing_meters_required: (data.metersRequired || 10).toString(),
      number_of_panels: (data.numPanels || 5).toString(),
      number_of_feet: (data.numFeet || 6).toString(),
      number_of_clamps: (data.numClamps || 5).toString(),
      number_of_braces: (data.numBraces || 1).toString(),
      hire_duration: data.hireDuration?.toString() || "",
      duration_unit: data.durationUnit || "",
      total_price: data.totalPrice?.toString() || "0",
      notes: data.specialRequirements || data.message || "Quote request from website",

      // Delivery information
      start_date: data.startDate || "",
      site_location_address: data.deliveryAddress || "",
      delivery_fee: data.deliveryFee?.toString() || "0",

      // Itemized breakdown for email template
      item_1_name: `${panelTypeName}`,
      item_1_qty: data.numPanels?.toString() || "5",
      item_1_price: formatPrice(panelTotalPrice),
      item_1_unit_price: formatPrice(panelPrice),

      item_2_name: `${feetOptionName}`,
      item_2_qty: data.numFeet?.toString() || "6",
      item_2_price: formatPrice(feetTotalPrice),
      item_2_unit_price: formatPrice(feetPrice),

      item_3_name: "Fencing Clamp",
      item_3_qty: data.numClamps?.toString() || "5",
      item_3_price: formatPrice(clampTotalPrice),
      item_3_unit_price: formatPrice(clampPrice),

      item_4_name: "Fencing Stay Support",
      item_4_qty: data.numBraces?.toString() || "1",
      item_4_price: formatPrice(braceTotalPrice),
      item_4_unit_price: formatPrice(bracePrice),

      item_5_name: "Fencing Feet (for braces)",
      item_5_qty: ((data.numBraces || 0) * 2).toString(),
      item_5_price: formatPrice(braceFeetTotalPrice),
      item_5_unit_price: formatPrice(feetPrice),

      // Price breakdown calculations
      price_per_meter: formatPrice(
        panelPrice / (data.selectedFenceType === "premium" ? 2.4 : data.selectedFenceType === "pool" ? 2.3 : 2.4),
      ),
      fencing_price: formatPrice(panelTotalPrice),
      price_per_panel: formatPrice(panelPrice),
      panels_price: formatPrice(panelTotalPrice),
      price_per_foot: formatPrice(feetPrice),
      feet_price: formatPrice(feetTotalPrice),
      price_per_duration:
        data.selectedOption === "hire" ? formatPrice(data.totalPrice / (data.hireDuration || 1)) : "0.00",
      hire_price: data.selectedOption === "hire" ? formatPrice(data.totalPrice) : "0.00",

      // Tags as an array - GoHighLevel can process these in the automation
      tags: ["Fencing Quote", data.selectedOption === "hire" ? "Hire" : "Purchase"],
    }

    console.log("Sending to GoHighLevel Inbound Webhook:", JSON.stringify(webhookData))

    // Make the request to the GoHighLevel webhook
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookData),
    })

    // Get response as text first for better error logging
    const responseText = await response.text()
    console.log("Webhook Response status:", response.status)
    console.log("Webhook Response body:", responseText)

    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      console.error("Failed to parse response as JSON:", e)
      responseData = { error: "Invalid JSON response" }
    }

    if (!response.ok) {
      console.error("Error submitting to webhook:", responseData)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to submit quote via webhook",
          error: responseData,
          status: response.status,
        },
        { status: response.status },
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Quote submitted successfully!",
        data: responseData,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error processing quote request:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
