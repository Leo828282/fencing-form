"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Lato } from "next/font/google"
import { ArrowLeft } from "lucide-react"

// Initialize the Lato font
const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-lato",
})

export default function BookACallPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || "https://example.com/booking"

  // Handle iframe load event
  const handleIframeLoad = () => {
    setIframeLoaded(true)
    setIsLoading(false)
  }

  // Set a timeout to hide the loading spinner after a reasonable time
  // even if the iframe doesn't trigger the onLoad event
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  // Handle return to calculator
  const handleReturn = () => {
    router.push("/")
  }

  return (
    <div className={`w-full min-h-screen ${lato.className}`} style={{ backgroundColor: "#F8F8F8" }}>
      <div className="container max-w-6xl mx-auto p-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-100 p-6 flex items-center">
            <button
              onClick={handleReturn}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Return to calculator"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">Book a Call</h2>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-6">
              <p className="text-gray-600">
                Schedule a call with our fencing experts to discuss your project requirements and get personalized
                assistance.
              </p>
            </div>

            {/* Booking iframe */}
            <div className="relative min-h-[600px] w-full">
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 rounded-md">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b82429] mb-4"></div>
                  <p className="text-gray-600">Loading booking calendar...</p>
                </div>
              )}
              <iframe
                src={bookingUrl}
                className={`w-full min-h-[600px] border-0 ${iframeLoaded ? "opacity-100" : "opacity-0"}`}
                onLoad={handleIframeLoad}
                title="Booking Calendar"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>

        {/* Bottom Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={handleReturn}
            className="bg-[#b82429] hover:bg-[#9e1f23] text-white py-3 px-8 text-base font-medium rounded-md"
          >
            Return to Calculator
          </Button>
        </div>
      </div>
    </div>
  )
}
