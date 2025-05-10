"use server"

import { z } from "zod"

// Define environment variables
const CDV_API_KEY = process.env.CDV_API_KEY
const CDV_LOCATION_ID = process.env.CDV_LOCATION_ID

// Define the schema for form validation
const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(8, { message: "Phone number must be at least 8 characters." }),
  businessName: z.string().optional(),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  state: z.string().min(2, { message: "State must be at least 2 characters." }),
  postalCode: z.string().min(4, { message: "Postal code must be at least 4 characters." }),
  specialRequirements: z.string().optional(),
  quoteDetails: z.object({
    selectedOption: z.string(),
    selectedFenceType: z.string(),
    selectedFeetOption: z.string(),
    metersRequired: z.number(),
    hireDuration: z.number().optional(),
    durationUnit: z.string().optional(),
    totalPrice: z.number(),
    items: z.array(
      z.object({
        name: z.string(),
        quantity: z.number(),
        price: z.number(),
        priceDisplay: z.string().optional(),
        category: z.string(),
      }),
    ),
  }),
})

export async function submitQuoteToCDV(formData: FormData) {
  try {
    // Convert FormData to a plain object
    const formValues = Object.fromEntries(formData.entries())

    // Coerce values to the correct types
    const coercedFormValues = {
      ...formValues,
      quoteDetails: {
        ...JSON.parse(formValues.quoteDetails as string),
        metersRequired: Number(JSON.parse(formValues.quoteDetails as string).metersRequired),
        totalPrice: Number(JSON.parse(formValues.quoteDetails as string).totalPrice),
      },
    }

    // Validate the form data
    const validatedData = formSchema.parse(coercedFormValues)

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

    // Calculate prices for each item based on quantities
    const panelPrice =
      validatedData.quoteDetails.selectedFenceType === "premium"
        ? 80
        : validatedData.quoteDetails.selectedFenceType === "pool"
          ? 95
          : 50
    const feetPrice = validatedData.quoteDetails.selectedFeetOption === "hookStay" ? 35 : 25
    const clampPrice = 4
    const bracePrice = 35

    // Calculate total prices for each item
    const panelTotalPrice = numPanels * panelPrice
    const feetTotalPrice = numFeet * feetPrice
    const clampTotalPrice = numClamps * clampPrice
    const braceTotalPrice = numBraces * bracePrice
    const braceFeetTotalPrice = numBraces * 2 * feetPrice // 2 feet per brace

    // Format prices to 2 decimal places
    const formatPrice = (price) => price.toFixed(2)

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

    // Prepare the data for CDV API with flattened custom fields
    const contactData = {
      locationId: CDV_LOCATION_ID,
      contactData: {
        // Standard contact fields remain the same
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

        // Custom fields with exact keys matching GoHighLevel
        "contact.quote_type": validatedData.quoteDetails.selectedOption,
        "contact.fence_panel_type": panelTypeName,
        "contact.feet_option": feetOptionName,
        "contact.fencing_meters_required": validatedData.quoteDetails.metersRequired.toString(),
        "contact.number_of_panels": numPanels.toString(),
        "contact.number_of_feet": numFeet.toString(),
        "contact.number_of_clamps": numClamps.toString(),
        "contact.number_of_braces": numBraces.toString(),
        "contact.hire_duration": validatedData.quoteDetails.hireDuration?.toString() || "",
        "contact.duration_unit": validatedData.quoteDetails.durationUnit || "",
        "contact.total_price": validatedData.quoteDetails.totalPrice.toString(),
        "contact.notesspecial_requirements": notes,

        // Itemized breakdown for email template
        "contact.item_1_name": `${panelTypeName}`,
        "contact.item_1_qty": numPanels.toString(),
        "contact.item_1_price": formatPrice(panelTotalPrice),
        "contact.item_1_unit_price": formatPrice(panelPrice),

        "contact.item_2_name": `${feetOptionName}`,
        "contact.item_2_qty": numFeet.toString(),
        "contact.item_2_price": formatPrice(feetTotalPrice),
        "contact.item_2_unit_price": formatPrice(feetPrice),

        "contact.item_3_name": "Fencing Clamp",
        "contact.item_3_qty": numClamps.toString(),
        "contact.item_3_price": formatPrice(clampTotalPrice),
        "contact.item_3_unit_price": formatPrice(clampPrice),

        "contact.item_4_name": "Fencing Stay Support",
        "contact.item_4_qty": numBraces.toString(),
        "contact.item_4_price": formatPrice(braceTotalPrice),
        "contact.item_4_unit_price": formatPrice(bracePrice),

        "contact.item_5_name": "Fencing Feet (for braces)",
        "contact.item_5_qty": (numBraces * 2).toString(),
        "contact.item_5_price": formatPrice(braceFeetTotalPrice),
        "contact.item_5_unit_price": formatPrice(feetPrice),

        // Price breakdown calculations
        "contact.price_per_meter": formatPrice(panelPrice / panelLength),
        "contact.fencing_price": formatPrice(panelTotalPrice),
        "contact.price_per_panel": formatPrice(panelPrice),
        "contact.panels_price": formatPrice(panelTotalPrice),
        "contact.price_per_foot": formatPrice(feetPrice),
        "contact.feet_price": formatPrice(feetTotalPrice),
        "contact.price_per_duration":
          validatedData.quoteDetails.selectedOption === "hire"
            ? formatPrice(validatedData.quoteDetails.totalPrice / (validatedData.quoteDetails.hireDuration || 1))
            : "0.00",
        "contact.hire_price":
          validatedData.quoteDetails.selectedOption === "hire"
            ? formatPrice(validatedData.quoteDetails.totalPrice)
            : "0.00",
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
