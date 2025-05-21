import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const data = await request.json()

    // Log the received data for debugging
    console.log("Quote form submission received:", JSON.stringify(data, null, 2))

    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email || !data.phone) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 })
    }

    // Validate phone format (basic check)
    const phoneRegex = /^[0-9\s+\-$$$$]{8,15}$/
    if (!phoneRegex.test(data.phone)) {
      return NextResponse.json({ success: false, error: "Invalid phone number format" }, { status: 400 })
    }

    // Validate quote details
    if (!data.quoteDetails) {
      return NextResponse.json({ success: false, error: "Missing quote details" }, { status: 400 })
    }

    // Get the webhook URL
    const WEBHOOK_URL =
      process.env.CDV_WEBHOOK_URL ||
      "https://services.leadconnectorhq.com/hooks/K6IXtrByTpRfuWTrjizN/webhook-trigger/4ce7fd0e-c2e5-4ef1-8b11-ee0dc547d1df"

    if (!WEBHOOK_URL) {
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

    // Map fence panel type
    const panelTypeName =
      data.quoteDetails.selectedFenceType === "premium"
        ? "Premium Grade Heavy Duty"
        : data.quoteDetails.selectedFenceType === "builders"
          ? "Builder's Temporary Smart Duty"
          : data.quoteDetails.selectedFenceType === "pool"
            ? "Temporary Fence Pool Panels"
            : data.quoteDetails.selectedFenceType === "crowd"
              ? "Crowd Control Barriers"
              : ""

    // Map feet option
    const feetOptionName =
      data.quoteDetails.selectedFeetOption === "feet"
        ? "Premium Plastic Temporary Fencing Feet"
        : data.quoteDetails.selectedFeetOption === "hookStay"
          ? "Hook Stay"
          : ""

    // Format items for notes
    const itemsText = data.quoteDetails.items
      .filter((item) => !item.name.includes("Hire Duration") && !item.name.includes("Discount:"))
      .map(
        (item) =>
          `- ${item.name}: ${item.quantity} x ${item.priceDisplay || `$${(item.price / item.quantity).toFixed(2)}`}`,
      )
      .join("\n")

    // Prepare the data for webhook
    const webhookData = {
      // Contact information
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      companyName: data.businessName || "",
      address1: data.address,
      state: data.state,
      postalCode: data.postalCode,
      source: "Fencing Calculator",

      // Quote details
      quote_type: data.quoteDetails.selectedOption,
      fence_panel_type: panelTypeName,
      feet_option: feetOptionName,
      fencing_meters_required: data.quoteDetails.metersRequired.toString(),
      number_of_panels: numPanels.toString(),
      number_of_feet: numFeet.toString(),
      number_of_clamps: numClamps.toString(),
      number_of_braces: numBraces.toString(),
      hire_duration: data.quoteDetails.hireDuration?.toString() || "",
      duration_unit: data.quoteDetails.durationUnit || "",
      total_price: data.quoteDetails.totalPrice.toString(),
      notes: data.specialRequirements || "",

      // Include the items list in notes
      items_list: itemsText,

      // Tags
      tags: [
        "Fencing Quote",
        `${data.quoteDetails.selectedOption.charAt(0).toUpperCase() + data.quoteDetails.selectedOption.slice(1)} Quote`,
      ],

      // Site location details if available
      site_location_address: data.address,

      // Additional fields that might be useful
      city: data.city || "",
    }

    // Submit to webhook
    try {
      const webhookResponse = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookData),
      })

      console.log("Webhook response status:", webhookResponse.status)

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text()
        console.error("Webhook error:", errorText)
        return NextResponse.json(
          {
            success: false,
            error: `Error submitting to CRM: ${webhookResponse.status}`,
          },
          { status: 500 },
        )
      }

      // Return success response
      return NextResponse.json({
        success: true,
        message: "Quote request received successfully!",
        reference: `QUOTE-${Date.now().toString().substring(5)}`,
      })
    } catch (webhookError) {
      console.error("Error submitting to webhook:", webhookError)
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
