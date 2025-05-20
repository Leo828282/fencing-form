"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import FencingCalculator from "@/components/calculator/fencing-calculator"
import BookingModal from "@/booking-modal"
import { Lato } from "next/font/google"

// Initialize the Lato font
const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-lato",
})

export default function CalculatorPage() {
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [calculatorData, setCalculatorData] = useState(null)
  const router = useRouter()

  // Handle booking request with error handling
  const handleBookingRequest = () => {
    try {
      // Instead of showing the modal, navigate to the book-a-call page
      router.push("/book-a-call")
    } catch (error) {
      console.error("Navigation error:", error)
      // Fallback to modal if navigation fails
      setShowBookingModal(true)
    }
  }

  const handleCloseBookingModal = () => {
    setShowBookingModal(false)
  }

  return (
    <div className={`min-h-screen flex flex-col ${lato.className}`} style={{ backgroundColor: "#F1EFEA" }}>
      <div className="flex-1 flex flex-col items-center p-4 md:p-8">
        {/* Main content */}
        <div className="w-full max-w-7xl">
          <FencingCalculator
            onUpdate={(data) => {
              try {
                setCalculatorData(data)
              } catch (error) {
                console.error("Error updating calculator data:", error)
              }
            }}
            onBookingRequest={handleBookingRequest}
          />
        </div>
      </div>

      {showBookingModal && <BookingModal onClose={handleCloseBookingModal} calculatorData={calculatorData} />}
    </div>
  )
}
