"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { Poppins } from "next/font/google"

// Initialize the Poppins font
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

interface BookingModalProps {
  onClose: () => void
}

export default function BookingModal({ onClose }: BookingModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const iframeId = `tj0ThRD4A9JGUpWp4WiU_${Date.now()}`

  // Handle iframe script loading
  useEffect(() => {
    // Load the form embed script
    const script = document.createElement("script")
    script.src = "https://link.msgsndr.com/js/form_embed.js"
    script.type = "text/javascript"
    script.async = true
    document.body.appendChild(script)

    // Clean up
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  // Prevent scrolling on the main body when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 ${poppins.className}`}
    >
      <div className="bg-[#1D1D1D] rounded-lg shadow-xl w-full max-w-[800px] h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-[#333333]">
          <h2 className="text-xl font-bold text-white">Book a Call</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[#333333] text-white" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <iframe
            ref={iframeRef}
            src="https://api.leadconnectorhq.com/widget/booking/tj0ThRD4A9JGUpWp4WiU"
            style={{
              width: "100%",
              border: "none",
              overflow: "hidden",
              height: "100%",
              minHeight: "700px",
              backgroundColor: "#1D1D1D",
            }}
            scrolling="no"
            id={iframeId}
            title="Book a Call"
          />
        </div>
      </div>
    </div>
  )
}
