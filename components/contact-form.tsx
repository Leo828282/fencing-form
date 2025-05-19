"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronDown } from "lucide-react"

// Form validation schema
const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required" }),
  company: z.string().optional(),
  email: z.string().email({ message: "Valid email address is required" }),
  contactNumber: z.string().min(5, { message: "Contact number is required" }),
  inquiryType: z.enum(["purchase", "hire"], {
    required_error: "Please select Purchase or Hire",
  }),
  hireDuration: z
    .string()
    .optional()
    .refine(
      (val) => {
        // If inquiryType is hire, hireDuration is required
        return true
      },
      { message: "Hire duration is required for hire inquiries" },
    ),
  meters: z.string().min(1, { message: "Meters of fencing required" }),
  message: z.string().min(5, { message: "Message is required" }),
})

type FormValues = z.infer<typeof formSchema>

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  // Watch the inquiry type to conditionally render fields
  const watchInquiryType = watch("inquiryType")

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    setSubmitError("")

    try {
      // Use our API route
      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || `Error: ${response.status}`)
      }

      setSubmitSuccess(true)
      reset() // Clear the form

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false)
      }, 5000)
    } catch (error) {
      console.error("Submission error:", error)
      setSubmitError(
        error instanceof Error ? error.message : "There was a problem submitting your enquiry. Please try again.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const fontStyle = { fontFamily: "'Open Sans', sans-serif" }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <input
              type="text"
              placeholder="Full Name*"
              {...register("fullName")}
              className="w-full p-4 bg-gray-100 border-0 focus:outline-none focus:ring-1 focus:ring-[#b82429] text-gray-700 font-medium"
              style={fontStyle}
            />
            {errors.fullName && (
              <p className="text-[#b82429] text-sm mt-1 font-medium" style={fontStyle}>
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="text"
              placeholder="Company"
              {...register("company")}
              className="w-full p-4 bg-gray-100 border-0 focus:outline-none focus:ring-1 focus:ring-[#b82429] text-gray-700 font-medium"
              style={fontStyle}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <input
              type="email"
              placeholder="Email Address*"
              {...register("email")}
              className="w-full p-4 bg-gray-100 border-0 focus:outline-none focus:ring-1 focus:ring-[#b82429] text-gray-700 font-medium"
              style={fontStyle}
            />
            {errors.email && (
              <p className="text-[#b82429] text-sm mt-1 font-medium" style={fontStyle}>
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="tel"
              placeholder="Contact Number*"
              {...register("contactNumber")}
              className="w-full p-4 bg-gray-100 border-0 focus:outline-none focus:ring-1 focus:ring-[#b82429] text-gray-700 font-medium"
              style={fontStyle}
            />
            {errors.contactNumber && (
              <p className="text-[#b82429] text-sm mt-1 font-medium" style={fontStyle}>
                {errors.contactNumber.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <select
              {...register("inquiryType")}
              className="w-full p-4 bg-gray-100 border-0 focus:outline-none focus:ring-1 focus:ring-[#b82429] text-gray-700 appearance-none pr-10 font-medium"
              style={fontStyle}
              defaultValue=""
            >
              <option value="" disabled>
                Select Purchase or Hire
              </option>
              <option value="purchase">Purchase</option>
              <option value="hire">Hire</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </div>
            {errors.inquiryType && (
              <p className="text-[#b82429] text-sm mt-1 font-medium" style={fontStyle}>
                {errors.inquiryType.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="text"
              placeholder="Meters of Fencing Required*"
              {...register("meters")}
              className="w-full p-4 bg-gray-100 border-0 focus:outline-none focus:ring-1 focus:ring-[#b82429] text-gray-700 font-medium"
              style={fontStyle}
            />
            {errors.meters && (
              <p className="text-[#b82429] text-sm mt-1 font-medium" style={fontStyle}>
                {errors.meters.message}
              </p>
            )}
          </div>
        </div>

        {watchInquiryType === "hire" && (
          <div>
            <input
              type="text"
              placeholder="Hire Duration*"
              {...register("hireDuration")}
              className="w-full p-4 bg-gray-100 border-0 focus:outline-none focus:ring-1 focus:ring-[#b82429] text-gray-700 font-medium"
              style={fontStyle}
            />
            {errors.hireDuration && (
              <p className="text-[#b82429] text-sm mt-1 font-medium" style={fontStyle}>
                {errors.hireDuration.message}
              </p>
            )}
          </div>
        )}

        <div>
          <textarea
            placeholder="Message*"
            {...register("message")}
            rows={6}
            className="w-full p-4 bg-gray-100 border-0 focus:outline-none focus:ring-1 focus:ring-[#b82429] text-gray-700 resize-none font-medium"
            style={fontStyle}
          />
          {errors.message && (
            <p className="text-[#b82429] text-sm mt-1 font-medium" style={fontStyle}>
              {errors.message.message}
            </p>
          )}
        </div>

        <div className="flex justify-end mt-3 w-full">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#b82429] hover:bg-[#a01e22] text-white py-3 px-8 transition-colors duration-200 w-full font-semibold"
            style={fontStyle}
          >
            {isSubmitting ? "Submitting..." : "Submit Enquiry"}
          </button>
        </div>

        {submitSuccess && (
          <div className="p-3 bg-green-100 text-green-700 font-medium" style={fontStyle}>
            Thank you for your enquiry! We'll get back to you soon.
          </div>
        )}

        {submitError && (
          <div className="p-3 bg-red-100 text-[#b82429] font-medium" style={fontStyle}>
            {submitError}
          </div>
        )}
      </form>
    </div>
  )
}
