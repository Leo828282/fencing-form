"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface ActionButtonsProps {
  onGetQuote?: () => void
  onBookCall?: () => void
}

export default function ActionButtons({ onGetQuote, onBookCall }: ActionButtonsProps) {
  const [isQuoteLoading, setIsQuoteLoading] = useState(false)
  const [isBookingLoading, setIsBookingLoading] = useState(false)

  const handleGetQuote = () => {
    if (!onGetQuote) return

    setIsQuoteLoading(true)
    try {
      onGetQuote()
    } catch (error) {
      console.error("Error getting quote:", error)
    } finally {
      setTimeout(() => {
        setIsQuoteLoading(false)
      }, 300)
    }
  }

  const handleBookCall = () => {
    setIsBookingLoading(true)
    window.location.href = "/book-a-call"

    setTimeout(() => {
      setIsBookingLoading(false)
    }, 1000)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Button
        onClick={handleGetQuote}
        disabled={isQuoteLoading}
        className="bg-[#b82429] hover:bg-[#9e1f23] text-white py-4 px-6 text-lg font-medium rounded-md w-full"
      >
        {isQuoteLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading...
          </>
        ) : (
          "Get a Quote"
        )}
      </Button>
      <Button
        onClick={handleBookCall}
        disabled={isBookingLoading}
        className="border-2 border-[#b82429] text-[#b82429] bg-white hover:bg-gray-50 py-4 px-6 text-lg font-medium rounded-md w-full"
      >
        {isBookingLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading...
          </>
        ) : (
          "Book a Call"
        )}
      </Button>
    </div>
  )
}
