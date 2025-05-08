"use client"

import type React from "react"
import { useState } from "react"
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Textarea } from "@nextui-org/react"
import { submitQuoteToCDV } from "@/app/actions"
import { toast } from "react-hot-toast"

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  address: string
  city: string
  state: string
  zip: string
  message: string
  quoteDetails: {
    selectedOption: string
    selectedFenceType: string
    selectedFeetOption: string
    metersRequired: string
    hireDuration: string
    durationUnit: string
    totalPrice: number
    items: {
      name: string
      quantity: number
      price: number
      priceDisplay: string
      category: string
    }[]
  }
}

interface CustomCDVFormProps {
  isOpen: boolean
  onClose: () => void
  totalPrice: number
  itemsList: {
    name: string
    quantity: number
    price: number
    priceDisplay: string
    category: string
  }[]
  metersRequired: string
  hireDuration: string
  durationUnit: string
}

const CustomCDVForm: React.FC<CustomCDVFormProps> = ({
  isOpen,
  onClose,
  totalPrice,
  itemsList,
  metersRequired,
  hireDuration,
  durationUnit,
}) => {
  const [formData, setFormData] = useState<Omit<FormData, "quoteDetails">>({
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

  const [selectedOption, setSelectedOption] = useState<string>("purchase")
  const [selectedFenceType, setSelectedFenceType] = useState<string | null>("builders")
  const [selectedFeetOption, setSelectedFeetOption] = useState<string | null>("feet")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      !formData.zip
    ) {
      toast.error("Please fill in all required fields.")
      return false
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address.")
      return false
    }

    // Basic phone validation (numbers only)
    const phoneRegex = /^[0-9]+$/
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Please enter a valid phone number (numbers only).")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare the data for submission
      const submissionData: FormData = {
        ...formData,
        quoteDetails: {
          selectedOption,
          selectedFenceType: selectedFenceType || "builders",
          selectedFeetOption: selectedFeetOption || "feet",
          metersRequired,
          hireDuration,
          durationUnit,
          totalPrice,
          items: itemsList.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            priceDisplay: item.priceDisplay,
            category: item.category,
          })),
        },
      }

      // Submit the data to CDV via server action
      const result = await submitQuoteToCDV(submissionData)

      if (result.success) {
        // Show success message
        setIsSubmitting(false)
        setShowSuccess(true)

        // Close the modal after showing success message
        setTimeout(() => {
          onClose()
        }, 1800)
      } else {
        console.error("Form submission error:", result.error)
        alert(`Error submitting form: ${result.error || "Unknown error"}`)
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setIsSubmitting(false)
      alert(`There was an error submitting your form: ${(error as Error).message || "Unknown error"}`)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} backdrop="blur">
      <ModalContent>
        {(close) => (
          <form onSubmit={handleSubmit}>
            <ModalHeader className="flex flex-col gap-1">Request a Quote</ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  isRequired
                  type="text"
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
                <Input
                  isRequired
                  type="text"
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Input
                  isRequired
                  type="email"
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <Input
                  isRequired
                  type="tel"
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mt-4">
                <Input
                  type="text"
                  label="Company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mt-4">
                <Input
                  isRequired
                  type="text"
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Input
                  isRequired
                  type="text"
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                />
                <Input
                  isRequired
                  type="text"
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mt-4">
                <Input
                  isRequired
                  type="text"
                  label="Zip Code"
                  name="zip"
                  value={formData.zip}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mt-4">
                <Textarea label="Message" name="message" value={formData.message} onChange={handleInputChange} />
              </div>

              {/* Hidden fields for quote details */}
              <input type="hidden" name="metersRequired" value={metersRequired} />
              <input type="hidden" name="hireDuration" value={hireDuration} />
              <input type="hidden" name="durationUnit" value={durationUnit} />
              <input type="hidden" name="totalPrice" value={totalPrice} />
              {itemsList.map((item, index) => (
                <div key={index}>
                  <input type="hidden" name={`items[${index}][name]`} value={item.name} />
                  <input type="hidden" name={`items[${index}][quantity]`} value={item.quantity} />
                  <input type="hidden" name={`items[${index}][price]`} value={item.price} />
                  <input type="hidden" name={`items[${index}][priceDisplay]`} value={item.priceDisplay} />
                  <input type="hidden" name={`items[${index}][category]`} value={item.category} />
                </div>
              ))}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={close}>
                Close
              </Button>
              <Button color="primary" type="submit" isLoading={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  )
}

export default CustomCDVForm
