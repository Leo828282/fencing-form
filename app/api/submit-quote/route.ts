import { NextResponse } from "next/server"

// Helper function to format Australian phone numbers
function formatAustralianPhone(phone) {
  if (!phone) return phone

  // Remove all spaces, dashes, parentheses, and other non-digit characters except +
  let cleanPhone = phone.replace(/[^\d+]/g, "")

  // If it starts with 0 (Australian mobile/landline), convert to international format
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "+61" + cleanPhone.substring(1)
  }
  // If it already starts with +61, keep as is
  else if (cleanPhone.startsWith("+61")) {
    // Already in international format, keep as is
  }
  // If it starts with 61 (without +), add the +
  else if (cleanPhone.startsWith("61") && cleanPhone.length >= 10) {
    cleanPhone = "+" + cleanPhone
  }

  return cleanPhone
}

// Helper function to get distance range tag
function getDistanceRangeTag(meters) {
  const distance = Number.parseInt(meters)

  if (distance >= 0 && distance <= 50) return "0-50m"
  if (distance >= 51 && distance <= 100) return "51-100m"
  if (distance >= 101 && distance <= 150) return "101-150m"
  if (distance >= 151 && distance <= 200) return "151-200m"
  if (distance >= 201 && distance <= 250) return "201-250m"
  if (distance >= 251 && distance <= 300) return "251-300m"
  if (distance >= 301 && distance <= 350) return "301-350m"
  if (distance >= 351 && distance <= 400) return "351-400m"
  if (distance >= 401 && distance <= 450) return "401-450m"
  if (distance >= 451 && distance <= 500) return "451-500m"
  if (distance >= 501 && distance <= 550) return "501-550m"
  if (distance >= 551 && distance <= 600) return "551-600m"
  if (distance >= 601 && distance <= 650) return "601-650m"
  if (distance >= 651 && distance <= 700) return "651-700m"
  if (distance >= 701 && distance <= 750) return "701-750m"
  if (distance >= 751 && distance <= 800) return "751-800m"

  return "751-800m" // Default for anything over 800m
}

// Helper function to get duration range tag
function getDurationRangeTag(duration, unit) {
  let weeks = 0

  // Convert to weeks
  if (unit === "weeks") {
    weeks = Number.parseInt(duration)
  } else if (unit === "days") {
    weeks = Math.ceil(Number.parseInt(duration) / 7)
  } else if (unit === "months") {
    weeks = Math.ceil(Number.parseInt(duration) * 4.33) // Average weeks per month
  }

  if (weeks >= 1 && weeks <= 4) return "1–4 weeks"
  if (weeks >= 5 && weeks <= 8) return "5–8 weeks"
  if (weeks >= 9 && weeks <= 12) return "9–12 weeks"
  if (weeks >= 13 && weeks <= 16) return "13–16 weeks"
  if (weeks >= 17 && weeks <= 20) return "17–20 weeks"
  if (weeks >= 21 && weeks <= 24) return "21–24 weeks"
  if (weeks >= 25 && weeks <= 28) return "25–28 weeks"
  if (weeks >= 29 && weeks <= 32) return "29–32 weeks"
  if (weeks >= 33 && weeks <= 36) return "33–36 weeks"
  if (weeks >= 37 && weeks <= 40) return "37–40 weeks"
  if (weeks >= 41 && weeks <= 44) return "41–44 weeks"
  if (weeks >= 45 && weeks <= 48) return "45–48 weeks"
  if (weeks >= 49 && weeks <= 52) return "49–52 weeks"
  if (weeks >= 53 && weeks <= 56) return "53–56 weeks"
  if (weeks >= 57 && weeks <= 60) return "57–60 weeks"
  if (weeks >= 61 && weeks <= 64) return "61–64 weeks"
  if (weeks >= 65 && weeks <= 68) return "65–68 weeks"
  if (weeks >= 69 && weeks <= 72) return "69–72 weeks"
  if (weeks >= 73 && weeks <= 76) return "73–76 weeks"
  if (weeks >= 77 && weeks <= 80) return "77–80 weeks"
  if (weeks >= 81 && weeks <= 84) return "81–84 weeks"
  if (weeks >= 85 && weeks <= 88) return "85–88 weeks"
  if (weeks >= 89 && weeks <= 92) return "89–92 weeks"
  if (weeks >= 93 && weeks <= 96) return "93–96 weeks"
  if (weeks >= 97 && weeks <= 100) return "97–100 weeks"
  if (weeks >= 101 && weeks <= 104) return "101–104 weeks"

  return "101–104 weeks" // Default for anything over 104 weeks
}

// Helper function to get fence type tag
function getFenceTypeTag(fenceType) {
  switch (fenceType) {
    case "premium":
      return "Premium Grade Heavy Duty"
    case "builders":
      return "Builders Temporary Smart Duty"
    case "pool":
      return "Temporary Fence Pool Panels"
    case "crowd":
      return "Crowd Control Barriers"
    default:
      return "Builder's Temporary Smart Duty"
  }
}

// Helper function to format quote summary for notes
function formatQuoteSummary(data) {
  const {
    selectedOption,
    selectedFenceType,
    selectedFeetOption,
    metersRequired,
    hireDuration,
    durationUnit,
    totalPrice,
  } = data.quoteDetails

  // Format price with commas for thousands
  const formatPrice = (price) => {
    return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  let summary = `Option: ${selectedOption === "purchase" ? "Purchase" : "Hire"}\n`
  summary += `Fence Type: ${getFenceTypeTag(selectedFenceType)}\n`

  // Map feet option to display name
  const feetOptionName =
    selectedFeetOption === "feet"
      ? "Premium Plastic Temporary Fencing Feet"
      : selectedFeetOption === "hookStay"
        ? "Hook Stay"
        : selectedFeetOption

  summary += `Feet Option: ${feetOptionName}\n`
  summary += `Meters Required: ${metersRequired}\n`

  // Only add duration for hire quotes
  if (selectedOption === "hire" && hireDuration && durationUnit) {
    summary += `Duration: ${hireDuration} ${durationUnit}\n`
  }

  summary += `Total Price: $${formatPrice(totalPrice)}`

  // Add user's special requirements if any
  if (data.specialRequirements || data.message) {
    summary += `\n\nSpecial Requirements:\n${data.specialRequirements || data.message}`
  }

  return summary
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const data = await request.json()

    // Format Australian phone number before validation
    if (data.phone) {
      data.phone = formatAustralianPhone(data.phone)
    }

    // Log the received data for debugging
    console.log("Quote form submission received:", JSON.stringify(data, null, 2))

    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email || !data.phone || !data.company) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 })
    }

    // Validate phone format (basic check) - updated to be less restrictive
    const phoneRegex = /^[\d\s+\-()]{8,20}$/
    if (!phoneRegex.test(data.phone)) {
      return NextResponse.json({ success: false, error: "Invalid phone number format" }, { status: 400 })
    }

    // Validate quote details
    if (!data.quoteDetails) {
      return NextResponse.json({ success: false, error: "Missing quote details" }, { status: 400 })
    }

    // Validate Australian state
    const validStates = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"]
    if (!validStates.includes(data.state)) {
      return NextResponse.json({ success: false, error: "Invalid Australian state" }, { status: 400 })
    }

    // Get the webhook URL
    const WEBHOOK_URL = process.env.CDV_WEBHOOK_URL

    if (!WEBHOOK_URL) {
      console.error("Webhook URL is not configured in environment variables")
      return NextResponse.json({ success: false, error: "Webhook URL is not configured" }, { status: 500 })
    }

    // Calculate panel-related values
    const panelLength =
      data.quoteDetails.selectedFenceType === "premium"
        ? 2.4
        : data.quoteDetails.selectedFenceType === "builders"
          ? 2.4
          : data.quoteDetails.selectedFenceType === "pool"
            ? 2.3
            : data.quoteDetails.selectedFenceType === "crowd"
              ? 2.2
              : 2.4

    const numPanels = Math.ceil(data.quoteDetails.metersRequired / panelLength)
    const numFeet = numPanels + 1
    const needsBraces =
      data.quoteDetails.selectedFenceType === "builders" || data.quoteDetails.selectedFenceType === "pool"
    const numBraces = needsBraces ? Math.ceil(numPanels / 7) : 0
    const numClamps = data.quoteDetails.selectedFenceType === "crowd" ? 0 : numPanels

    // Get standardized tags
    const fenceTypeTag = getFenceTypeTag(data.quoteDetails.selectedFenceType)
    const distanceRangeTag = getDistanceRangeTag(data.quoteDetails.metersRequired)
    const durationRangeTag =
      data.quoteDetails.selectedOption === "hire"
        ? getDurationRangeTag(data.quoteDetails.hireDuration, data.quoteDetails.durationUnit)
        : null

    // Map feet option
    const feetOptionName =
      data.quoteDetails.selectedFeetOption === "feet"
        ? "Premium Plastic Temporary Fencing Feet"
        : data.quoteDetails.selectedFeetOption === "hookStay"
          ? "Hook Stay"
          : ""

    // Format items for notes (keeping the detailed items list)
    const itemsText =
      data.quoteDetails.items
        ?.filter((item) => !item.name.includes("Hire Duration") && !item.name.includes("Discount:"))
        .map((item) => {
          const unitPrice = item.price / item.quantity
          const formattedUnitPrice = unitPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          return `- ${item.name}: ${item.quantity} x ${item.priceDisplay || `$${formattedUnitPrice}`}`
        })
        .join("\n") || ""

    // Build tags array using only specified tags
    const tags = [
      "Calculator Enquiry",
      "Multi Form Enquiry",
      data.state, // NSW, VIC, QLD, WA, SA, TAS, ACT, NT
      data.quoteDetails.selectedOption, // hire or purchase
      fenceTypeTag, // Premium Grade Heavy Duty, Builder's Temporary Smart Duty, etc.
      distanceRangeTag, // 0-50m, 51-100m, etc.
    ]

    // Add duration range tag only for hire
    if (durationRangeTag) {
      tags.push(durationRangeTag) // 1–4 weeks, 5–8 weeks, etc.
    }

    // Create formatted quote summary for notes
    const quoteSummary = formatQuoteSummary(data)

    // Prepare the data for webhook - MATCHING YOUR GHL FIELD MAPPINGS EXACTLY
    const webhookData = {
      // Contact information - matching your field names exactly
      firstName: data.firstName, // {{inboundWebhookRequest.firstName}}
      lastName: data.lastName, // {{inboundWebhookRequest.lastName}}
      email: data.email, // {{inboundWebhookRequest.email}}
      phone: data.phone, // {{inboundWebhookRequest.phone}}
      companyName: data.company, // {{inboundWebhookRequest.companyName}}
      address1: data.address, // {{inboundWebhookRequest.address1}}
      city: data.city, // {{inboundWebhookRequest.city}}
      state: data.state, // {{inboundWebhookRequest.state}}
      postalCode: data.postCode, // {{inboundWebhookRequest.postalCode}}
      source: "Calculator Enquiry", // {{inboundWebhookRequest.source}}

      // Quote details - matching your field names exactly
      quote_type: data.quoteDetails.selectedOption, // {{inboundWebhookRequest.quote_type}}
      fence_panel_type: fenceTypeTag, // {{inboundWebhookRequest.fence_panel_type}}
      feet_option: feetOptionName, // {{inboundWebhookRequest.feet_option}}
      fencing_meters_required: data.quoteDetails.metersRequired.toString(), // {{inboundWebhookRequest.fencing_meters_required}}
      hire_duration: data.quoteDetails.hireDuration?.toString() || "", // {{inboundWebhookRequest.hire_duration}}
      duration_unit: data.quoteDetails.durationUnit || "", // {{inboundWebhookRequest.duration_unit}}
      total_price: data.quoteDetails.totalPrice.toString(), // {{inboundWebhookRequest.total_price}}
      number_of_panels: numPanels.toString(), // {{inboundWebhookRequest.number_of_panels}}
      number_of_clamps: numClamps.toString(), // {{inboundWebhookRequest.number_of_clamps}}
      number_of_feet: numFeet.toString(), // {{inboundWebhookRequest.number_of_feet}}
      number_of_braces: numBraces.toString(), // {{inboundWebhookRequest.number_of_braces}}
      notes: quoteSummary, // {{inboundWebhookRequest.notes}} - Now contains formatted quote summary

      // Additional fields for completeness
      country: "Australia",
      distance_range: distanceRangeTag,
      duration_range: durationRangeTag || "",
      items_list: itemsText,
      tags: tags,
      enquiry_type: "Multi Form Enquiry",
      lead_source_detail: "Calculator Enquiry",
    }

    // Submit to webhook
    try {
      console.log("=== WEBHOOK SUBMISSION DEBUG ===")
      console.log("Webhook URL:", WEBHOOK_URL)
      console.log("Payload being sent:", JSON.stringify(webhookData, null, 2))
      console.log("Payload size:", JSON.stringify(webhookData).length, "bytes")
      console.log("================================")

      const webhookResponse = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(webhookData),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      })

      console.log("Webhook response status:", webhookResponse.status)
      console.log("Webhook response headers:", Object.fromEntries(webhookResponse.headers.entries()))

      const responseText = await webhookResponse.text()
      console.log("Webhook response body:", responseText)

      if (!webhookResponse.ok) {
        console.error("Webhook failed with status:", webhookResponse.status)
        console.error("Webhook error response:", responseText)
        return NextResponse.json(
          {
            success: false,
            error: `Error submitting to CRM: ${webhookResponse.status} - ${responseText}`,
          },
          { status: 500 },
        )
      }

      // Try to parse response as JSON if possible
      let responseData
      try {
        responseData = JSON.parse(responseText)
        console.log("Webhook response JSON:", responseData)
      } catch (e) {
        console.log("Webhook response is not JSON:", responseText)
      }

      // Return success response
      return NextResponse.json({
        success: true,
        message: "Quote request received successfully!",
        reference: `CALC-${Date.now().toString().substring(5)}`,
        tags: tags,
        webhookResponse: responseData || responseText, // Include webhook response for debugging
      })
    } catch (webhookError) {
      console.error("Error submitting to webhook:", webhookError)
      console.error("Webhook error details:", {
        message: (webhookError as Error).message,
        stack: (webhookError as Error).stack,
      })
      return NextResponse.json(
        {
          success: false,
          error: `Failed to submit to CRM: ${(webhookError as Error).message}`,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error processing quote submission:", error)

    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}
