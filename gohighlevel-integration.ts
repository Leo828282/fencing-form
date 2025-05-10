// This file handles mapping form data to GoHighLevel fields based on the provided screenshots

export function mapFormDataToGoHighLevel(formData: any) {
  // Extract state from address as plain text (if available)
  const statePattern = /\b(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\b/i
  const stateMatch = formData.siteLocation?.match(statePattern)
  const stateText = stateMatch ? stateMatch[0].toUpperCase() : ""

  // Extract postal code from address (if available)
  const postalCodePattern = /\b\d{4}\b/
  const postalCodeMatch = formData.siteLocation?.match(postalCodePattern)
  const postalCode = postalCodeMatch ? postalCodeMatch[0] : ""

  // Map fencing type to the correct panel option
  const fencingTypeMap = {
    standard: "Premium Grade Heavy Duty",
    braced: "Builder's Temporary Smart Duty",
    pool: "Temporary Fence Pool Panels",
    crowd: "Crowd Control Barriers",
  }

  // Map feet option based on selection
  const feetOptionMap = {
    standard: "Premium Plastic Temporary Fencing Feet",
    braced: "Premium Plastic Temporary Fencing Feet",
    pool: "Premium Plastic Temporary Fencing Feet",
    crowd: "Hook Stay", // For crowd control, use Hook Stay
  }

  const fencePanelType = fencingTypeMap[formData.fencingType] || "Premium Grade Heavy Duty"
  const feetOption = feetOptionMap[formData.fencingType] || "Premium Plastic Temporary Fencing Feet"

  // Format duration unit to match the dropdown options in the spreadsheet
  let durationUnit = "Weeks" // Default
  if (formData.durationUnit === "days") durationUnit = "Days"
  if (formData.durationUnit === "weeks") durationUnit = "Weeks"
  if (formData.durationUnit === "months") durationUnit = "Months"

  // Prepare the contact data for GoHighLevel based on the exact field names from screenshots
  const contactData = {
    // Contact section - exact field names from screenshot 1
    business_name: formData.businessName,
    first_name: formData.firstName,
    last_name: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    address1: formData.siteLocation, // Street Address in GoHighLevel
    state: stateText,
    postal_code: postalCode,
    source: "Fencing Calculator", // Contact Source field

    // Custom fields - exact field names from screenshots 2 and 3
    customField: {
      // Fencing Project section - screenshot 2
      quote_type: formData.serviceType === "hire" ? "Hire" : "Purchase",
      fence_panel_type: fencePanelType,
      feet_option: feetOption,
      fencing_meters_required: formData.meters?.toString() || "",
      hire_duration: formData.duration,
      duration_unit: durationUnit,
      total_price: "",
      notes_special_requirements: formData.notes || "",

      // Delivery section - screenshot 3
      start_date: formData.startDate || "",
      site_location_address: formData.siteLocation,
      distance_km: "",
      delivery_fee: "",
    },
  }

  // Determine tags to apply based on the service type and fencing type
  const tags = []

  // Add service type tag
  if (formData.serviceType === "hire") {
    tags.push("hire")
  } else if (formData.serviceType === "purchase") {
    tags.push("purchase")
  }

  // Add fence panel type tag based on selection
  if (formData.fencingType === "standard") {
    tags.push("Premium Grade Heavy Duty")
  } else if (formData.fencingType === "braced") {
    tags.push("Builder's Temporary Smart Duty")
  } else if (formData.fencingType === "pool") {
    tags.push("Temporary Fence Pool Panels")
  } else if (formData.fencingType === "crowd") {
    tags.push("Crowd Control Barriers")
  }

  return {
    contactData,
    tags,
  }
}
