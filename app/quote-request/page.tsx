"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Grid,
  Footprints,
  LinkIcon,
  CornerRightDown,
  DollarSign,
  Truck,
  Shield,
  Clock,
  Info,
  ArrowLeft,
  User,
  MapPin,
  FileText,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"

export default function QuoteRequestPage() {
  // Existing state and functions...
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
    state: "NSW", // Default state
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

  // All the existing useEffect hooks and functions...
  // Load quote details from URL params - only run once
  useEffect(() => {
    // If we've already fetched the data, don't do it again
    if (dataFetchedRef.current) return

    try {
      const encodedData = searchParams.get("data")

      // If no data parameter is provided, try to load from localStorage
      if (!encodedData) {
        console.log("No data parameter found in URL, trying localStorage")
        const savedConfig = localStorage.getItem("fencingCalculatorConfig")

        if (savedConfig) {
          const config = JSON.parse(savedConfig)

          // Try to load itemsList from localStorage if available
          let itemsList = []
          try {
            const calculatorState = localStorage.getItem("calculatorState")
            if (calculatorState) {
              const parsedState = JSON.parse(calculatorState)
              itemsList = parsedState.itemsList || []
            }
          } catch (e) {
            console.error("Error loading items from localStorage:", e)
          }

          setQuoteDetails({
            itemsList: itemsList,
            totalPrice: config.totalCost || 0,
            selectedOption: config.selectedOption || "purchase",
            metersRequired: config.metersRequired || 10,
            hireDuration: config.hireDuration || 1,
            durationUnit: config.durationUnit || "weeks",
            selectedFenceType: config.selectedFenceType || "builders",
            selectedFeetOption: config.selectedFeetOption || "feet",
          })
          setDataLoaded(true)
          dataFetchedRef.current = true
          return
        } else {
          setDataError(true)
          return
        }
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
        console.log("Decoded data:", decodedData) // Debug log

        // Handle both old and new data formats
        const formattedData = {
          itemsList: decodedData.itemsList || [],
          totalPrice: decodedData.totalCost || decodedData.totalPrice || 0,
          selectedOption: decodedData.purchaseOption || decodedData.selectedOption || "purchase",
          metersRequired: decodedData.metersRequired || 10,
          hireDuration: decodedData.hireDuration || 1,
          durationUnit: decodedData.durationUnit || "weeks",
          selectedFenceType: decodedData.fenceType || decodedData.selectedFenceType || "builders",
          selectedFeetOption: decodedData.accessoryType || decodedData.selectedFeetOption || "feet",
        }

        console.log("Formatted data:", formattedData) // Debug log
        setQuoteDetails(formattedData)
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
        router.push("/calculator")
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

      console.log("Submitting data:", submissionData) // Debug log

      // Simulate API call (replace with actual API call)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Show success message
      setIsSubmitting(false)
      setShowSuccess(true)

      // Redirect back to calculator after showing success message
      setTimeout(() => {
        router.push("/calculator")
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
    router.push("/calculator")
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
        return <Grid size={16} className="mr-2 text-[#b82429]" />
      case "feet":
        return <Footprints size={16} className="mr-2 text-[#b82429]" />
      case "connectors":
        return <LinkIcon size={16} className="mr-2 text-[#b82429]" />
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
        if (itemName?.includes("Panel") || itemName?.includes("Builders")) {
          return <Grid size={16} className="mr-2 text-[#b82429]" />
        } else if (itemName?.includes("Feet") || itemName?.includes("feet")) {
          return <Footprints size={16} className="mr-2 text-[#b82429]" />
        } else if (itemName?.includes("Stay") || itemName?.includes("Brace")) {
          return <CornerRightDown size={16} className="mr-2 text-[#b82429]" />
        } else if (itemName?.includes("Clamp")) {
          return <LinkIcon size={16} className="mr-2 text-[#b82429]" />
        } else if (itemName?.includes("Delivery")) {
          return <Truck size={16} className="mr-2 text-[#b82429]" />
        } else if (itemName?.includes("Installation")) {
          return <DollarSign size={16} className="mr-2 text-[#b82429]" />
        }
        return <Grid size={16} className="mr-2 text-[#b82429]" />
    }
  }

  // If data is not loaded yet, show loading
  if (!dataLoaded && !dataError) {
    return (
      <div className="w-full min-h-screen font-sans" style={{ backgroundColor: "white" }}>
        <div className="container mx-auto p-6 py-12">
          <h1 className="font-heading text-4xl font-semibold text-center mb-4">Request a Quote</h1>
          <div className="text-center mb-8">
            <Link href="/calculator" className="text-[#b82429]">
              I have it figured out calculate my costs →
            </Link>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm max-w-2xl mx-auto">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b82429]"></div>
            </div>
            <p className="text-center mt-4">Loading quote details...</p>
          </div>
        </div>
      </div>
    )
  }

  // If there was an error, this will show briefly before redirecting
  if (dataError) {
    return (
      <div className="w-full min-h-screen font-sans" style={{ backgroundColor: "white" }}>
        <div className="container mx-auto p-6 py-12">
          <h1 className="font-heading text-4xl font-semibold text-center mb-4">Request a Quote</h1>
          <div className="text-center mb-8">
            <Link href="/calculator" className="text-[#b82429]">
              I have it figured out calculate my costs →
            </Link>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm max-w-2xl mx-auto">
            <div className="text-red-500 flex justify-center mb-4">
              <AlertCircle size={48} />
            </div>
            <p className="text-lg font-medium text-center mb-2">Error Loading Quote Data</p>
            <p className="text-center mb-4">Unable to load quote details. Redirecting back to calculator...</p>
            <div className="flex justify-center">
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
    <div className="w-full min-h-screen font-sans" style={{ backgroundColor: "white" }}>
      {showSuccess ? (
        <div className="container mx-auto p-6 py-12">
          <h1 className="font-heading text-4xl font-semibold text-center mb-4">Quote Submitted</h1>

          <div className="bg-white p-8 md:p-12 rounded-lg shadow-sm max-w-3xl mx-auto">
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-green-100 mb-6 animate-bounce-slow">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-2 text-[#b82429]">THANK YOU!</h2>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Your Quote Request Has Been Submitted</h3>
              <div className="w-24 h-1 bg-[#b82429] rounded-full mb-6"></div>
            </div>

            {/* Quote Summary */}
            <div className="bg-gray-50 p-6 rounded-lg mb-8 max-w-2xl mx-auto border border-gray-100">
              <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <FileText size={20} className="mr-2 text-[#b82429]" />
                Quote Summary
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-4 rounded-md border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Fence Type</p>
                  <p className="font-medium text-gray-800">{getFenceTypeDisplayName(quoteDetails.selectedFenceType)}</p>
                </div>
                <div className="bg-white p-4 rounded-md border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Option</p>
                  <p className="font-medium text-gray-800">
                    {quoteDetails.selectedOption === "purchase" ? "Purchase" : "Hire"}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-md border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Length Required</p>
                  <p className="font-medium text-gray-800">{quoteDetails.metersRequired}m</p>
                </div>
                <div className="bg-white p-4 rounded-md border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Total Price</p>
                  <p className="font-medium text-[#b82429]">${formatPrice(quoteDetails.totalPrice)}</p>
                </div>
              </div>

              <div className="text-center text-sm text-gray-500">
                Quote reference: #
                {Math.floor(Math.random() * 10000)
                  .toString()
                  .padStart(4, "0")}
                -{new Date().getFullYear()}
              </div>
            </div>

            <div className="text-center space-y-4">
              <p className="text-gray-700 text-lg">
                We've received your request and our team will review your quote details promptly.
              </p>
              <p className="text-gray-700 font-medium">
                A confirmation has been sent to <span className="text-[#b82429]">{formData.email}</span>
              </p>
              <p className="text-gray-700">
                We'll be in touch within 24 hours to discuss your requirements and finalize your quote.
              </p>

              <div className="pt-6">
                <Button
                  onClick={() => router.push("/calculator")}
                  className="bg-[#b82429] hover:bg-[#9e1f23] text-white py-3 px-6 text-base font-medium rounded-md"
                >
                  Return to Calculator
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto p-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Left Column - Quote Summary */}
            <div>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full">
                {/* Header */}
                <div className="border-b border-gray-200 p-6">
                  <h2 className="font-heading text-xl font-semibold text-gray-900">Quote Summary</h2>
                </div>

                <div className="p-6">
                  {/* Quote Details Section */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Option</span>
                      <span className="font-medium text-gray-900">
                        {quoteDetails.selectedOption === "purchase" ? "Purchase" : "Hire"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Fence Type</span>
                      <span className="font-medium text-gray-900 text-right max-w-[60%]">
                        {getFenceTypeDisplayName(quoteDetails.selectedFenceType)}
                      </span>
                    </div>

                    <div className="flex items-start justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Feet Option</span>
                      <span className="font-medium text-gray-900 text-right max-w-[60%]">
                        {getFeetOptionDisplayName(quoteDetails.selectedFeetOption)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Meters Required</span>
                      <span className="font-medium text-gray-900">{quoteDetails.metersRequired}m</span>
                    </div>
                  </div>

                  {/* Item List Section */}
                  <div className="mb-6">
                    <h3 className="font-heading text-base font-medium text-gray-900 mb-4">Item List</h3>

                    {Array.isArray(quoteDetails.itemsList) && quoteDetails.itemsList.length > 0 ? (
                      <div className="border border-gray-200 rounded-md overflow-hidden">
                        <div className="grid grid-cols-[auto_50px_90px] text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-200">
                          <div className="p-3">Item</div>
                          <div className="p-3 text-center">Qty</div>
                          <div className="p-3 text-right">Price</div>
                        </div>
                        <div>
                          {quoteDetails.itemsList
                            .filter((item) => !item.name.includes("Hire Duration") && !item.name.includes("Discount:"))
                            .map((item, index) => (
                              <div
                                key={index}
                                className={`grid grid-cols-[auto_50px_90px] items-center border-b border-gray-200 last:border-b-0 ${
                                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                }`}
                              >
                                <div className="p-3 text-sm flex items-center">
                                  {getItemIcon(item.name, item.category)}
                                  {item.name}
                                </div>
                                <div className="p-3 text-center text-sm">{item.quantity}</div>
                                <div className="p-3 pr-4 text-right text-sm">
                                  {item.isTBC
                                    ? "TBC"
                                    : item.priceDisplay
                                      ? item.priceDisplay
                                      : `$${item.price.toFixed(2)}`}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-md text-center text-gray-500">
                        <p>No items to display. Please return to calculator.</p>
                      </div>
                    )}
                  </div>

                  {/* Total Section */}
                  <div className="flex justify-between items-center py-2 border-t border-gray-200 mt-0">
                    <span className="font-heading font-semibold text-gray-900">Total (Incl. GST)</span>
                    <span className="font-heading font-semibold text-xl text-[#b82429]">
                      ${formatPrice(quoteDetails.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div>
              <form id="quote-form" onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="font-heading text-xl font-semibold mb-4 text-gray-900 flex items-center">
                    <User size={20} className="mr-2 text-[#b82429]" />
                    Personal Information
                  </h2>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        required
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="border border-gray-200 rounded-md h-10 w-full bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        required
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="border border-gray-200 rounded-md h-10 w-full bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="border border-gray-200 rounded-md h-10 w-full bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <Input
                        required
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="border border-gray-200 rounded-md h-10 w-full bg-white"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Company</label>
                    <Input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="border border-gray-200 rounded-md h-10 w-full bg-white"
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="font-heading text-xl font-semibold mb-4 text-gray-900 flex items-center">
                    <MapPin size={20} className="mr-2 text-[#b82429]" />
                    Address Information
                  </h2>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="border border-gray-200 rounded-md h-10 w-full bg-white"
                      placeholder="Street address"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <Input
                        required
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="border border-gray-200 rounded-md h-10 w-full bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <Input
                        required
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="border border-gray-200 rounded-md h-10 w-full bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Zip Code <span className="text-red-500">*</span>
                      </label>
                      <Input
                        required
                        type="text"
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        className="border border-gray-200 rounded-md h-10 w-full bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="font-heading text-xl font-semibold mb-4 text-gray-900 flex items-center">
                    <FileText size={20} className="mr-2 text-[#b82429]" />
                    Additional Information
                  </h2>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Special Requirements or Notes
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={3}
                      className="border border-gray-200 rounded-md w-full text-sm bg-white"
                      placeholder="Please provide any additional information that might help us with your quote..."
                    />
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={() => setTermsAccepted(!termsAccepted)}
                        required
                        className="w-4 h-4 border border-[#b82429] rounded bg-red-50 focus:ring-3 focus:ring-red-300 accent-[#b82429]"
                      />
                    </div>
                    <label htmlFor="terms" className="ml-2 text-xs font-medium text-gray-600">
                      I agree to the{" "}
                      <a href="#" className="text-[#b82429] hover:underline">
                        terms and conditions
                      </a>
                    </label>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Bottom Buttons - Outside the grid to span full width */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 w-full">
            <Button
              type="button"
              onClick={handleReturn}
              className="bg-[#b82429] hover:bg-[#9e1f23] text-white py-4 px-[34px] text-base font-medium rounded-md w-full flex items-center justify-center"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Return to Calculator
            </Button>
            <Button
              type="submit"
              form="quote-form"
              disabled={isSubmitting}
              className="border-2 border-[#b82429] text-[#b82429] bg-white hover:bg-gray-50 py-4 px-[34px] text-base font-medium rounded-md w-full flex items-center justify-center"
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

          {/* Single set of pagination dots */}
          <div className="flex justify-center space-x-2 mt-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i === 4 ? "bg-[#b82429]" : "bg-gray-300"}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
