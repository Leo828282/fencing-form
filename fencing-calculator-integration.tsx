"use client"

import { useState } from "react"
import EnhancedQuoteForm from "./enhanced-quote-form"
import BookingEmbed from "./booking-embed"
import FencingCalculator from "./fencing-calculator" // Your existing calculator component

export default function FencingCalculatorIntegration() {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [isBookingRedirectOpen, setIsBookingRedirectOpen] = useState(false)
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
  const formatPrice = (price: number) => {
    return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  // Handle calculator data updates
  const handleCalculatorUpdate = (data) => {
    setCalculatorData(data)
  }

  // Open quote modal
  const handleOpenQuoteModal = () => {
    setIsQuoteModalOpen(true)
  }

  // Open booking redirect
  const handleOpenBookingRedirect = () => {
    setIsBookingRedirectOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Fencing Cost Calculator</h1>

        {/* Your existing calculator component with data update callback */}
        <FencingCalculator
          onUpdate={handleCalculatorUpdate}
          onQuoteRequest={handleOpenQuoteModal}
          onBookingRequest={handleOpenBookingRedirect}
        />

        {/* Modals */}
        {isQuoteModalOpen && (
          <EnhancedQuoteForm
            onClose={() => setIsQuoteModalOpen(false)}
            itemsList={calculatorData.itemsList}
            totalPrice={calculatorData.totalPrice}
            selectedOption={calculatorData.selectedOption}
            metersRequired={calculatorData.metersRequired}
            hireDuration={calculatorData.hireDuration}
            durationUnit={calculatorData.durationUnit}
            formatDuration={formatDuration}
            formatPrice={formatPrice}
          />
        )}

        {isBookingRedirectOpen && <BookingEmbed onClose={() => setIsBookingRedirectOpen(false)} />}
      </div>
    </div>
  )
}
