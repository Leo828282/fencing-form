"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  X,
  CheckCircle,
  ArrowRight,
  Footprints,
  Link,
  CornerRightDown,
  DollarSign,
  Truck,
  Shield,
  Info,
  Clock,
  Fence,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Poppins } from "next/font/google"

// Initialize the Poppins font
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

interface FormFillerModalProps {
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
  hireDuration: number
  durationUnit: string
  formatDuration: () => string
  formatPrice: (price: number) => string
}

export function FormFillerModal({
  onClose,
  itemsList,
  totalPrice,
  selectedOption,
  metersRequired,
  hireDuration,
  durationUnit,
  formatDuration,
  formatPrice,
}: FormFillerModalProps) {
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Load the GoHighLevel form in an iframe
  useEffect(() => {
    const iframe = document.createElement("iframe")
    iframe.src = "https://api.leadconnectorhq.com/widget/form/rxYMbGaZWJjlM3c0clDG"
    iframe.style.width = "0"
    iframe.style.height = "0"
    iframe.style.border = "none"
    iframe.style.position = "absolute"
    iframe.style.opacity = "0"
    iframe.style.pointerEvents = "none"
    iframe.id = "ghl-form-iframe"
    iframe.onload = () => {
      setIframeLoaded(true)
    }

    document.body.appendChild(iframe)
    iframeRef.current = iframe

    return () => {
      document.body.removeChild(iframe)
    }
  }, [])

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
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user selects
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

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
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    }

    if (!formData.address?.trim()) {
      newErrors.address = "Site location/address is required"
    }

    if (!formData.state) {
      newErrors.state = "State is required"
    }

    if (!formData.postalCode) {
      newErrors.postalCode = "Postal code is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Format the quote details as a string for the notes field
  const formatQuoteDetails = () => {
    return `
Option: ${selectedOption}
Meters Required: ${metersRequired}
${selectedOption === "hire" ? `Duration: ${formatDuration()}` : ""}
Total Price: $${formatPrice(totalPrice)}

Items:
${itemsList
  .filter((item) => !item.name.includes("Hire Duration") && !item.name.includes("Discount:"))
  .map(
    (item) =>
      `- ${item.name}: ${item.quantity} x ${item.priceDisplay || `$${(item.price / item.quantity).toFixed(2)}`}`,
  )
  .join("\n")}
`
  }

  // Fill the GoHighLevel form
  const fillCDVForm = () => {
    if (!iframeRef.current) return false

    try {
      const iframeDocument = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document
      if (!iframeDocument) return false

      // Find and fill the form fields
      // First Name
      const firstNameInput = iframeDocument.querySelector('input[placeholder*="First Name"]') as HTMLInputElement
      if (firstNameInput) firstNameInput.value = formData.firstName

      // Last Name
      const lastNameInput = iframeDocument.querySelector('input[placeholder*="Last Name"]') as HTMLInputElement
      if (lastNameInput) lastNameInput.value = formData.lastName

      // Phone
      const phoneInput = iframeDocument.querySelector('input[placeholder*="Phone"]') as HTMLInputElement
      if (phoneInput) phoneInput.value = formData.phone

      // Email
      const emailInput = iframeDocument.querySelector('input[placeholder*="Email"]') as HTMLInputElement
      if (emailInput) emailInput.value = formData.email

      // Business Name
      const businessNameInput = iframeDocument.querySelector('input[placeholder*="Business Name"]') as HTMLInputElement
      if (businessNameInput) businessNameInput.value = formData.businessName || ""

      // Site Location / Address
      const addressInput = iframeDocument.querySelector('input[placeholder*="Site Location"]') as HTMLInputElement
      if (addressInput) addressInput.value = formData.address

      // State
      const stateInput = iframeDocument.querySelector('input[placeholder*="State"]') as HTMLInputElement
      if (stateInput) stateInput.value = formData.state

      // Postal Code
      const postalCodeInput = iframeDocument.querySelector('input[placeholder*="Postal code"]') as HTMLInputElement
      if (postalCodeInput) postalCodeInput.value = formData.postalCode

      // Notes/Special Requirements
      const notesInput = iframeDocument.querySelector(
        'textarea[placeholder*="special requirements"]',
      ) as HTMLTextAreaElement
      if (notesInput) notesInput.value = formData.specialRequirements

      // Quote Type
      const quoteTypeSelect = iframeDocument.querySelector('select[name*="Quote Type"]') as HTMLSelectElement
      if (quoteTypeSelect) {
        const option = Array.from(quoteTypeSelect.options).find((opt) =>
          opt.text.toLowerCase().includes(selectedOption.toLowerCase()),
        )
        if (option) quoteTypeSelect.value = option.value
      }

      // Fence Panel Type
      const fencePanelTypeSelect = iframeDocument.querySelector('select[name*="Fence Panel Type"]') as HTMLSelectElement
      if (fencePanelTypeSelect) {
        // Find the panel type from the items list
        const panelItem = itemsList.find(
          (item) => item.category === "panels" || item.name.toLowerCase().includes("panel"),
        )
        if (panelItem) {
          const option = Array.from(fencePanelTypeSelect.options).find((opt) =>
            opt.text.toLowerCase().includes(panelItem.name.toLowerCase()),
          )
          if (option) fencePanelTypeSelect.value = option.value
        }
      }

      // Feet Option
      const feetOptionSelect = iframeDocument.querySelector('select[name*="Feet Option"]') as HTMLSelectElement
      if (feetOptionSelect) {
        // Find the feet option from the items list
        const feetItem = itemsList.find((item) => item.category === "feet" || item.name.toLowerCase().includes("feet"))
        if (feetItem) {
          const option = Array.from(feetOptionSelect.options).find((opt) =>
            opt.text.toLowerCase().includes(feetItem.name.toLowerCase()),
          )
          if (option) feetOptionSelect.value = option.value
        }
      }

      // Fencing Meters Required
      const metersInput = iframeDocument.querySelector('input[name*="Fencing Meters Required"]') as HTMLInputElement
      if (metersInput) metersInput.value = metersRequired.toString()

      // Hire Duration
      if (selectedOption === "hire") {
        const hireDurationInput = iframeDocument.querySelector('input[name*="Hire Duration"]') as HTMLInputElement
        if (hireDurationInput) hireDurationInput.value = hireDuration.toString()

        // Duration Unit
        const durationUnitSelect = iframeDocument.querySelector('select[name*="Duration Unit"]') as HTMLSelectElement
        if (durationUnitSelect) {
          const option = Array.from(durationUnitSelect.options).find((opt) =>
            opt.text.toLowerCase().includes(durationUnit.toLowerCase()),
          )
          if (option) durationUnitSelect.value = option.value
        }
      }

      // Total Price
      const totalPriceInput = iframeDocument.querySelector('input[name*="Total Price"]') as HTMLInputElement
      if (totalPriceInput) totalPriceInput.value = totalPrice.toString()

      // Number of Panels
      const panelsItem = itemsList.find((item) => item.category === "panels")
      if (panelsItem) {
        const panelsInput = iframeDocument.querySelector('input[name*="Number Of Panels"]') as HTMLInputElement
        if (panelsInput) panelsInput.value = panelsItem.quantity.toString()
      }

      // Number of Feet
      const feetItem = itemsList.find((item) => item.category === "feet")
      if (feetItem) {
        const feetInput = iframeDocument.querySelector('input[name*="Number Of Feet"]') as HTMLInputElement
        if (feetInput) feetInput.value = feetItem.quantity.toString()
      }

      // Number of Clamps
      const clampsItem = itemsList.find((item) => item.category === "connectors")
      if (clampsItem) {
        const clampsInput = iframeDocument.querySelector('input[name*="Number Of Clamps"]') as HTMLInputElement
        if (clampsInput) clampsInput.value = clampsItem.quantity.toString()
      }

      // Number of Braces
      const bracesItem = itemsList.find((item) => item.category === "supports")
      if (bracesItem) {
        const bracesInput = iframeDocument.querySelector('input[name*="Number Of Braces"]') as HTMLInputElement
        if (bracesInput) bracesInput.value = bracesItem.quantity.toString()
      }

      // Submit the form
      const submitButton = iframeDocument.querySelector('button[type="submit"]') as HTMLButtonElement
      if (submitButton) {
        submitButton.click()
        return true
      }

      return false
    } catch (error) {
      console.error("Error filling CDV form:", error)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Try to fill and submit the GoHighLevel form
      const success = fillCDVForm()

      if (success) {
        // Show success message
        setIsSubmitting(false)
        setShowSuccess(true)

        // Close the modal after showing success message
        setTimeout(() => {
          onClose()
        }, 1800)
      } else {
        throw new Error("Failed to submit form")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setIsSubmitting(false)
      alert("There was an error submitting your form. Please try again.")
    }
  }

  // Filter out items that are not directly part of the list
  const displayItems = itemsList.filter(
    (item) => !item.name.includes("Hire Duration") && !item.name.includes("Discount:"),
  )

  // Get icon for item
  const getItemIcon = (category?: string) => {
    switch (category) {
      case "panels":
        return <Fence size={16} className="mr-2 text-[#B82429]" />
      case "feet":
        return <Footprints size={16} className="mr-2 text-[#B82429]" />
      case "connectors":
        return <Link size={16} className="mr-2 text-[#B82429]" />
      case "supports":
        return <CornerRightDown size={16} className="mr-2 text-[#B82429]" />
      case "delivery":
        return <Truck size={16} className="mr-2 text-[#B82429]" />
      case "services":
        return <DollarSign size={16} className="mr-2 text-[#B82429]" />
      case "duration":
        return <Clock size={16} className="mr-2 text-[#B82429]" />
      case "discount":
        return <Info size={16} className="mr-2 text-[#B82429]" />
      case "insurance":
        return <Shield size={16} className="mr-2 text-[#B82429]" />
      default:
        return <Fence size={16} className="mr-2 text-[#B82429]" />
    }
  }

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 ${poppins.className}`}
      style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
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
            <form ref={formRef} onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                        <span className="font-medium text-white">{formatDuration()}</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-6 bg-[#252525] p-5 rounded-lg border border-[#333333]">
                    <div className="flex justify-between items-center">
                      <span className="text-[#cccccc] font-medium">Total:</span>
                      <span className="text-[#B82429] text-xl font-bold">${formatPrice(totalPrice)}</span>
                    </div>
                  </div>

                  <h4 className="font-bold mb-4 text-white flex items-center">
                    <span className="w-1 h-5 bg-[#B82429] rounded-full mr-3"></span>
                    Items Included:
                  </h4>
                  <div className="mb-6 overflow-visible bg-[#252525] rounded-lg border border-[#333333]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#333333]">
                          <th className="text-left py-3 px-4 font-medium text-[#cccccc]">Item</th>
                          <th className="text-right py-3 px-4 font-medium text-[#cccccc]">Qty</th>
                          <th className="text-right py-3 px-4 font-medium text-[#cccccc]">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayItems.map((item, index) => (
                          <tr
                            key={index}
                            className={`border-t border-[#333333] hover:bg-[#2a2a2a] transition-colors ${
                              index === displayItems.length - 1 ? "rounded-b-lg overflow-hidden" : ""
                            }`}
                          >
                            <td className="py-3 px-4 text-[#cccccc]">
                              <div className="flex items-center">
                                {getItemIcon(item.category)}
                                <span className="ml-2">{item.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-[#B82429]">{item.quantity}</td>
                            <td className="py-3 px-4 text-right text-[#cccccc]">
                              {item.isTBC ? (
                                <span>TBC</span>
                              ) : item.priceDisplay ? (
                                <span>
                                  {item.priceDisplay.includes("$") ? item.priceDisplay : `${item.priceDisplay}`}
                                </span>
                              ) : (
                                <span>${formatPrice(item.price)}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-[#252525] p-4 rounded-lg border border-[#333333] text-xs text-[#999999]">
                    By submitting this form, you agree to be contacted regarding your quote request. We'll use your
                    information to prepare a detailed quote for your fencing needs.
                  </div>
                </div>

                {/* Right side - Custom Form that matches GoHighLevel */}
                <div>
                  <h3 className="text-lg font-bold mb-6 text-white flex items-center">
                    <span className="w-1 h-6 bg-[#B82429] rounded-full mr-3"></span>
                    Your Details
                  </h3>
                  <div className="space-y-5">
                    {/* First Name and Last Name side by side */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2 text-[#cccccc] font-medium">
                          First Name <span className="text-[#B82429]">*</span>
                        </label>
                        <Input
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className={`bg-[#252525] border-[#333333] text-white h-14 focus:border-[#B82429] focus:ring-[#B82429] transition-all ${
                            errors.firstName ? "border-[#B82429]" : ""
                          }`}
                          placeholder="First Name"
                        />
                        {errors.firstName && (
                          <p className="text-[#B82429] text-xs mt-1 flex items-center">
                            <span className="w-1 h-3 bg-[#B82429] rounded-full mr-1.5"></span>
                            {errors.firstName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm mb-2 text-[#cccccc] font-medium">
                          Last Name <span className="text-[#B82429]">*</span>
                        </label>
                        <Input
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className={`bg-[#252525] border-[#333333] text-white h-14 focus:border-[#B82429] focus:ring-[#B82429] transition-all ${
                            errors.lastName ? "border-[#B82429]" : ""
                          }`}
                          placeholder="Last Name"
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2 text-[#cccccc] font-medium">
                          Phone Number <span className="text-[#B82429]">*</span>
                        </label>
                        <Input
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`bg-[#252525] border-[#333333] text-white h-14 focus:border-[#B82429] focus:ring-[#B82429] transition-all ${
                            errors.phone ? "border-[#B82429]" : ""
                          }`}
                          placeholder="04XXX XXX XXX"
                        />
                        {errors.phone && (
                          <p className="text-[#B82429] text-xs mt-1 flex items-center">
                            <span className="w-1 h-3 bg-[#B82429] rounded-full mr-1.5"></span>
                            {errors.phone}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm mb-2 text-[#cccccc] font-medium">
                          Email <span className="text-[#B82429]">*</span>
                        </label>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`bg-[#252525] border-[#333333] text-white h-14 focus:border-[#B82429] focus:ring-[#B82429] transition-all ${
                            errors.email ? "border-[#B82429]" : ""
                          }`}
                          placeholder="your@email.com"
                        />
                        {errors.email && (
                          <p className="text-[#B82429] text-xs mt-1 flex items-center">
                            <span className="w-1 h-3 bg-[#B82429] rounded-full mr-1.5"></span>
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm mb-2 text-[#cccccc] font-medium">Business Name</label>
                      <Input
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        className="bg-[#252525] border-[#333333] text-white h-14 focus:border-[#B82429] focus:ring-[#B82429] transition-all"
                        placeholder="Business Name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-2 text-[#cccccc] font-medium">
                        Site Location / Address <span className="text-[#B82429]">*</span>
                      </label>
                      <Input
                        name="address"
                        value={formData.address || ""}
                        onChange={handleChange}
                        className={`bg-[#252525] border-[#333333] text-white h-14 focus:border-[#B82429] focus:ring-[#B82429] transition-all ${
                          errors.address ? "border-[#B82429]" : ""
                        }`}
                        placeholder="123 Main St, Sydney NSW 2000"
                      />
                      {errors.address && (
                        <p className="text-[#B82429] text-xs mt-1 flex items-center">
                          <span className="w-1 h-3 bg-[#B82429] rounded-full mr-1.5"></span>
                          {errors.address}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2 text-[#cccccc] font-medium">
                          State <span className="text-[#B82429]">*</span>
                        </label>
                        <Select value={formData.state} onValueChange={(value) => handleSelectChange("state", value)}>
                          <SelectTrigger
                            className={`bg-[#252525] border-[#333333] text-white h-14 focus:border-[#B82429] focus:ring-[#B82429] transition-all ${
                              errors.state ? "border-[#B82429]" : ""
                            }`}
                          >
                            <SelectValue placeholder="State" />
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
                        <label className="block text-sm mb-2 text-[#cccccc] font-medium">
                          Postal code <span className="text-[#B82429]">*</span>
                        </label>
                        <Input
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleChange}
                          className={`bg-[#252525] border-[#333333] text-white h-14 focus:border-[#B82429] focus:ring-[#B82429] transition-all ${
                            errors.postalCode ? "border-[#B82429]" : ""
                          }`}
                          placeholder="Postal Code"
                        />
                        {errors.postalCode && (
                          <p className="text-[#B82429] text-xs mt-1 flex items-center">
                            <span className="w-1 h-3 bg-[#B82429] rounded-full mr-1.5"></span>
                            {errors.postalCode}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm mb-2 text-[#cccccc] font-medium">
                        Notes/Special Requirements
                      </label>
                      <Textarea
                        name="specialRequirements"
                        value={formData.specialRequirements}
                        onChange={handleChange}
                        className="bg-[#252525] border-[#333333] text-white min-h-[100px] focus:border-[#B82429] focus:ring-[#B82429] transition-all"
                        placeholder="Any special requirements or notes for your fencing Project?"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#B82429] hover:bg-[#9e1f23] text-white py-6 rounded-md text-base font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:translate-y-[-2px]"
                      disabled={isSubmitting || !iframeLoaded}
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
                      ) : !iframeLoaded ? (
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
                          Loading form...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          Submit Quote <ArrowRight className="ml-2 h-5 w-5" />
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Add CSS for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.5; }
          
          100% { transform: scale(1); opacity: 0.3; }
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

export default FormFillerModal
