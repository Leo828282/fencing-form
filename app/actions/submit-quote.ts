import { formSchema } from "../schemas/formSchema" // Import formSchema

export async function submitQuoteToCDV(formData: FormData) {
  try {
    // Validate the form data
    const validatedData = formSchema.parse(formData)

    // Check if we have the webhook URL
    const WEBHOOK_URL =
      process.env.CDV_WEBHOOK_URL ||
      "https://services.leadconnectorhq.com/hooks/K6IXtrByTpRfuWTrjizN/webhook-trigger/4ce7fd0e-c2e5-4ef1-8b11-ee0dc547d1df"

    if (!WEBHOOK_URL) {
      console.error("CDV_WEBHOOK_URL is not defined")
      return { success: false, error: "Webhook URL is not configured" }
    }

    // Calculate panel-related values
    const panelLength =
      validatedData.quoteDetails.selectedFenceType === "premium"
        ? 2.4
        : validatedData.quoteDetails.selectedFenceType === "builders"
          ? 2.4
          : validatedData.quoteDetails.selectedFenceType === "pool"
            ? 2.3
            : validatedData.quoteDetails.selectedFenceType === "crowd"
              ? 2.2
              : 2.4

    const numPanels = Math.ceil(validatedData.quoteDetails.metersRequired / panelLength)
    const numFeet = numPanels + 1
    const needsBraces =
      validatedData.quoteDetails.selectedFenceType === "builders" ||
      validatedData.quoteDetails.selectedFenceType === "pool"
    const numBraces = needsBraces ? Math.ceil(numPanels / 7) : 0
    const numClamps = validatedData.quoteDetails.selectedFenceType === "crowd" ? 0 : numPanels

    // Format the quote details as a string for the notes field
    const quoteDetailsText = `
Option: ${validatedData.quoteDetails.selectedOption}
Meters Required: ${validatedData.quoteDetails.metersRequired}
${
  validatedData.quoteDetails.selectedOption === "hire" && validatedData.quoteDetails.hireDuration
    ? `Duration: ${validatedData.quoteDetails.hireDuration} ${validatedData.quoteDetails.durationUnit}`
    : ""
}
Total Price: $${validatedData.quoteDetails.totalPrice.toFixed(2)}

Items:
${validatedData.quoteDetails.items
  .filter((item) => !item.name.includes("Hire Duration") && !item.name.includes("Discount:"))
  .map(
    (item) =>
      `- ${item.name}: ${item.quantity} x ${item.priceDisplay || `$${(item.price / item.quantity).toFixed(2)}`}`,
  )
  .join("\n")}
`

    // Combine the special requirements with the quote details
    const notes = validatedData.specialRequirements
      ? `${validatedData.specialRequirements}\n\n${quoteDetailsText}`
      : quoteDetailsText

    // Map fence panel type
    const panelTypeName =
      validatedData.quoteDetails.selectedFenceType === "premium"
        ? "Premium Grade Heavy Duty"
        : validatedData.quoteDetails.selectedFenceType === "builders"
          ? "Builder's Temporary Smart Duty"
          : validatedData.quoteDetails.selectedFenceType === "pool"
            ? "Temporary Fence Pool Panels"
            : validatedData.quoteDetails.selectedFenceType === "crowd"
              ? "Crowd Control Barriers"
              : ""

    // Map feet option
    const feetOptionName =
      validatedData.quoteDetails.selectedFeetOption === "feet"
        ? "Premium Plastic Temporary Fencing Feet"
        : validatedData.quoteDetails.selectedFeetOption === "hookStay"
          ? "Hook Stay"
          : ""

    // Prepare the data for webhook
    const webhookData = {
      // Contact information
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      phone: validatedData.phone,
      companyName: validatedData.businessName || "",
      address1: validatedData.address,
      state: validatedData.state,
      postalCode: validatedData.postalCode,
      source: "Fencing Calculator",

      // Quote details
      quote_type: validatedData.quoteDetails.selectedOption,
      fence_panel_type: panelTypeName,
      feet_option: feetOptionName,
      fencing_meters_required: validatedData.quoteDetails.metersRequired.toString(),
      number_of_panels: numPanels.toString(),
      number_of_feet: numFeet.toString(),
      number_of_clamps: numClamps.toString(),
      number_of_braces: numBraces.toString(),
      hire_duration: validatedData.quoteDetails.hireDuration?.toString() || "",
      duration_unit: validatedData.quoteDetails.durationUnit || "",
      total_price: validatedData.quoteDetails.totalPrice.toString(),
      notes: notes,

      // Tags - ensure they're in the format expected by the webhook
      tags: [
        "Fencing Quote",
        `${validatedData.quoteDetails.selectedOption.charAt(0).toUpperCase() + validatedData.quoteDetails.selectedOption.slice(1)} Quote`,
      ],

      // Site location details if available
      site_location_address: validatedData.address,

      // Additional fields that might be useful
      city: validatedData.city || "",
    }

    console.log("Submitting to webhook:", WEBHOOK_URL.substring(0, 30) + "...")

    // Make the API request to the webhook
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookData),
    })

    const responseText = await response.text()
    console.log("Webhook Response:", response.status, responseText)

    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      // If the response is not JSON, create a simple object with the text
      responseData = { message: responseText }
    }

    if (!response.ok) {
      console.error("Error submitting to webhook:", responseData)
      return {
        success: false,
        error: `API Error (${response.status}): ${responseData.error || responseData.message || "Unknown error"}`,
      }
    }

    return { success: true, data: responseData }
  } catch (error) {
    console.error("Error processing quote form:", error)
    return { success: false, error: (error as Error).message }
  }
}
