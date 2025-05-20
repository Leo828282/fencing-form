"use client"

import { Button } from "@/components/ui/button"

interface ActionButtonsProps {
  onGetQuote?: () => void
  onBookCall?: () => void
}

export default function ActionButtons({ onGetQuote, onBookCall }: ActionButtonsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Button
        onClick={onGetQuote}
        className="bg-[#b82429] hover:bg-[#9e1f23] text-white py-4 px-6 text-lg font-medium rounded-md w-full"
      >
        Get a Quote
      </Button>
      <Button
        onClick={onBookCall}
        className="border-2 border-[#b82429] text-[#b82429] bg-white hover:bg-gray-50 py-4 px-6 text-lg font-medium rounded-md w-full"
      >
        Book a Call
      </Button>
    </div>
  )
}
