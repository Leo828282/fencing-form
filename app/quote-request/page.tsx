"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Lato } from "next/font/google"
import { Fence, Footprints, Link, CornerRightDown, DollarSign, Truck, Shield, Clock, Info } from "lucide-react"

// Initialize the Lato font
const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-lato",
})

export default function QuoteRequestPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dataFetchedRef = useRef(false)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [quoteDetails, setQuoteDetails] = useState({
    itemsList: [],
    totalPrice: 0,
    selectedOption: "purchase",
    metersRequired: "10",
    hireDuration: "1",
    durationUnit: "weeks",
    selectedFenceType: "builders",
    selectedFeetOption: "feet",
  })
  const [dataLoaded, setDataLoaded] = useState(false)
  const [dataError, setDataError] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Add this function to update the slider background
  const updateSliderTrail = (e) => {
    const slider = e.target
    const min = Number.parseFloat(slider.min) || 0
    const max = Number.parseFloat(slider.max) || 100
    const value = Number.parseFloat(slider.value)
    const percentage = ((value - min) / (max - min)) * 100

    // Create gradient background with red up to the thumb position
    slider.style.background = `linear-gradient(to right, #b82429 0%, #b82429 ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`
  }

  // Add useEffect to initialize sliders when component mounts
  useEffect(() => {
    if (dataLoaded) {
      // Find all range inputs and initialize their backgrounds
      const sliders = document.querySelectorAll('input[type="range"]')
      sliders.forEach((slider) => {
        updateSliderTrail({ target: slider })

        // Add event listeners
        slider.addEventListener("input", updateSliderTrail)
      })

      // Cleanup function to remove event listeners
      return () => {
        sliders.forEach((slider) => {
          slider.removeEventListener("input", updateSliderTrail)
        })
      }
    }
  }, [dataLoaded])

  // Add this function inside the component, before the return statement
  function updateSliderBackground(e) {
    const slider = e.target
    const min = slider.min || 0
    const max = slider.max || 100
    const value = slider.value
    const percentage = ((value - min) / (max - min)) * 100
    slider.style.background = `linear-gradient(to right, #b82429 0%, #b82429 ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`
  }

  // Load quote details from URL params - only run once
  useEffect(() => {
    // If we've already fetched the data, don't do it again
    if (dataFetchedRef.current) return

    try {
      const encodedData = searchParams.get("data")

      // If no data parameter is provided, redirect to calculator
      if (!encodedData) {
        console.error("No data parameter found in URL")
        setDataError(true)
        return
      }

      // First try to decode the URI component
      let decodedString
      try {
        decodedString = decodeURIComponent(encodedData)
      } catch (decodeError) {
        console.error("Error decoding URI component:", decodeError)
        setDataError(true)
        return
      }

      // Then try to parse the JSON
      try {
        const decodedData = JSON.parse(decodedString)
        setQuoteDetails(decodedData)
        setDataLoaded(true)
        // Mark that we've fetched the data
        dataFetchedRef.current = true
      } catch (parseError) {
        console.error("Error parsing JSON data:", parseError)
        setDataError(true)
      }
    } catch (error) {
      console.error("Error processing quote data:", error)
      setDataError(true)
    }
  }, [searchParams]) // Only depend on searchParams, not router

  // Handle redirect if there's an error
  useEffect(() => {
    if (dataError) {
      // Use a timeout to avoid immediate redirect which could cause issues
      const timeoutId = setTimeout(() => {
        router.push("/")
      }, 1500) // Increased timeout to give user time to see the error message
      return () => clearTimeout(timeoutId)
    }
  }, [dataError, router])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const validateForm = () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.zip ||
      !termsAccepted
    ) {
      alert("Please fill in all required fields and accept the terms and conditions.")
      return false
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address.")
      return false
    }

    // Basic phone validation (numbers only)
    const phoneRegex = /^[0-9]+$/
    if (!phoneRegex.test(formData.phone)) {
      alert("Please enter a valid phone number (numbers only).")
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare the data for submission
      const submissionData = {
        ...formData,
        quoteDetails: {
          selectedOption: quoteDetails.selectedOption,
          selectedFenceType: quoteDetails.selectedFenceType,
          selectedFeetOption: quoteDetails.selectedFeetOption,
          metersRequired: quoteDetails.metersRequired,
          hireDuration: quoteDetails.hireDuration,
          durationUnit: quoteDetails.durationUnit,
          totalPrice: quoteDetails.totalPrice,
          items: quoteDetails.itemsList,
        },
      }

      // Simulate API call (replace with actual API call)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Show success message
      setIsSubmitting(false)
      setShowSuccess(true)

      // Redirect back to calculator after showing success message
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (error) {
      console.error("Error submitting form:", error)
      alert(`There was an error submitting your form: ${error.message || "Unknown error"}`)
      setIsSubmitting(false)
    }
  }

  // Format price with commas for thousands
  const formatPrice = (price) => {
    return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  // Handle return to calculator
  const handleReturn = () => {
    router.push("/")
  }

  // Get fence type display name
  const getFenceTypeDisplayName = (fenceType) => {
    switch (fenceType) {
      case "builders":
        return "Builder's Temporary Smart Duty Panels"
      case "premium":
        return "Premium Grade Heavy Duty Panels"
      case "pool":
        return "Temporary Fence Pool Panels"
      case "crowd":
        return "Crowd Control Barriers"
      default:
        return "Fence Panels"
    }
  }

  // Get feet option display name
  const getFeetOptionDisplayName = (feetOption) => {
    switch (feetOption) {
      case "feet":
        return "Premium Plastic Temporary Fencing Feet"
      case "hookStay":
        return "Hook Stay"
      default:
        return "Fencing Feet"
    }
  }

  // Get item icon based on item category
  const getItemIcon = (itemName, category) => {
    switch (category) {
      case "panels":
        return <Fence size={16} className="mr-2 text-[#b82429]" />
      case "feet":
        return <Footprints size={16} className="mr-2 text-[#b82429]" />
      case "connectors":
        return <Link size={16} className="mr-2 text-[#b82429]" />
      case "supports":
        return <CornerRightDown size={16} className="mr-2 text-[#b82429]" />
      case "delivery":
        return <Truck size={16} className="mr-2 text-[#b82429]" />
      case "services":
        return <DollarSign size={16} className="mr-2 text-[#b82429]" />
      case "duration":
        return <Clock size={16} className="mr-2 text-[#b82429]" />
      case "discount":
        return <Info size={16} className="mr-2 text-[#b82429]" />
      case "insurance":
        return <Shield size={16} className="mr-2 text-[#b82429] fill-[#f8d7d9]" />
      default:
        // Fallback based on item name for backward compatibility
        if (itemName.includes("Panel") || itemName.includes("Builders")) {
          return <Fence size={16} className="mr-2 text-[#b82429]" />
        } else if (itemName.includes("Feet") || itemName.includes("feet")) {
          return <Footprints size={16} className="mr-2 text-[#b82429]" />
        } else if (itemName.includes("Stay") || itemName.includes("Brace")) {
          return <CornerRightDown size={16} className="mr-2 text-[#b82429]" />
        } else if (itemName.includes("Clamp")) {
          return <Link size={16} className="mr-2 text-[#b82429]" />
        } else if (itemName.includes("Delivery")) {
          return <Truck size={16} className="mr-2 text-[#b82429]" />
        } else if (itemName.includes("Installation")) {
          return <DollarSign size={16} className="mr-2 text-[#b82429]" />
        }
        return <Fence size={16} className="mr-2 text-[#b82429]" />
    }
  }

  // If data is not loaded yet, show loading
  if (!dataLoaded && !dataError) {
    return (
      <div className={`w-full min-h-screen ${lato.className}`} style={{ backgroundColor: "#F1EFEA" }}>
        <div className="w-full p-3 py-6">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4 pb-2 border-b border-gray-100">
              <h2 className="font-bold text-xl">Request a Quote</h2>
            </div>
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b82429] mx-auto mb-4"></div>
              <p>Loading quote details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If there was an error, this will show briefly before redirecting
  if (dataError) {
    return (
      <div className={`w-full min-h-screen ${lato.className}`} style={{ backgroundColor: "#F1EFEA" }}>
        <div className="w-full p-3 py-6">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4 pb-2 border-b border-gray-100">
              <h2 className="font-bold text-xl">Request a Quote</h2>
            </div>
            <div className="p-6 text-center">
              <div className="text-red-500 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium mb-2">Error Loading Quote Data</p>
              <p className="mb-4">Unable to load quote details. Redirecting back to calculator...</p>
              <Button
                onClick={handleReturn}
                className="bg-[#b82429] hover:bg-[#9e1f23] text-white py-2 px-4 text-sm font-medium rounded-md"
              >
                Return to Calculator Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full min-h-screen ${lato.className}`} style={{ backgroundColor: "#F8F8F8" }}>
      <style jsx>{`
        /* Styling for range inputs */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
-radius: 5px;
          background: #e2e8f0; /* Default gray background */
          outline: none;
        }

        /* Webkit browsers (Chrome, Safari) */
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #b82429;
          cursor: pointer;
          margin-top: -6px; /* Centers the thumb on the track */
        }

        /* Firefox */
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #b82429;
          cursor: pointer;
          border: none;
        }

        input[type="range"]::-moz-range-progress {
          background: #b82429;
          height: 6px;
          border-radius: 5px;
        }

        /* Edge/IE */
        input[type="range"]::-ms-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #b82429;
          cursor: pointer;
        }

        input[type="range"]::-ms-fill-lower {
          background: #b82429;
          border
      `}</style>
      <div className="w-full p-3 py-6">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
          {showSuccess ? (
            <div className="text-center p-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-lg font-medium mb-2">Quote Request Submitted Successfully!</p>
              <p className="mb-4">You will be redirected back to the calculator...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center mb-4 pb-2 border-b border-gray-100">
                <h2 className="font-bold text-xl">Request a Quote</h2>
              </div>
              <form id="quote-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Personal Details */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#b82429] focus:ring-[#b82429] sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#b82429] focus:ring-[#b82429] sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#b82429] focus:ring-[#b82429] sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#b82429] focus:ring-[#b82429] sm:text-sm"
                    required
                  />
                </div>

                {/* Company Details */}
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#b82429] focus:ring-[#b82429] sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#b82429] focus:ring-[#b82429] sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#b82429] focus:ring-[#b82429] sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    State *
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#b82429] focus:ring-[#b82429] sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="zip" className="block text-sm font-medium text-gray-700">
                    Zip *
                  </label>
                  <input
                    type="text"
                    id="zip"
                    name="zip"
                    value={formData.zip}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#b82429] focus:ring-[#b82429] sm:text-sm"
                    required
                  />
                </div>

                {/* Message */}
                <div className="md:col-span-2">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#b82429] focus:ring-[#b82429] sm:text-sm"
                  />
                </div>

                {/* Quote Details */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Quote Summary</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Item
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Quantity
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Price
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {quoteDetails.itemsList.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getItemIcon(item.name, item.category)}
                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{item.quantity}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="text-sm text-gray-500">${formatPrice(item.price * item.quantity)}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Fence Details */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Fence Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="fenceType" className="block text-sm font-medium text-gray-700">
                        Fence Type
                      </label>
                      <input
                        type="text"
                        id="fenceType"
                        name="fenceType"
                        value={getFenceTypeDisplayName(quoteDetails.selectedFenceType)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#b82429] focus:ring-[#b82429] sm:text-sm"
                        readOnly
                      />
                    </div>
                    <div>
                      <label htmlFor="feetOption" className="block text-sm font-medium text-gray-700">
                        Feet Option
                      </label>
                      <input
                        type="text"
                        id="feetOption"
                        name="feetOption"
                        value={getFeetOptionDisplayName(quoteDetails.selectedFeetOption)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#b82429] focus:ring-[#b82429] sm:text-sm"
                        readOnly
                      />
                    </div>
                    <div>
                      <label htmlFor="metersRequired" className="block text-sm font-medium text-gray-700">
                        Meters Required
                      </label>
                      <input
                        type="range"
                        id="metersRequired"
                        name="metersRequired"
                        min="10"
                        max="200"
                        step="1"
                        value={quoteDetails.metersRequired}
                        onChange={(e) => {
                          setQuoteDetails({ ...quoteDetails, metersRequired: e.target.value })
                          updateSliderBackground(e)
                        }}
                        className="mt-2"
                      />
                      <div className="text-sm text-gray-500">{quoteDetails.metersRequired} meters</div>
                    </div>
                    <div>
                      <label htmlFor="hireDuration" className="block text-sm font-medium text-gray-700">
                        Hire Duration
                      </label>
                      <div className="flex items-center">
                        <input
                          type="range"
                          id="hireDuration"
                          name="hireDuration"
                          min="1"
                          max="52"
                          step="1"
                          value={quoteDetails.hireDuration}
                          onChange={(e) => {
                            setQuoteDetails({ ...quoteDetails, hireDuration: e.target.value })
                            updateSliderBackground(e)
                          }}
                          className="mt-2"
                        />
                        <select
                          id="durationUnit"
                          name="durationUnit"
                          value={quoteDetails.durationUnit}
                          onChange={(e) => setQuoteDetails({ ...quoteDetails, durationUnit: e.target.value })}
                          className="ml-2 mt-1 block rounded-md border-gray-300 shadow-sm focus:border-[#b82429] focus:ring-[#b82429] sm:text-sm"
                        >
                          <option value="weeks">Weeks</option>
                          <option value="months">Months</option>
                        </select>
                      </div>
                      <div className="text-sm text-gray-500">
                        {quoteDetails.hireDuration} {quoteDetails.durationUnit}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Section */}
                <div className="flex justify-between items-center py-3 mb-0 border-t border-gray-200 mt-1">
                  <span className="font-semibold text-gray-900">Total (Incl. GST)</span>
                  <span className="font-semibold text-xl text-[#b82429]">${formatPrice(quoteDetails.totalPrice)}</span>
                </div>

                {/* Terms and Conditions */}
                <div className="md:col-span-2 flex items-center">
                  <input
                    type="checkbox"
                    id="terms"
                    name="terms"
                    className="h-4 w-4 text-[#b82429] focus:ring-[#b82429] border-gray-300 rounded"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    required
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                    I agree to the{" "}
                    <a href="#" className="text-[#b82429]">
                      terms and conditions
                    </a>{" "}
                    *
                  </label>
                </div>

                {/* Disclaimer as a simple text note */}
                <div className="mt-3 p-3 text-xs text-gray-500 bg-white rounded-lg shadow-sm border-t border-gray-100">
                  <p>
                    This calculation is a guide only and based on the limited information provided, excluding any fees
                    or charges. It does not constitute a formal quote, nor a suggestion or recommendation of any
                    product.
                  </p>
                </div>

                {/* Bottom Buttons - Outside the grid to span full width */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 w-full">
                  <Button
                    type="button"
                    onClick={handleReturn}
                    className="bg-[#b82429] hover:bg-[#9e1f23] text-white py-4 px-6 text-base font-medium rounded-md w-full flex items-center justify-center"
                  >
                    Return to Calculator
                  </Button>
                  <Button
                    type="submit"
                    form="quote-form"
                    disabled={isSubmitting}
                    className="border-2 border-[#b82429] text-[#b82429] bg-white hover:bg-gray-50 py-4 px-6 text-base font-medium rounded-md w-full flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#b82429] mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      "Submit Quote Request"
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
