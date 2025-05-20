"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Loader, ArrowLeft } from "lucide-react"

// Purchase/Hire options
const OPTIONS = [
  {
    id: "purchase",
    name: "PURCHASE",
  },
  {
    id: "hire",
    name: "HIRE",
  },
]

export default function PurchaseOptions() {
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const currentStep = 3
  const totalSteps = 5

  // Effect to handle navigation after selection is saved
  useEffect(() => {
    if (selectedOption && isNavigating) {
      // Short delay to show the loading spinner before navigating
      const timer = setTimeout(() => {
        router.push("/adjustments")
      }, 800)

      return () => clearTimeout(timer)
    }
  }, [selectedOption, isNavigating, router])

  // Handle option selection - now with immediate navigation
  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId)
    setIsNavigating(true)

    // Save selection to localStorage
    const savedConfig = localStorage.getItem("fencingCalculatorConfig") || "{}"
    const config = JSON.parse(savedConfig)
    localStorage.setItem(
      "fencingCalculatorConfig",
      JSON.stringify({
        ...config,
        selectedOption: optionId,
      }),
    )
  }

  // Handle direct navigation to calculator
  const handleSkipToCalculator = () => {
    router.push("/calculator")
  }

  // Handle back navigation
  const handleBack = () => {
    router.push("/accessories")
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        {/* Header section - exactly matching the image */}
        <div className="text-center mb-16 mt-16">
          <h1 className="text-[48px] font-bold mb-4 font-heading text-[#222] leading-tight">Select an option!</h1>
          <div className="flex items-center justify-center">
            <button
              onClick={handleSkipToCalculator}
              className="text-gray-600 flex items-center hover:text-[#b82429] transition-colors duration-300 font-sans"
            >
              I have it figured out calculate my costs
              <span className="ml-2 text-[#b82429]">»»»</span>
            </button>
          </div>
        </div>

        {/* Options - exactly matching the image */}
        <div className="flex justify-center gap-8 w-full max-w-2xl mx-auto mb-16">
          {OPTIONS.map((option) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -5 }}
              className={`relative cursor-pointer overflow-hidden shadow-md bg-white
                ${option.id === "purchase" ? "border-2 border-[#b82429]" : "border border-gray-300"}
              `}
              onClick={() => handleOptionSelect(option.id)}
              style={{ width: "240px", height: "70px" }}
            >
              <div className="relative h-full w-full flex items-center justify-center">
                <div className="text-center font-bold text-2xl tracking-wide font-heading text-black">
                  {option.name}
                </div>

                {/* Loading spinner - shows when selected */}
                {selectedOption === option.id && isNavigating && (
                  <div className="absolute inset-0 bg-black/75 flex items-center justify-center transition-all duration-300 ease-in-out">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                      className="text-white"
                    >
                      <Loader size={32} className="text-white" />
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Back button - exactly matching the image position */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-700 hover:text-[#b82429] transition-colors font-sans"
          >
            <ArrowLeft size={20} className="mr-1" />
            <span className="font-medium">Back</span>
          </button>
        </div>

        {/* Pagination dots - exactly matching the image */}
        <div className="flex justify-center space-x-2">
          {[...Array(totalSteps)].map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full ${i + 1 === currentStep ? "bg-[#b82429]" : "bg-gray-300"}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
