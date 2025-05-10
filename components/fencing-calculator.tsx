"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  Mail,
  Phone,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  User,
  MessageSquare,
  Fence,
  Loader2,
  Edit,
  Ruler,
  MapPin,
  CalendarIcon,
  Clock,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { format, addDays, addWeeks, addMonths } from "date-fns"

export default function FencingCalculator() {
  const [serviceType, setServiceType] = useState<"hire" | "purchase" | null>(null)
  const [fencingType, setFencingType] = useState<string | null>(null)
  const [meters, setMeters] = useState<number>(520)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    businessName: "",
    email: "",
    phone: "",
    notes: "",
    siteLocation: "",
    startDate: "",
    duration: "30",
    durationUnit: "weeks",
  })
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [customerId, setCustomerId] = useState("883930")
  const calendarRef = useRef<HTMLDivElement>(null)

  // Calculate total steps based on service type
  const totalSteps = serviceType === "hire" ? 4 : 3

  // Calculate end date when start date or duration changes
  useEffect(() => {
    if (selectedDate) {
      const duration = Number.parseInt(formData.duration) || 0
      let newEndDate

      switch (formData.durationUnit) {
        case "days":
          newEndDate = addDays(selectedDate, duration)
          break
        case "weeks":
          newEndDate = addWeeks(selectedDate, duration)
          break
        case "months":
          newEndDate = addMonths(selectedDate, duration)
          break
        default:
          newEndDate = addDays(selectedDate, duration)
      }

      setEndDate(newEndDate)

      // Update the startDate in formData
      setFormData((prev) => ({
        ...prev,
        startDate: format(selectedDate, "yyyy-MM-dd"),
      }))
    } else {
      setEndDate(undefined)
    }
  }, [selectedDate, formData.duration, formData.durationUnit])

  // Close calendar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleLocationChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      siteLocation: value,
    }))
  }

  const handleDurationSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData((prev) => ({
      ...prev,
      duration: value,
    }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  // Get max duration based on unit
  const getMaxDuration = () => {
    switch (formData.durationUnit) {
      case "days":
        return 730 // 2 years in days
      case "weeks":
        return 104 // 2 years in weeks
      case "months":
        return 24 // 2 years in months
      default:
        return 104
    }
  }

  // Get duration percentage for slider gradient
  const getDurationPercentage = () => {
    const max = getMaxDuration()
    const current = Number.parseInt(formData.duration) || 0
    return (current / max) * 100
  }

  // Replace the handleFormSubmit function with this updated version that uses the webhook
  const handleFormSubmit = () => {
    // Set loading state
    setIsSubmitting(true)

    // Prepare the form data for the webhook
    const webhookFormData = {
      // Contact information
      firstName: formData.firstName,
      lastName: formData.lastName,
      businessName: formData.businessName,
      email: formData.email,
      phone: formData.phone,

      // Address information
      siteLocation: formData.siteLocation,

      // Service details
      serviceType: serviceType,
      fencingType: fencingType,
      fencingMeters: meters.toString(),

      // Hire-specific details
      startDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
      duration: formData.duration,
      durationUnit: formData.durationUnit,

      // Additional information
      notes: formData.notes,

      // Source information
      source: "Fencing Calculator",
      submittedAt: new Date().toISOString(),
    }

    console.log("Submitting form data to webhook:", webhookFormData)

    // Send data to our webhook endpoint
    fetch("/api/submit-to-webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        formData: webhookFormData,
      }),
    })
      .then(async (response) => {
        const responseText = await response.text()
        console.log("API Response:", responseText)

        if (!response.ok) {
          throw new Error(`Failed to submit form: ${responseText}`)
        }

        try {
          return JSON.parse(responseText)
        } catch (e) {
          console.error("Error parsing JSON response:", e)
          throw new Error("Invalid response format")
        }
      })
      .then((data) => {
        // Set customer ID from response
        const customerId = data.customerId || Math.floor(100000 + Math.random() * 900000).toString()

        // Map fencing type to the correct panel option
        const fencingTypeMap = {
          standard: "Premium Grade Heavy Duty",
          braced: "Builder's Temporary Smart Duty",
          pool: "Temporary Fence Pool Panels",
          crowd: "Crowd Control Barriers",
        }

        const fencePanelType = fencingTypeMap[fencingType as keyof typeof fencingTypeMap] || "Premium Grade Heavy Duty"

        // Build the URL with query parameters
        const params = new URLSearchParams({
          customerId: customerId,
          submissionDate: format(new Date(), "MMMM d, yyyy"),
          serviceType: serviceType || "",
          fencingType: fencingType || "",
          meters: meters.toString(),
          siteLocation: formData.siteLocation,
          startDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
          duration: formData.duration,
          durationUnit: formData.durationUnit,
          firstName: formData.firstName,
          lastName: formData.lastName,
          businessName: formData.businessName,
          notes: formData.notes || "",
        })

        // Redirect to the confirmation page
        window.location.href = `/submission-confirmation?${params.toString()}`
      })
      .catch((error) => {
        console.error("Error submitting form:", error)

        // Handle error state
        alert(`There was an error submitting your form: ${error.message}. Please try again.`)
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const nextStep = () => {
    if (step < totalSteps) {
      setIsAnimating(true)
      setTimeout(() => {
        setStep(step + 1)
        setIsAnimating(false)
      }, 300)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setIsAnimating(true)
      setTimeout(() => {
        setStep(step - 1)
        setIsAnimating(false)
      }, 300)
    }
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    setMeters(value >= 0 && value <= 800 ? value : meters)
  }

  const handleServiceTypeChange = (type: "hire" | "purchase") => {
    setServiceType(type)
    // If changing from hire to purchase and we're on the hire details step,
    // move back to the fencing details step
    if (type === "purchase" && step === 3) {
      setStep(2)
    }
  }

  const getStepIcon = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return <User className="h-5 w-5" />
      case 2:
        return <Fence className="h-5 w-5" />
      case 3:
        return serviceType === "hire" ? <CalendarIcon className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />
      case 4:
        return <MessageSquare className="h-5 w-5" />
      default:
        return null
    }
  }

  const isStepComplete = (stepNumber: number) => {
    if (stepNumber > step) return false

    switch (stepNumber) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.phone && formData.businessName
      case 2:
        return serviceType !== null && fencingType !== null
      case 3:
        if (serviceType === "hire") {
          return formData.siteLocation !== "" && selectedDate !== undefined
        }
        return true // Notes are optional
      case 4:
        return true // Notes are optional
      default:
        return false
    }
  }

  return (
    <Card className="max-w-md w-full mx-auto bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
      <CardHeader className="pb-4 space-y-1 bg-gradient-to-r from-[#b82429] to-[#d42f35] text-white">
        <CardTitle className="font-bold text-center" style={{ fontSize: "27px" }}>
          Request A Free Quote
        </CardTitle>
      </CardHeader>

      <div className="flex justify-between px-6 py-2 bg-gray-50 border-b border-gray-200">
        {[...Array(totalSteps)].map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <motion.div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step === i + 1
                  ? "bg-[#b82429] text-white"
                  : step > i + 1 && isStepComplete(i + 1)
                    ? "bg-[#b82429] text-white"
                    : "bg-gray-200 text-gray-500"
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {step > i + 1 && isStepComplete(i + 1) ? <CheckCircle className="h-4 w-4" /> : getStepIcon(i + 1)}
            </motion.div>
            {i < totalSteps - 1 && (
              <motion.div
                className={`h-1 w-16 mt-1 ${step > i + 1 ? "bg-[#b82429]" : "bg-gray-200"}`}
                initial={{ width: 0 }}
                animate={{ width: "4rem" }}
                transition={{ delay: i * 0.1 + 0.2 }}
              ></motion.div>
            )}
          </div>
        ))}
      </div>

      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {formSubmitted ? (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center py-4"
            >
              <div className="w-16 h-16 bg-[#b82429]/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-[#b82429]" />
              </div>

              <h2 className="text-2xl font-bold mb-6 text-center">Thank You</h2>

              <div className="w-full">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Customer ID:</span>
                  <span className="font-medium">{customerId}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Submission Date:</span>
                  <span className="font-medium">{format(new Date(), "MMMM d, yyyy")}</span>
                </div>

                <div className="mt-4 mb-6 text-gray-700">
                  Our team will review your submission and contact you shortly to discuss the next steps.
                </div>

                <div className="border-t border-gray-200 pt-4 mt-2">
                  <h3 className="font-semibold mb-3">What happens next?</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Our team will review your submission details</li>
                    <li>We'll contact you to verify information and discuss terms</li>
                  </ol>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {step === 1 && (
                <div className="space-y-5">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-[#b82429]/10 rounded-full">
                      <User className="h-6 w-6 text-[#b82429]" />
                    </div>
                    <div className="text-sm text-gray-500">
                      Please provide your contact information so we can get back to you.
                    </div>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                        First Name <span className="text-[#b82429]">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                        className="border border-gray-300 rounded focus:border-[#b82429] focus:ring-[#b82429]"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                        Last Name <span className="text-[#b82429]">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                        className="border border-gray-300 rounded focus:border-[#b82429] focus:ring-[#b82429]"
                        required
                      />
                    </div>
                  </div>

                  {/* Email and Phone Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email Address <span className="text-[#b82429]">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="you@example.com"
                          className="pl-10 border border-gray-300 rounded focus:border-[#b82429] focus:ring-[#b82429]"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        Phone Number <span className="text-[#b82429]">*</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+61 XXX XXX XXX"
                          className="pl-10 border border-gray-300 rounded focus:border-[#b82429] focus:ring-[#b82429]"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Business Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="businessName" className="text-sm font-medium text-gray-700">
                      Business Name <span className="text-[#b82429]">*</span>
                    </Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      placeholder="Your Company"
                      className="border border-gray-300 rounded focus:border-[#b82429] focus:ring-[#b82429]"
                      required
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-[#b82429]/10 rounded-full">
                      <Fence className="h-6 w-6 text-[#b82429]" />
                    </div>
                    <div className="text-sm text-gray-500">Tell us about your fencing requirements.</div>
                  </div>

                  {/* Service Type Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Service Type <span className="text-[#b82429]">*</span>
                    </Label>
                    <div className="flex gap-3">
                      <motion.div className="w-1/2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="button"
                          variant="outline"
                          className={`w-full h-11 border-2 transition-all ${serviceType === "hire" ? "border-[#b82429] bg-[#b82429]/10 text-[#b82429] font-medium" : "border-gray-300 hover:border-[#b82429] hover:text-[#b82429]"}`}
                          onClick={() => handleServiceTypeChange("hire")}
                        >
                          Hire
                        </Button>
                      </motion.div>
                      <motion.div className="w-1/2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="button"
                          variant="outline"
                          className={`w-full h-11 border-2 transition-all ${serviceType === "purchase" ? "border-[#b82429] bg-[#b82429]/10 text-[#b82429] font-medium" : "border-gray-300 hover:border-[#b82429] hover:text-[#b82429]"}`}
                          onClick={() => handleServiceTypeChange("purchase")}
                        >
                          Purchase
                        </Button>
                      </motion.div>
                    </div>
                  </div>

                  {/* Fencing Type Selection - Text Only */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Fencing Type <span className="text-[#b82429]">*</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "standard", name: "Standard Construction" },
                        { id: "braced", name: "Standard Braced" },
                        { id: "pool", name: "Pool Fencing" },
                        { id: "crowd", name: "Crowd Control" },
                      ].map((fence) => (
                        <motion.div
                          key={fence.id}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className={`relative rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                            fencingType === fence.id
                              ? "border-[#b82429] bg-[#b82429]/5 text-[#b82429]"
                              : "border-gray-300 hover:border-[#b82429]/50"
                          }`}
                          onClick={() => setFencingType(fence.id)}
                        >
                          <div className="p-3 text-center h-12 flex items-center justify-center">
                            <span className="text-sm font-medium">{fence.name}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Meters Input and Slider */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center" htmlFor="meters">
                      <Ruler className="h-4 w-4 mr-1 text-[#b82429]" />
                      Meters of Linear Fencing Required
                    </Label>
                    <motion.div
                      className="rounded-lg overflow-hidden shadow-sm"
                      whileHover={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                    >
                      {/* Input and slider container */}
                      <div className="border border-gray-300 rounded-lg bg-white p-4">
                        <div className="mb-3">
                          <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm hover:border-[#b82429] focus-within:ring-2 focus-within:ring-[#b82429] focus-within:border-[#b82429] transition-all w-full">
                            <Edit className="h-4 w-4 text-[#b82429] mr-2" />
                            <input
                              type="number"
                              min="0"
                              max="800"
                              value={meters}
                              onChange={handleSliderChange}
                              className="text-xl font-semibold text-center w-full bg-transparent border-0 focus:ring-0 p-0"
                              aria-label="Meters of fencing"
                            />
                            <span className="text-lg ml-1 text-gray-700">M</span>
                          </div>
                        </div>

                        <style jsx>{`
                          .custom-range {
                            -webkit-appearance: none;
                            width: 100%;
                            height: 10px;
                            border-radius: 5px;
                            background: #e2e2e2;
                            outline: none;
                            margin: 10px 0;
                          }
                          
                          .custom-range::-webkit-slider-thumb {
                            -webkit-appearance: none;
                            appearance: none;
                            width: 24px;
                            height: 24px;
                            border-radius: 50%;
                            background: #b82429;
                            border: 2px solid #ffffff;
                            cursor: pointer;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                            margin-top: -7px;
                            transition: all 0.2s ease;
                          }
                          
                          .custom-range::-webkit-slider-thumb:hover {
                            transform: scale(1.1);
                            box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
                          }
                          
                          .custom-range::-moz-range-thumb {
                            width: 24px;
                            height: 24px;
                            border-radius: 50%;
                            background: #b82429;
                            border: 2px solid #ffffff;
                            cursor: pointer;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                            transition: all 0.2s ease;
                          }
                          
                          .custom-range::-moz-range-thumb:hover {
                            transform: scale(1.1);
                            box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
                          }
                          
                          .custom-range::-webkit-slider-runnable-track {
                            background: linear-gradient(to right, #b82429 0%, #b82429 ${meters / 8}%, #e2e2e2 ${meters / 8}%, #e2e2e2 100%);
                            height: 10px;
                            border-radius: 5px;
                          }
                          
                          .custom-range:focus {
                            outline: none;
                          }
                          
                          .custom-range:focus::-webkit-slider-runnable-track {
                            background: linear-gradient(to right, #a01f24 0%, #a01f24 ${meters / 8}%, #d4d4d4 ${meters / 8}%, #d4d4d4 100%);
                          }
                        `}</style>
                        <input
                          type="range"
                          min="0"
                          max="800"
                          step="1"
                          value={meters}
                          onChange={handleSliderChange}
                          className="custom-range"
                          aria-label="Meters of fencing required"
                        />

                        <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                          <span>0m</span>
                          <span className="text-[#b82429] font-medium">{meters}m</span>
                          <span>800m</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}

              {/* Hire Details Step */}
              {step === 3 && serviceType === "hire" && (
                <div className="space-y-5">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-[#b82429]/10 rounded-full">
                      <CalendarIcon className="h-6 w-6 text-[#b82429]" />
                    </div>
                    <div className="text-sm text-gray-500">Please provide details about your hire requirements.</div>
                  </div>

                  {/* Site Location */}
                  <div className="space-y-1.5">
                    <Label htmlFor="siteLocation" className="text-sm font-medium text-gray-700 flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-[#b82429]" />
                      Site Location / Address <span className="text-[#b82429] ml-1">*</span>
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="siteLocation"
                        value={formData.siteLocation}
                        onChange={(e) => handleLocationChange(e.target.value)}
                        placeholder="Enter site address"
                        className="pl-10 border border-gray-300 rounded focus:border-[#b82429] focus:ring-[#b82429]"
                        required
                      />
                    </div>
                  </div>

                  {/* Calendar Section - Dropdown Style */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700 flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1 text-[#b82429]" />
                      Select Start Date <span className="text-[#b82429] ml-1">*</span>
                    </Label>

                    <div className="relative">
                      <div
                        className="flex items-center justify-between p-3 border border-gray-300 rounded-md cursor-pointer hover:border-[#b82429]"
                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                      >
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className={selectedDate ? "font-medium" : "text-gray-500"}>
                            {selectedDate ? format(selectedDate, "dd MMMM yyyy") : "Pick a date"}
                          </span>
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 text-gray-400 transition-transform ${isCalendarOpen ? "rotate-90" : ""}`}
                        />
                      </div>

                      {isCalendarOpen && (
                        <div
                          ref={calendarRef}
                          className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg"
                        >
                          <style jsx global>{`
                            .rdp {
                              --rdp-cell-size: 40px;
                              --rdp-accent-color: #b82429;
                              --rdp-background-color: rgba(184, 36, 41, 0.1);
                              margin: 0;
                              width: 100%;
                            }
                            .rdp-months {
                              justify-content: center;
                              width: 100%;
                            }
                            .rdp-month {
                              width: 100%;
                            }
                            .rdp-table {
                              width: 100%;
                            }
                            .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
                              background-color: #b82429;
                              color: white;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                            }
                            .rdp-button {
                              display: flex;
                              align-items: center;
                              justify-content: center;
                            }
                            .rdp-cell {
                              text-align: center;
                            }
                            .rdp-day_in_range {
                              background-color: rgba(184, 36, 41, 0.1);
                              color: #b82429;
                            }
                            .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
                              background-color: rgba(184, 36, 41, 0.05);
                            }
                          `}</style>

                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                              setSelectedDate(date)
                              setIsCalendarOpen(false)
                            }}
                            className="p-3"
                            disabled={{ before: new Date() }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Duration Selector with Slider */}
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-700 flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-[#b82429]" />
                        Duration
                      </Label>

                      <Select
                        value={formData.durationUnit}
                        onValueChange={(value) => handleSelectChange("durationUnit", value)}
                      >
                        <SelectTrigger className="h-8 min-h-0 text-sm border-gray-300 bg-white w-[100px]">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="weeks">Weeks</SelectItem>
                          <SelectItem value="months">Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <motion.div
                      className="rounded-lg overflow-hidden shadow-sm"
                      whileHover={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                    >
                      <div className="border border-gray-300 rounded-lg bg-white p-4">
                        <div className="mb-3">
                          <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm hover:border-[#b82429] focus-within:ring-2 focus-within:ring-[#b82429] focus-within:border-[#b82429] transition-all w-full">
                            <Clock className="h-4 w-4 text-[#b82429] mr-2" />
                            <input
                              type="number"
                              min="1"
                              max={getMaxDuration()}
                              value={formData.duration}
                              onChange={handleDurationSliderChange}
                              className="text-xl font-semibold text-center w-full bg-transparent border-0 focus:ring-0 p-0"
                              aria-label="Duration"
                            />
                            <span className="text-lg ml-1 text-gray-700">{formData.durationUnit}</span>
                          </div>
                        </div>

                        <style jsx>{`
                          .duration-range {
                            -webkit-appearance: none;
                            width: 100%;
                            height: 10px;
                            border-radius: 5px;
                            background: #e2e2e2;
                            outline: none;
                            margin: 10px 0;
                          }
                          
                          .duration-range::-webkit-slider-thumb {
                            -webkit-appearance: none;
                            appearance: none;
                            width: 24px;
                            height: 24px;
                            border-radius: 50%;
                            background: #b82429;
                            border: 2px solid #ffffff;
                            cursor: pointer;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                            margin-top: -7px;
                            transition: all 0.2s ease;
                          }
                          
                          .duration-range::-webkit-slider-thumb:hover {
                            transform: scale(1.1);
                            box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
                          }
                          
                          .duration-range::-moz-range-thumb {
                            width: 24px;
                            height: 24px;
                            border-radius: 50%;
                            background: #b82429;
                            border: 2px solid #ffffff;
                            cursor: pointer;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                            transition: all 0.2s ease;
                          }
                          
                          .duration-range::-moz-range-thumb:hover {
                            transform: scale(1.1);
                            box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
                          }
                          
                          .duration-range::-webkit-slider-runnable-track {
                            background: linear-gradient(to right, #b82429 0%, #b82429 ${getDurationPercentage()}%, #e2e2e2 ${getDurationPercentage()}%, #e2e2e2 100%);
                            height: 10px;
                            border-radius: 5px;
                          }
                          
                          .duration-range:focus {
                            outline: none;
                          }
                          
                          .duration-range:focus::-webkit-slider-runnable-track {
                            background: linear-gradient(to right, #a01f24 0%, #a01f24 ${getDurationPercentage()}%, #d4d4d4 ${getDurationPercentage()}%, #d4d4d4 100%);
                          }
                        `}</style>

                        <input
                          type="range"
                          min="1"
                          max={getMaxDuration()}
                          step="1"
                          value={formData.duration}
                          onChange={handleDurationSliderChange}
                          className="duration-range"
                          aria-label="Duration"
                        />
                      </div>
                    </motion.div>

                    {/* Helpful Tips */}
                    <div className="flex items-start p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                      <div className="mr-2 mt-0.5 text-red-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      </div>
                      <div>
                        <p>
                          Select a start date on the calendar and set your desired duration. The highlighted area shows
                          your hire period.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes Step - This is step 3 for purchase and step 4 for hire */}
              {((step === 3 && serviceType === "purchase") || step === 4) && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-[#b82429]/10 rounded-full">
                      <MessageSquare className="h-6 w-6 text-[#b82429]" />
                    </div>
                    <div className="text-sm text-gray-500">
                      Please provide any additional information that might help us understand your needs better.
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                      Additional Notes
                    </Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Enter any additional requirements or notes"
                      className="min-h-[150px] border border-gray-300 rounded focus:border-[#b82429] focus:ring-[#b82429]"
                    />
                  </div>

                  <motion.div
                    className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Summary</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-gray-500">Name:</span>
                        <span className="font-medium">
                          {formData.firstName} {formData.lastName}
                        </span>
                      </li>
                      {formData.businessName && (
                        <li className="flex justify-between">
                          <span className="text-gray-500">Business:</span>
                          <span className="font-medium">{formData.businessName}</span>
                        </li>
                      )}
                      <li className="flex justify-between">
                        <span className="text-gray-500">Service Type:</span>
                        <span className="font-medium capitalize">{serviceType || "Not selected"}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-500">Fencing Type:</span>
                        <span className="font-medium capitalize">{fencingType || "Not selected"}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-500">Length Required:</span>
                        <span className="font-medium">{meters} M</span>
                      </li>
                      {serviceType === "hire" && (
                        <>
                          <li className="flex justify-between">
                            <span className="text-gray-500">Site Location:</span>
                            <span className="font-medium">{formData.siteLocation}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-500">Start Date:</span>
                            <span className="font-medium">
                              {selectedDate ? format(selectedDate, "dd MMM yyyy") : "Not selected"}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-500">Duration:</span>
                            <span className="font-medium">
                              {formData.duration} {formData.durationUnit}
                            </span>
                          </li>
                        </>
                      )}
                    </ul>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      <CardFooter className="flex items-center justify-between p-4 bg-gray-50 border-t border-gray-200">
        {formSubmitted ? (
          <div className="w-full">
            <div className="grid grid-cols-2 gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
                <Button
                  onClick={() => {
                    setFormSubmitted(false)
                    setStep(1)
                  }}
                  className="bg-[#b82429] hover:bg-[#a01f24] text-white w-full"
                >
                  Return to Home
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
                <Button
                  onClick={() => console.log("Calculate costs")}
                  variant="outline"
                  className="border-[#b82429] text-[#b82429] hover:bg-[#b82429]/10 w-full"
                >
                  Calculate Costs
                </Button>
              </motion.div>
            </div>
          </div>
        ) : (
          <>
            {/* Back button */}
            {step > 1 && (
              <Button
                onClick={prevStep}
                variant="outline"
                className="border-[#b82429] text-[#b82429] hover:bg-[#b82429]/5"
                size="sm"
                disabled={isAnimating}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}

            {/* Spacer div to push the next button to the right when there's no back button */}
            {step === 1 && <div></div>}

            {/* Next/Submit button */}
            <Button
              onClick={step < totalSteps ? nextStep : handleFormSubmit}
              className="bg-[#b82429] hover:bg-[#a01f24] text-white shadow-sm"
              size="sm"
              disabled={
                isAnimating ||
                isSubmitting ||
                (step === 1 &&
                  (!formData.firstName ||
                    !formData.lastName ||
                    !formData.email ||
                    !formData.phone ||
                    !formData.businessName)) ||
                (step === 2 && (!serviceType || !fencingType)) ||
                (step === 3 && serviceType === "hire" && (!formData.siteLocation || !selectedDate))
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Submitting...
                </>
              ) : step < totalSteps ? (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
