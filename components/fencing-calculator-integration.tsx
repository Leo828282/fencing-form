"use client"

import { useState, useEffect, useCallback } from "react"
import SimpleQuoteForm from "./forms/simple-quote-form"
import BookingEmbed from "./booking/booking-embed"
import FencingCalculator from "./calculator/fencing-calculator"

export default function FencingCalculatorIntegration() {
  // Initialize with default values to prevent undefined errors
  const [calculatorData, setCalculatorData] = useState({
    itemsList: [
      { name: "Builders Duty Panels", quantity: 5, price: 250, category: "panels" },
      { name: "Fencing Feet", quantity: 8, price: 200, category: "feet" },
      { name: "Fencing Clamp", quantity: 5, price: 20, category: "connectors" },
      { name: "Fencing Stay Support", quantity: 1, price: 35, category: "supports" },
      { name: "Fencing Feet (for braces)", quantity: 2, price: 50, category: "feet" },
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
  const [isInIframe, setIsInIframe] = useState(false)

  // Check if we're in an iframe
  useEffect(() => {
    setIsInIframe(window !== window.parent)

    // Send initial height to parent if in iframe
    if (window !== window.parent) {
      window.parent.postMessage(
        {
          type: "RESIZE_IFRAME",
          height: document.body.scrollHeight,
        },
        "*",
      )
    }
  }, [])

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

  // Handle calculator data update - filter out delivery items
  // Use useCallback to prevent recreation of this function on every render
  const handleCalculatorUpdate = useCallback((data) => {
    // Create a new object with filtered itemsList to avoid mutating the original data
    const filteredData = {
      ...data,
      itemsList: data.itemsList
        ? data.itemsList.filter(
            (item) =>
              !(item.name?.toLowerCase().includes("delivery") || item.category?.toLowerCase().includes("delivery")),
          )
        : [],
    }

    // Only update state if the data has actually changed
    setCalculatorData((prevData) => {
      // Simple comparison to avoid unnecessary updates
      if (JSON.stringify(prevData) === JSON.stringify(filteredData)) {
        return prevData
      }
      return filteredData
    })
  }, [])

  // Handle opening quote modal
  const handleOpenQuoteModal = () => {
    setIsQuoteModalOpen(true)

    // Notify parent about modal opening if in iframe
    if (isInIframe) {
      window.parent.postMessage(
        {
          type: "MODAL_STATE_CHANGED",
          isOpen: true,
          modalType: "quote",
        },
        "*",
      )
    }
  }

  // Handle closing quote modal
  const handleCloseQuoteModal = () => {
    setIsQuoteModalOpen(false)

    // Notify parent about modal closing if in iframe
    if (isInIframe) {
      window.parent.postMessage(
        {
          type: "MODAL_STATE_CHANGED",
          isOpen: false,
        },
        "*",
      )
    }
  }

  // Handle opening booking modal
  const handleOpenBookingModal = () => {
    setIsBookingRedirectOpen(true)

    // Notify parent about modal opening if in iframe
    if (isInIframe) {
      window.parent.postMessage(
        {
          type: "MODAL_STATE_CHANGED",
          isOpen: true,
          modalType: "booking",
        },
        "*",
      )
    }
  }

  // Handle closing booking modal
  const handleCloseBookingModal = () => {
    setIsBookingRedirectOpen(false)

    // Notify parent about modal closing if in iframe
    if (isInIframe) {
      window.parent.postMessage(
        {
          type: "MODAL_STATE_CHANGED",
          isOpen: false,
        },
        "*",
      )
    }
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 sm:py-8" style={{ backgroundColor: "transparent" }}>
        {/* Calculator component */}
        <FencingCalculator
          onUpdate={handleCalculatorUpdate}
          onQuoteRequest={handleOpenQuoteModal}
          onBookingRequest={handleOpenBookingModal}
        />

        {/* Modals - Only render when open */}
        {isQuoteModalOpen && (
          <SimpleQuoteForm
            onClose={handleCloseQuoteModal}
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

        {isBookingRedirectOpen && <BookingEmbed onClose={handleCloseBookingModal} />}
      </div>
    </div>
  )
}
