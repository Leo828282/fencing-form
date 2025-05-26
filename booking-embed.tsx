"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { Poppins } from "next/font/google"

// Initialize the Poppins font
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

interface BookingEmbedProps {
  onClose: () => void
}

export default function BookingEmbed({ onClose }: BookingEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Get the booking URL from environment variables
  const bookingUrl =
    process.env.NEXT_PUBLIC_BOOKING_URL || "https://api.leadconnectorhq.com/widget/booking/tj0ThRD4A9JGUpWp4WiU"

  // Prevent scrolling on the main body when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 ${poppins.className}`}
    >
      <div className="bg-[#1D1D1D] rounded-lg shadow-xl w-full max-w-[800px] h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-[#333333]">
          <h2 className="text-xl font-bold text-white">Book a Call</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#333333] text-white transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <iframe
            ref={iframeRef}
            src={bookingUrl}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              overflow: "hidden",
              minHeight: "700px",
              backgroundColor: "#1D1D1D",
            }}
            scrolling="auto"
            title="Book a Call"
            allow="camera; microphone; autoplay; encrypted-media; fullscreen; payment"
          />
        </div>
      </div>
    </div>
  )
}
