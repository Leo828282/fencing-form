"use client"

import { useState } from "react"
import FencingCalculator from "@/components/calculator/fencing-calculator"
import { Lato } from "next/font/google"

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-lato",
})

export default function CalculatorPage() {
  const [calculatorData, setCalculatorData] = useState(null)

  const handleBookingRequest = () => {
    window.location.href = "/book-a-call"
  }

  return (
    <div className={`min-h-screen flex flex-col ${lato.className}`} style={{ backgroundColor: "white" }}>
      <div className="flex-1 flex flex-col items-center p-4 md:p-6">
        <div className="w-full max-w-[100%] mx-auto scale-85 origin-top">
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
    </div>
  )
}
