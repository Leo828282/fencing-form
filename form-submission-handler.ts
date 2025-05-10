// This file would be used to handle the form submission and send data to GoHighLevel

import { mapFormDataToGoHighLevel } from "./gohighlevel-integration"

// Update the FencingCalculator component to include form submission handling
// Add this function to your FencingCalculator component

const handleFormSubmit = async (
  formData: any,
  serviceType: string,
  fencingType: string,
  meters: number,
  setIsSaving: (isSaving: boolean) => void,
  setCustomerId: (customerId: string) => void,
  setFormSubmitted: (formSubmitted: boolean) => void,
) => {
  // Set loading state
  setIsSaving(true)

  // Prepare the form data
  const formDataToSubmit = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    businessName: formData.businessName,
    email: formData.email,
    phone: formData.phone,
    serviceType: serviceType,
    fencingType: fencingType,
    meters: meters,
    siteLocation: formData.siteLocation,
    startDate: formData.startDate,
    duration: formData.duration,
    durationUnit: formData.durationUnit,
    notes: formData.notes,
  }

  try {
    // Map form data to GoHighLevel format
    const goHighLevelData = mapFormDataToGoHighLevel(formDataToSubmit)

    // Send data to your backend API that will handle the GoHighLevel integration
    const response = await fetch("/api/submit-to-gohighlevel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(goHighLevelData),
    })

    if (!response.ok) {
      throw new Error("Failed to submit form")
    }

    // Handle successful submission
    const result = await response.json()

    // Generate random customer ID (for demo purposes)
    const randomId = Math.floor(100000 + Math.random() * 900000).toString()
    setCustomerId(randomId)

    // Show success state
    setFormSubmitted(true)
  } catch (error) {
    console.error("Error submitting form:", error)
    // Handle error state
    alert("There was an error submitting your form. Please try again.")
  } finally {
    setIsSaving(false)
  }
}
