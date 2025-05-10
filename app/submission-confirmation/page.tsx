"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowLeft, Calculator } from "lucide-react"
import { motion } from "framer-motion"
import { format } from "date-fns"

export default function SubmissionConfirmation() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)

  // Extract data from URL parameters
  const customerId = searchParams.get("customerId") || "883930"
  const submissionDate = searchParams.get("submissionDate") || format(new Date(), "MMMM d, yyyy")
  const serviceType = searchParams.get("serviceType") || "hire"
  const fencingType = searchParams.get("fencingType") || "standard"
  const meters = searchParams.get("meters") || "520"
  const siteLocation = searchParams.get("siteLocation") || ""
  const startDate = searchParams.get("startDate") || ""
  const duration = searchParams.get("duration") || "2"
  const durationUnit = searchParams.get("durationUnit") || "weeks"
  const firstName = searchParams.get("firstName") || ""
  const lastName = searchParams.get("lastName") || ""
  const businessName = searchParams.get("businessName") || ""
  const notes = searchParams.get("notes") || ""

  // Map fencing type to the correct panel option
  const fencingTypeMap = {
    standard: "Premium Grade Heavy Duty",
    braced: "Builder's Temporary Smart Duty",
    pool: "Temporary Fence Pool Panels",
    crowd: "Crowd Control Barriers",
  }

  const fencePanelType = fencingTypeMap[fencingType as keyof typeof fencingTypeMap] || "Premium Grade Heavy Duty"

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  // Prepare field mappings for display
  const fieldMappings = [
    // Contact Information
    { label: "Business Name", value: businessName, ghlField: "contact.company_name" },
    { label: "First Name", value: firstName, ghlField: "contact.first_name" },
    { label: "Last Name", value: lastName, ghlField: "contact.last_name" },
    { label: "Contact Source", value: "Fencing Form", ghlField: "contact.source" },
    { label: "Street Address", value: siteLocation, ghlField: "contact.address1" },

    // Fencing Project Details
    { label: "Quote Type", value: serviceType === "hire" ? "Hire" : "Purchase", ghlField: "contact.quote_type" },
    { label: "Fence Panel Type", value: fencePanelType, ghlField: "contact.fence_panel_type" },
    { label: "Fencing Meters Required", value: meters, ghlField: "contact.fencing_meters_required" },

    // Hire Details (if applicable)
    ...(serviceType === "hire"
      ? [
          { label: "Hire Duration", value: duration, ghlField: "contact.hire_duration" },
          {
            label: "Duration Unit",
            value: durationUnit.charAt(0).toUpperCase() + durationUnit.slice(1),
            ghlField: "contact.duration_unit",
          },
          { label: "Start Date", value: startDate, ghlField: "contact.start_date" },
          { label: "Site Location / Address", value: siteLocation, ghlField: "contact.site_location_address" },
        ]
      : []),

    // Additional Information
    {
      label: "Notes/Special Requirements",
      value: notes || "None provided",
      ghlField: "contact.notesspecial_requirements",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {loading ? (
        <Card className="w-full max-w-xl shadow-lg">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-t-[#b82429] border-r-[#b82429] border-b-transparent border-l-transparent animate-spin"></div>
              <p className="text-lg font-medium text-gray-700">Processing your submission...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl"
        >
          <Card className="shadow-lg overflow-hidden">
            <CardHeader className="pb-4 space-y-1 bg-gradient-to-r from-[#b82429] to-[#d42f35] text-white">
              <CardTitle className="font-bold text-center" style={{ fontSize: "27px" }}>
                Submission Confirmed
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 bg-[#b82429]/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-10 w-10 text-[#b82429]" />
                </div>

                <h2 className="text-2xl font-bold mb-2 text-center">Thank You</h2>
                <p className="text-gray-600 text-center">Your fencing quote request has been submitted successfully.</p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">Submission Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-600">Customer ID:</span>
                      <span className="font-medium">{customerId}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-600">Submission Date:</span>
                      <span className="font-medium">{submissionDate}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">Quote Summary</h3>
                  <div className="space-y-2">
                    {fieldMappings.map(
                      (field, index) =>
                        field.value && (
                          <div key={index} className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-600">{field.label}:</span>
                            <span className="font-medium">{field.value}</span>
                          </div>
                        ),
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">What happens next?</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Our team will review your submission details</li>
                    <li>We'll contact you within 1-2 business days</li>
                    <li>We'll provide a detailed quote based on your requirements</li>
                    <li>Upon approval, we'll schedule your {serviceType === "hire" ? "delivery" : "installation"}</li>
                  </ol>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between p-4 bg-gray-50">
              <div className="w-full">
                <div className="grid grid-cols-2 gap-4">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
                    <Button
                      onClick={() => (window.location.href = "/")}
                      className="bg-[#b82429] hover:bg-[#a01f24] text-white w-full"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Return Home
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
                    <Button
                      onClick={() => console.log("Calculate costs")}
                      variant="outline"
                      className="border-[#b82429] text-[#b82429] hover:bg-[#b82429]/10 w-full"
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate Costs
                    </Button>
                  </motion.div>
                </div>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
