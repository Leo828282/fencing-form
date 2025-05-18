"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import FencingCalculator from "./calculator/fencing-calculator"

export default function FencingCalculatorIntegration() {
  const router = useRouter()
  const [calculatorData, setCalculatorData] = useState({
    itemsList: [],
    totalPrice: 0,
    selectedOption: "purchase",
    metersRequired: 10,
    hireDuration: 1,
    durationUnit: "weeks",
  })

  // Function to format duration for display
  const formatDuration = () => {
    const { hireDuration, durationUnit } = calculatorData
    const displayValue = Math.round(hireDuration)

    if (durationUnit === "days") {
      return `${displayValue} ${displayValue === 1 ? "day" : "days"}`
    } else if (durationUnit === "weeks") {
      return `${displayValue} ${displayValue === 1 ? "week" : "weeks"}`
    } else if (durationUnit === "months") {
      return `${displayValue} ${displayValue === 1 ? "month" : "months"}`
    }
    return `${displayValue} ${durationUnit}`
  }

  // Function to format price with commas for thousands
  const formatPrice = (price) => {
    return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  // Use useCallback to prevent recreation of this function on every render
  const handleCalculatorUpdate = useCallback((data) => {
    // Only update if the data has actually changed
    setCalculatorData((prevData) => {
      // Simple comparison to avoid unnecessary updates
      if (JSON.stringify(prevData) === JSON.stringify(data)) {
        return prevData
      }
      return data
    })
  }, [])

  // Navigate to booking page
  const handleBookingRequest = useCallback(() => {
    router.push("/book-a-call")
  }, [router])

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F1EFEA" }}>
      <div className="container mx-auto px-4 py-6 sm:py-8" style={{ backgroundColor: "#F1EFEA" }}>
        {/* Calculator component */}
        <FencingCalculator onUpdate={handleCalculatorUpdate} onBookingRequest={handleBookingRequest} />
      </div>
    </div>
  )
}
