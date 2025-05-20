"use client"

import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import { Poppins } from "next/font/google"
import { Button } from "@/components/ui/button"

// Initialize the Poppins font
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

interface BookingEmbedProps {
  onClose: () => void
  bookingUrl?: string
}

export default function BookingEmbed({ onClose, bookingUrl }: BookingEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // Get the booking URL from props or environment variables with fallback
  const embedUrl =
    bookingUrl ||
    process.env.NEXT_PUBLIC_BOOKING_URL ||
    "https://api.leadconnectorhq.com/widget/booking/tj0ThRD4A9JGUpWp4WiU"

  // Prevent scrolling on the main body when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden"

    // Set a timeout to hide the loading spinner after a reasonable time
    const timer = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false)
      }
    }, 3000)

    return () => {
      document.body.style.overflow = "auto"
      clearTimeout(timer)
    }
  }, [isLoading])

  // Handle iframe load event
  const handleIframeLoad = () => {
    console.log("Booking iframe loaded successfully")
    setIsLoading(false)
    setLoadError(false)
  }

  // Handle retry
  const handleRetry = () => {
    setIsLoading(true)
    setLoadError(false)
    setRetryCount(retryCount + 1)

    // Force iframe reload
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src
      iframeRef.current.src = ""
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentSrc
        }
      }, 100)
    }
  }

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-2 sm:p-4 ${poppins.className}`}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-[800px] h-[90vh] max-h-[800px] flex flex-col">
        <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Book a Call</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden relative bg-white">
          {/* Loading state */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-[#b82429] rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">Loading booking calendar...</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {loadError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 p-6">
              <div className="text-[#b82429] mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Unable to load booking calendar</h3>
              <p className="text-gray-600 text-center mb-6 max-w-md">
                There was a problem loading the booking calendar. Please try again or contact us directly.
              </p>
              <div className="flex gap-4">
                <Button onClick={handleRetry} className="bg-[#b82429] hover:bg-[#9e1f23] text-white">
                  Try Again
                </Button>
                <Button onClick={onClose} variant="outline" className="border-gray-300">
                  Close
                </Button>
              </div>
            </div>
          )}

          {/* Iframe */}
          <iframe
            key={`booking-iframe-${retryCount}`}
            ref={iframeRef}
            src={embedUrl}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              overflow: "hidden",
              minHeight: "500px",
              backgroundColor: "#ffffff",
            }}
            scrolling="auto"
            title="Book a Call"
            allow="camera; microphone; autoplay; encrypted-media; fullscreen; payment"
            onLoad={handleIframeLoad}
            onError={() => setLoadError(true)}
          />
        </div>
      </div>
    </div>
  )
}
