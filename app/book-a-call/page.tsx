"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function BookACallPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  // Get booking URL from environment variable with fallback
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || "https://example.com/booking"

  // Handle iframe load event
  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  // Set a timeout to hide the loading spinner after a reasonable time
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  // Handle return to calculator
  const handleReturn = () => {
    try {
      router.push("/calculator")
    } catch (error) {
      console.error("Navigation error:", error)
      // Fallback if navigation fails
      window.location.href = "/calculator"
    }
  }

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-white">
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#b82429] mb-4"></div>
          <p className="text-gray-600 text-lg">Loading booking calendar...</p>
        </div>
      )}

      {/* Full-screen iframe */}
      <iframe
        src={bookingUrl}
        className="w-full h-full border-0"
        onLoad={handleIframeLoad}
        title="Booking Calendar"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      ></iframe>

      {/* Floating return button - positioned at the bottom of the screen */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-20">
        <Button
          onClick={handleReturn}
          variant="default"
          size="lg"
          className="bg-[#b82429] hover:bg-[#a01f23] text-white font-bold py-3 px-6 shadow-lg flex items-center justify-center gap-2 rounded-full"
        >
          <ArrowLeft size={20} />
          Return to Calculator
        </Button>
      </div>
    </div>
  )
}
