"use client"

import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import { Poppins } from "next/font/google"

// Initialize the Poppins font
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

interface BookingEmbedProps {
  onClose: () => void
  bookingUrl?: string
}

export default function BookingEmbed({ onClose, bookingUrl }: BookingEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Get the booking URL from props or environment variables
  const embedUrl =
    bookingUrl ||
    process.env.NEXT_PUBLIC_BOOKING_URL ||
    "https://api.leadconnectorhq.com/widget/booking/tj0ThRD4A9JGUpWp4WiU"

  // Prevent scrolling on the main body when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden"

    // Dispatch modal state change event for iframe communication
    const event = new CustomEvent("modalStateChanged", {
      detail: { isOpen: true, modalType: "booking" },
    })
    document.dispatchEvent(event)

    return () => {
      document.body.style.overflow = "auto"

      // Dispatch modal closed event
      const closeEvent = new CustomEvent("modalStateChanged", {
        detail: { isOpen: false, modalType: "booking" },
      })
      document.dispatchEvent(closeEvent)
    }
  }, [])

  // Handle iframe load event
  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-2 sm:p-4 ${poppins.className}`}
    >
      <div className="bg-[#1D1D1D] rounded-lg shadow-xl w-full max-w-[800px] h-[90vh] max-h-[800px] flex flex-col">
        <div className="flex justify-between items-center p-3 sm:p-4 border-b border-[#333333]">
          <h2 className="text-lg sm:text-xl font-bold text-white">Book a Call</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#333333] text-white transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1D1D1D]">
              <div className="w-10 h-10 border-4 border-[#333333] border-t-white rounded-full animate-spin"></div>
            </div>
          )}

          <iframe
            ref={iframeRef}
            src={embedUrl}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              overflow: "hidden",
              minHeight: "500px",
              backgroundColor: "#1D1D1D",
            }}
            scrolling="auto"
            title="Book a Call"
            allow="camera; microphone; autoplay; encrypted-media; fullscreen; payment"
            onLoad={handleIframeLoad}
          />
        </div>
      </div>
    </div>
  )
}
