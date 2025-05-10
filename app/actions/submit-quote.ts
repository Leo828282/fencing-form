export async function submitQuoteToCDV(formData: FormData) {
  try {
    // Validate the form data
    const validatedData = formSchema.parse(formData)

    // Check if we have the API key and location ID
    if (!CDV_API_KEY) {
      console.error("CDV_API_KEY is not defined")
      return { success: false, error: "API key is not configured" }
    }

    if (!CDV_LOCATION_ID) {
      console.error("CDV_LOCATION_ID is not defined")
      return { success: false, error: "Location ID is not configured" }
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

    // Prepare the data for CDV API
    const contactData = {
      locationId: CDV_LOCATION_ID,
      contactData: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        companyName: validatedData.businessName || "",
        address1: validatedData.address,
        state: validatedData.state,
        postalCode: validatedData.postalCode,
        source: "Fencing Calculator",
        tags: ["Fencing Quote"],
        customField: {
          quote_type: validatedData.quoteDetails.selectedOption,
          fence_panel_type: panelTypeName,
          crowd_control_barriers: feetOptionName,
          fencing_meters_required: validatedData.quoteDetails.metersRequired.toString(),
          number_of_panels: numPanels.toString(),
          number_of_feet: numFeet.toString(),
          number_of_clamps: numClamps.toString(),
          number_of_braces: numBraces.toString(),
          hire_duration: validatedData.quoteDetails.hireDuration?.toString() || "",
          duration_unit: validatedData.quoteDetails.durationUnit || "",
          total_price: validatedData.quoteDetails.totalPrice.toString(),
          notesspecial_requirements: notes,
        },
      },
    }

    console.log("Submitting to CDV with API key:", CDV_API_KEY.substring(0, 5) + "...")

    // Make the API request to CDV
    const response = await fetch("https://rest.gohighlevel.com/v1/contacts/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CDV_API_KEY}`,
      },
      body: JSON.stringify(contactData),
    })

    const responseText = await response.text()
    console.log("CDV API Response:", response.status, responseText)

    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      responseData = { error: "Invalid JSON response" }
    }

    if (!response.ok) {
      console.error("Error submitting to CDV:", responseData)
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
