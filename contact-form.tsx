"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

// Form validation schema
const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required" }),
  company: z.string().optional(),
  email: z.string().email({ message: "Valid email address is required" }),
  contactNumber: z.string().min(5, { message: "Contact number is required" }),
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
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    setSubmitError("")

    try {
      // Use our API route instead of directly calling the webhook
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

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Full Name*"
              {...register("fullName")}
              className="w-full p-3 rounded bg-[#f0f4f8] border border-[#e1e8ef] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <input
              type="text"
              placeholder="Company"
              {...register("company")}
              className="w-full p-3 rounded bg-[#f0f4f8] border border-[#e1e8ef] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="email"
              placeholder="Email Address*"
              {...register("email")}
              className="w-full p-3 rounded bg-[#f0f4f8] border border-[#e1e8ef] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <input
              type="tel"
              placeholder="Contact Number*"
              {...register("contactNumber")}
              className="w-full p-3 rounded bg-[#f0f4f8] border border-[#e1e8ef] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber.message}</p>}
          </div>
        </div>

        <div>
          <textarea
            placeholder="Message*"
            {...register("message")}
            rows={6}
            className="w-full p-3 rounded bg-[#f0f4f8] border border-[#e1e8ef] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#003087] hover:bg-[#002266] text-white font-medium py-3 px-8 rounded transition-colors duration-200"
          >
            {isSubmitting ? "Submitting..." : "Submit Enquiry"}
          </button>
        </div>

        {submitSuccess && (
          <div className="p-3 bg-green-100 text-green-700 rounded">
            Thank you for your enquiry! We'll get back to you soon.
          </div>
        )}

        {submitError && <div className="p-3 bg-red-100 text-red-700 rounded">{submitError}</div>}
      </form>
    </div>
  )
}
