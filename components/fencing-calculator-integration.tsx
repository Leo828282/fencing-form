"use client"

import { useState } from "react"
import FencingCalculator from "./calculator/fencing-calculator"
import SimpleQuoteForm from "./forms/simple-quote-form"
import BookingEmbed from "./booking/booking-embed"

export default function FencingCalculatorIntegration() {
  // Initialize with default values to prevent undefined errors
  const [calculatorData, setCalculatorData] = useState({
    itemsList: [
      { name: "Builders Duty Panels", quantity: 5, price: 250, category: "panels" },
      { name: "Fencing Feet", quantity: 8, price: 200, category: "feet" },
      { name: "Fencing Clamp", quantity: 5, price: 20, category: "connectors" },
      { name: "Fencing Stay Support", quantity: 1, price: 35, category: "supports" },
      { name: "Fencing Feet (for braces)", quantity: 2, price: 50, category: "feet" },
      { name: "Delivery Fee", quantity: 1, price: 0, isTBC: true, category: "delivery" },
      { name: "Installation", quantity: 1, price: 0, isTBC: true, category: "services" },
    ],
    totalPrice: 555.5,
    selectedOption: "purchase",
    metersRequired: 10,
    hireDuration: 1,
    durationUnit: "weeks",
    selectedFenceType: "builders",
    selectedFeetOption: "feet",
  })
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [isBookingRedirectOpen, setIsBookingRedirectOpen] = useState(false)

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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Calculator component */}
        <FencingCalculator
          onUpdate={setCalculatorData}
          onQuoteRequest={() => setIsQuoteModalOpen(true)}
          onBookingRequest={() => setIsBookingRedirectOpen(true)}
        />

        {/* Modals - Only render when open */}
        {isQuoteModalOpen && (
          <SimpleQuoteForm
            onClose={() => setIsQuoteModalOpen(false)}
            itemsList={calculatorData.itemsList}
            totalPrice={calculatorData.totalPrice}
            selectedOption={calculatorData.selectedOption}
            metersRequired={calculatorData.metersRequired}
            hireDuration={calculatorData.hireDuration}
            durationUnit={calculatorData.durationUnit}
            formatDuration={formatDuration}
            formatPrice={formatPrice}
            selectedFenceType={calculatorData.selectedFenceType}
            selectedFeetOption={calculatorData.selectedFeetOption}
          />
        )}

        {isBookingRedirectOpen && <BookingEmbed onClose={() => setIsBookingRedirectOpen(false)} />}
      </div>
    </div>
  )
}
