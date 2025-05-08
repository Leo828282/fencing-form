"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, CheckCircle, ArrowRight, AlertCircle, MapPin, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Poppins } from "next/font/google"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { calculateDistance, getPlacePredictions, getPlaceDetails } from "@/app/actions/maps-server-actions"

// Initialize the Poppins font
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

interface SimpleQuoteFormProps {
  onClose: () => void
  itemsList: Array<{
    name: string
    quantity: number
    price: number
    priceDisplay?: string
    isTBC?: boolean
    category?: string
  }>
  totalPrice: number
  selectedOption: string
  metersRequired: number
  hireDuration?: number
  durationUnit?: string
  formatDuration?: () => string
  formatPrice?: (price: number) => string
  selectedFenceType?: string
  selectedFeetOption?: string
}

export default function SimpleQuoteForm({
  onClose,
  itemsList,
  totalPrice,
  selectedOption,
  metersRequired,
  hireDuration,
  durationUnit,
  formatDuration,
  formatPrice = (price) => price.toFixed(2),
  selectedFenceType = "builders",
  selectedFeetOption = "feet",
}: SimpleQuoteFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    businessName: "",
    address: "",
    state: "NSW",
    postalCode: "",
    specialRequirements: "",
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [deliveryDistance, setDeliveryDistance] = useState<number | null>(null)
  const [updatedItemsList, setUpdatedItemsList] = useState(itemsList)
  const [updatedTotalPrice, setUpdatedTotalPrice] = useState(totalPrice)
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [addressInput, setAddressInput] = useState("")
  const [isAddressValid, setIsAddressValid] = useState(false)
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false)
  const [distance, setDistance] = useState<number | null>(null)
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null)
  const [calculatedTotalPrice, setCalculatedTotalPrice] = useState(totalPrice)

  const COMPANY_ADDRESS = "21C Richmond Rd, Homebush NSW 2140"

  useEffect(() => {
    document.body.style.overflow = "hidden"

    // Dispatch modal state change event for iframe communication
    const event = new CustomEvent("modalStateChanged", {
      detail: { isOpen: true, modalType: "quote" },
    })
    document.dispatchEvent(event)

    return () => {
      document.body.style.overflow = "auto"

      // Dispatch modal closed event
      const closeEvent = new CustomEvent("modalStateChanged", {
        detail: { isOpen: false, modalType: "quote" },
      })
      document.dispatchEvent(closeEvent)
    }
  }, [])

  // Handle address input change
  const handleAddressChange = async (value: string) => {
    setAddressInput(value)
    setFormData((prev) => ({ ...prev, address: value }))

    // Always update the form data with the typed value
    if (value.length > 3) {
      try {
        const predictions = await getPlacePredictions(value)
        setAddressSuggestions(predictions)
        setShowSuggestions(predictions.length > 0)
      } catch (error) {
        console.error("Error fetching address suggestions:", error)
      }
    } else {
      setShowSuggestions(false)
    }
  }

  // Handle address suggestion selection
  const handleSelectAddress = async (placeId: string, description: string) => {
    setAddressInput(description)
    setFormData((prev) => ({ ...prev, address: description }))
    setShowSuggestions(false)
    setIsAddressValid(true)

    try {
      const details = await getPlaceDetails(placeId)

      if (details.result) {
        // Try to extract state and postal code from the formatted address
        const addressComponents = details.result.address_components || []

        // Find postal code
        const postalCodeComponent = addressComponents.find((component) => component.types.includes("postal_code"))
        if (postalCodeComponent) {
          setFormData((prev) => ({ ...prev, postalCode: postalCodeComponent.long_name }))
        }

        // Find state
        const stateComponent = addressComponents.find((component) =>
          component.types.includes("administrative_area_level_1"),
        )
        if (stateComponent) {
          setFormData((prev) => ({ ...prev, state: stateComponent.short_name }))
        }

        // Calculate delivery fee
        calculateDeliveryFee(description)
      }
    } catch (error) {
      console.error("Error fetching place details:", error)
    }
  }

  const calculateDeliveryFee = async (address: string) => {
    if (!address) return

    setIsCalculatingDistance(true)

    try {
      // Call the server action to calculate distance
      const result = await calculateDistance(address)

      if (result.error) {
        console.error("Error calculating distance:", result.error)
      } else {
        setDistance(result.distance)
        setDeliveryFee(result.fee)
        setDeliveryDistance(result.distance)

        // Update the delivery fee in the items list
        updateDeliveryFee(result.fee)
      }
    } catch (error) {
      console.error("Error calculating delivery fee:", error)
    } finally {
      setIsCalculatingDistance(false)
    }
  }

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    // If changing address manually, mark as invalid until validated
    if (name === "address") {
      setIsAddressValid(false)
      setAddressInput(value)
    }
  }

  // Update delivery fee in items list
  const updateDeliveryFee = (fee: number) => {
    // Find the delivery item in the list
    const newItemsList = [...updatedItemsList]
    const deliveryItemIndex = newItemsList.findIndex(
      (item) => item.category === "delivery" || item.name.includes("Delivery"),
    )

    if (deliveryItemIndex !== -1) {
      // Update the delivery item
      const oldDeliveryFee = newItemsList[deliveryItemIndex].price
      newItemsList[deliveryItemIndex] = {
        ...newItemsList[deliveryItemIndex],
        price: fee,
        priceDisplay: `$${formatPrice(fee)}`,
        isTBC: false,
      }

      // Update the total price
      const priceDifference = fee - oldDeliveryFee
      setUpdatedTotalPrice((prev) => prev + priceDifference)
    } else {
      // Add a new delivery item if not found
      newItemsList.push({
        name: "Delivery Fee",
        quantity: 1,
        price: fee,
        priceDisplay: `$${formatPrice(fee)}`,
        category: "delivery",
        isTBC: false,
      })

      // Update the total price
      setUpdatedTotalPrice((prev) => prev + fee)
    }

    setUpdatedItemsList(newItemsList)
  }

  // Initialize updated items list
  useEffect(() => {
    setUpdatedItemsList(itemsList)
    setUpdatedTotalPrice(totalPrice)
    setCalculatedTotalPrice(totalPrice)
  }, [itemsList, totalPrice])

  useEffect(() => {
    // Recalculate total price whenever updatedItemsList changes
    const newTotalPrice = updatedItemsList.reduce((acc, item) => acc + item.price * item.quantity, 0)
    setCalculatedTotalPrice(newTotalPrice)
  }, [updatedItemsList])

  // Basic validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^[0-9+\s()-]{8,}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
    }

    if (!formData.state) {
      newErrors.state = "State is required"
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required"
    }

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Calculate panel-related values
      const panelLength =
        selectedFenceType === "premium"
          ? 2.4
          : selectedFenceType === "builders"
            ? 2.4
            : selectedFenceType === "pool"
              ? 2.3
              : selectedFenceType === "crowd"
                ? 2.2
                : 2.4

      const numPanels = Math.ceil(metersRequired / panelLength)
      const numFeet = numPanels + 1
      const needsBraces = selectedFenceType === "builders" || selectedFenceType === "pool"
      const numBraces = needsBraces ? Math.ceil(numPanels / 7) : 0
      const numClamps = selectedFenceType === "crowd" ? 0 : numPanels

      // Prepare the payload for webhook submission
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        businessName: formData.businessName.trim(),
        address: formData.address.trim(),
        state: formData.state,
        postalCode: formData.postalCode.trim(),
        specialRequirements: formData.specialRequirements.trim(),
        selectedOption: selectedOption,
        selectedFenceType: selectedFenceType,
        selectedFeetOption: selectedFeetOption,
        metersRequired: metersRequired,
        hireDuration: hireDuration,
        durationUnit: durationUnit,
        totalPrice: totalPrice,
        numPanels: numPanels,
        numFeet: numFeet,
        numClamps: numClamps,
        numBraces: numBraces,
        deliveryFee: deliveryFee || 0,
        distance: distance || 0,
      }

      console.log("Submitting form data via webhook:", payload)

      // Submit the form data to our server endpoint (which will forward to webhook)
      const response = await fetch("/api/submit-quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      // Get the response
      const responseData = await response.json()
      console.log("API response:", responseData)

      // Check if the response indicates success
      if (response.ok && responseData.success) {
        // Show success message
        setIsSubmitting(false)
        setShowSuccess(true)

        // Close the modal after showing success message
        setTimeout(() => {
          onClose()
        }, 1800)
      } else {
        // Handle API error
        console.error("API Error:", responseData)

        // Format a more user-friendly error message
        let errorMessage = "Failed to submit form. "

        if (responseData.details?.missingFields) {
          errorMessage += "Please fill in all required fields."
        } else if (responseData.error?.message) {
          errorMessage += responseData.error.message
        } else if (responseData.message) {
          errorMessage += responseData.message
        } else {
          errorMessage += "Please try again later."
        }

        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setIsSubmitting(false)
      setApiError(error.message || "There was an error submitting your form. Please try again.")
    }
  }

  // Filter display items
  const displayItems = updatedItemsList.filter(
    (item) => !item.name.includes("Hire Duration") && !item.name.includes("Discount:"),
  )

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto ${poppins.className}`}
    >
      <div
        className="bg-[#1D1D1D] rounded-lg shadow-xl w-full max-h-[90vh] overflow-auto"
        style={{ maxWidth: "996px" }}
      >
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 border-b border-[#333333] bg-[#1D1D1D]">
          <h2 className="text-xl font-bold text-white">Request a Quote</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#333333] text-white transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 md:p-8">
          {showSuccess ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 animate-fadeIn">
              <div className="relative">
                <div className="absolute inset-0 bg-[#B82429] rounded-full scale-[1.15] blur-md opacity-30 animate-pulse"></div>
                <div className="bg-[#B82429] rounded-full p-6 mb-8 relative z-10 shadow-lg">
                  <CheckCircle size={64} className="text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-3 animate-slideUp">Thank you!</h3>
              <p className="text-2xl text-white text-center mb-6 animate-slideUp" style={{ animationDelay: "100ms" }}>
                We'll be in touch!
              </p>
              <div
                className="w-16 h-1 bg-[#B82429] rounded-full animate-slideUp"
                style={{ animationDelay: "200ms" }}
              ></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Left side - Quote Summary */}
              <div className="flex flex-col">
                <h3 className="text-lg font-bold mb-6 text-white flex items-center">
                  <span className="w-1 h-6 bg-[#B82429] rounded-full mr-3"></span>
                  Quote Summary
                </h3>

                <div className="space-y-4 mb-6 bg-[#252525] p-5 rounded-lg border border-[#333333]">
                  <div className="flex justify-between">
                    <span className="text-[#cccccc]">Option:</span>
                    <span className="font-medium text-white">
                      {selectedOption === "purchase" ? "Purchase" : "Hire"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#cccccc]">Fencing Required:</span>
                    <span className="font-medium text-white">{metersRequired} meters</span>
                  </div>
                  {selectedOption === "hire" && (
                    <div className="flex justify-between">
                      <span className="text-[#cccccc]">Duration:</span>
                      <span className="font-medium text-white">
                        {formatDuration ? formatDuration() : `${hireDuration} ${durationUnit}`}
                      </span>
                    </div>
                  )}
                  {deliveryDistance && (
                    <div className="flex justify-between">
                      <span className="text-[#cccccc]">Delivery Distance:</span>
                      <span className="font-medium text-white">{deliveryDistance.toFixed(1)} km</span>
                    </div>
                  )}
                </div>

                <div className="mb-6 bg-[#252525] p-5 rounded-lg border border-[#333333]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#cccccc] font-medium">Total:</span>
                    <span className="text-[#B82429] text-xl font-bold">${formatPrice(calculatedTotalPrice)}</span>
                  </div>
                </div>

                <h4 className="font-bold mb-4 text-white flex items-center">
                  <span className="w-1 h-5 bg-[#B82429] rounded-full mr-3"></span>
                  Items Included:
                </h4>
                <div className="mb-6 overflow-visible bg-[#252525] rounded-lg border border-[#333333]">
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="min-w-full divide-y divide-[#333333]">
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-[#cccccc] tracking-wider"
                          >
                            Item
                          </th>
                          <th
                            scope="col"
                            className="px-3 sm:px-6 py-3 text-center text-xs sm:text-sm font-medium text-[#cccccc] tracking-wider"
                          >
                            Quantity
                          </th>
                          <th
                            scope="col"
                            className="px-3 sm:px-6 py-3 text-right text-xs sm:text-sm font-medium text-[#cccccc] tracking-wider"
                          >
                            Price
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-[#252525] divide-y divide-[#333333]">
                        {displayItems.map((item, index) => (
                          <tr key={index}>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-[#cccccc]">
                              {item.name}
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-[#B82429] text-center">
                              {item.quantity}
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-right text-[#cccccc]">
                              {item.isTBC && !item.price ? (
                                <span className="text-gray-500">TBC</span>
                              ) : (
                                <span>${formatPrice(item.price)}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-[#252525] p-4 rounded-lg border border-[#333333] text-xs text-[#999999]">
                  By submitting this form, you agree to be contacted regarding your quote request. We'll use your
                  information to prepare a detailed quote for your fencing needs.
                </div>
              </div>

              {/* Right side - Form */}
              <div>
                <h3 className="text-lg font-bold mb-6 text-white flex items-center">
                  <span className="w-1 h-6 bg-[#B82429] rounded-full mr-3"></span>
                  Your Details
                </h3>

                {apiError && (
                  <div className="mb-6 p-4 bg-[#3a1a1a] border border-[#B82429] rounded-md flex items-start">
                    <AlertCircle className="text-[#B82429] mr-3 mt-0.5 flex-shrink-0" size={18} />
                    <p className="text-[#f8d7d7] text-sm">{apiError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* First Name and Last Name side by side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm mb-2 text-[#cccccc] font-medium">
                        First Name <span className="text-[#B82429]">*</span>
                      </label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`bg-[#252525] border-[#333333] text-white h-14 focus:border-[#B82429] focus:ring-[#B82429] transition-all ${
                          errors.firstName ? "border-[#B82429]" : ""
                        }`}
                        placeholder="First Name"
                        autoComplete="given-name"
                      />
                      {errors.firstName && (
                        <p className="text-[#B82429] text-xs mt-1 flex items-center">
                          <span className="w-1 h-3 bg-[#B82429] rounded-full mr-1.5"></span>
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm mb-2 text-[#cccccc] font-medium">
                        Last Name <span className="text-[#B82429]">*</span>
                      </label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`bg-[#252525] border-[#333333] text-white h-14 focus:border-[#B82429] focus:ring-[#B82429] transition-all ${
                          errors.lastName ? "border-[#B82429]" : ""
                        }`}
                        placeholder="Last Name"
                        autoComplete="family-name"
                      />
                      {errors.lastName && (
                        <p className="text-[#B82429] text-xs mt-1 flex items-center">
                          <span className="w-1 h-3 bg-[#B82429] rounded-full mr-1.5"></span>
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Phone Number and Email side by side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm mb-2 text-[#cccccc] font-medium">
                        Phone Number <span className="text-[#B82429]">*</span>
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`bg-[#252525] border-[#333333] text-white h-14 focus:border-[#B82429] focus:ring-[#B82429] transition-all ${
                          errors.phone ? "border-[#B82429]" : ""
                        }`}
                        placeholder="04XXX XXX XXX"
                        autoComplete="tel"
                      />
                      {errors.phone && (
                        <p className="text-[#B82429] text-xs mt-1 flex items-center">
                          <span className="w-1 h-3 bg-[#B82429] rounded-full mr-1.5"></span>
                          {errors.phone}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm mb-2 text-[#cccccc] font-medium">
                        Email <span className="text-[#B82429]">*</span>
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`bg-[#252525] border-[#333333] text-white h-14 focus:border-[#B82429] focus:ring-[#B82429] transition-all ${
                          errors.email ? "border-[#B82429]" : ""
                        }`}
                        placeholder="your@email.com"
                        autoComplete="email"
                      />
                      {errors.email && (
                        <p className="text-[#B82429] text-xs mt-1 flex items-center">
                          <span className="w-1 h-3 bg-[#B82429] rounded-full mr-1.5"></span>
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Business Name */}
                  <div>
                    <label htmlFor="businessName" className="block text-sm mb-2 text-[#cccccc] font-medium">
                      Business Name <span className="text-[#B82429]">*</span>
                    </label>
                    <Input
                      id="businessName"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      className="bg-[#252525] border-[#333333] text-white h-14 focus:border-[#B82429] focus:ring-[#B82429] transition-all"
                      placeholder="Business Name (optional)"
                      autoComplete="organization"
                    />
                    {errors.businessName && (
                      <p className="text-[#B82429] text-xs mt-1 flex items-center">
                        <span className="w-1 h-3 bg-[#B82429] rounded-full mr-1.5"></span>
                        {errors.businessName}
                      </p>
                    )}
                  </div>

                  {/* Address with Google Maps Autocomplete */}
                  <div className="col-span-1 sm:col-span-2">
                    <label htmlFor="address" className="block text-sm mb-2 text-[#cccccc] font-medium">
                      Site Location / Address <span className="text-[#B82429]">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="address"
                        name="address"
                        value={addressInput}
                        onChange={(e) => handleAddressChange(e.target.value)}
                        className={`bg-[#252525] border-[#333333] text-white h-14 focus:border-[#B82429] focus:ring-[#B82429] transition-all ${
                          errors.address ? "border-[#B82429]" : isAddressValid ? "border-green-500" : ""
                        } ${isCalculatingDistance ? "pr-10" : ""}`}
                        placeholder="Type your address or select from suggestions..."
                        autoComplete="off"
                      />
                      {isCalculatingDistance && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <RotateCw className="h-5 w-5 animate-spin text-gray-400" />
                        </div>
                      )}
                      {isAddressValid && !isCalculatingDistance && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <MapPin className="h-5 w-5 text-green-500" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-[#999999] mt-1">
                      Type your address or select from suggestions for accurate delivery calculation
                    </p>
                    {!isAddressValid && formData.address.trim().length > 5 && !isCalculatingDistance && (
                      <button
                        type="button"
                        onClick={() => calculateDeliveryFee(formData.address)}
                        className="mt-2 text-xs flex items-center text-[#B82429] hover:text-[#9e1f23]"
                      >
                        <RotateCw className="h-3 w-3 mr-1" /> Calculate delivery for this address
                      </button>
                    )}

                    {/* Address suggestions dropdown */}
                    {showSuggestions && (
                      <div className="absolute z-10 w-full bg-[#252525] border border-[#333333] rounded-md mt-1 max-h-60 overflow-auto">
                        {addressSuggestions.map((suggestion) => (
                          <div
                            key={suggestion.place_id}
                            className="p-2 hover:bg-[#333333] cursor-pointer text-white"
                            onClick={() => handleSelectAddress(suggestion.place_id, suggestion.description)}
                          >
                            {suggestion.description}
                          </div>
                        ))}
                      </div>
                    )}

                    {errors.address && (
                      <p className="text-[#B82429] text-xs mt-1 flex items-center">
                        <span className="w-1 h-3 bg-[#B82429] rounded-full mr-1.5"></span>
                        {errors.address}
                      </p>
                    )}
                    {distance !== null && deliveryFee !== null && (
                      <div className="mt-2 text-xs text-[#cccccc]">
                        <p>Distance: {distance.toFixed(1)} km from our location</p>
                        <p>Delivery Fee: ${deliveryFee.toFixed(2)}</p>
                      </div>
                    )}
                  </div>

                  {/* State and Postal Code side by side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="state" className="block text-sm mb-2 text-[#cccccc] font-medium">
                        State <span className="text-[#B82429]">*</span>
                      </label>
                      <Select
                        value={formData.state}
                        onValueChange={(value) => {
                          setFormData((prev) => ({ ...prev, state: value }))
                          if (errors.state) {
                            setErrors((prev) => {
                              const newErrors = { ...prev }
                              delete newErrors.state
                              return newErrors
                            })
                          }
                        }}
                      >
                        <SelectTrigger
                          id="state"
                          className={`bg-[#252525] border-[#333333] text-white h-14 focus:border-[#B82429] focus:ring-[#B82429] transition-all ${
                            errors.state ? "border-[#B82429]" : ""
                          }`}
                        >
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NSW">NSW</SelectItem>
                          <SelectItem value="VIC">VIC</SelectItem>
                          <SelectItem value="QLD">QLD</SelectItem>
                          <SelectItem value="WA">WA</SelectItem>
                          <SelectItem value="SA">SA</SelectItem>
                          <SelectItem value="TAS">TAS</SelectItem>
                          <SelectItem value="ACT">ACT</SelectItem>
                          <SelectItem value="NT">NT</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.state && (
                        <p className="text-[#B82429] text-xs mt-1 flex items-center">
                          <span className="w-1 h-3 bg-[#B82429] rounded-full mr-1.5"></span>
                          {errors.state}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="postalCode" className="block text-sm mb-2 text-[#cccccc] font-medium">
                        Postal Code <span className="text-[#B82429]">*</span>
                      </label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className={`bg-[#252525] border-[#333333] text-white h-14 focus:border-[#B82429] focus:ring-[#B82429] transition-all ${
                          errors.postalCode ? "border-[#B82429]" : ""
                        }`}
                        placeholder="Postal Code"
                        autoComplete="postal-code"
                      />
                      {errors.postalCode && (
                        <p className="text-[#B82429] text-xs mt-1 flex items-center">
                          <span className="w-1 h-3 bg-[#B82429] rounded-full mr-1.5"></span>
                          {errors.postalCode}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Special Requirements */}
                  <div>
                    <label htmlFor="specialRequirements" className="block text-sm mb-2 text-[#cccccc] font-medium">
                      Notes/Special Requirements
                    </label>
                    <textarea
                      id="specialRequirements"
                      name="specialRequirements"
                      value={formData.specialRequirements}
                      onChange={handleChange}
                      className="w-full bg-[#252525] border-[#333333] text-white rounded-md min-h-[100px] p-3 focus:border-[#B82429] focus:ring-[#B82429] transition-all"
                      placeholder="Any special requirements or notes for your fencing project?"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#B82429] hover:bg-[#9e1f23] text-white py-6 rounded-md text-base font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:translate-y-[-2px]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        Submit Quote <ArrowRight className="ml-2 h-5 w-5" />
                      </span>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add CSS for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.5;
          }
          100% {
            transform: scale(1);
            opacity: 0.3;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
        }
        
        .animate-pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  )
}
