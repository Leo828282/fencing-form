"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Calculator } from "lucide-react"
import PaginationDots from "@/components/shared/pagination-dots"

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
  const [hoveredOption, setHoveredOption] = useState<string | null>(null)
  const currentStep = 3
  const totalSteps = 5

  // Handle option selection - navigate immediately
  const handleOptionSelect = (optionId: string) => {
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

    // Navigate immediately
    router.push("/adjustments")
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
        {/* Header section with standardized spacing */}
        <div className="text-center mb-16 mt-16">
          <h1 className="text-[48px] font-bold mb-6 font-heading text-[#222] leading-tight">Select an option!</h1>
          <div className="flex items-center justify-center">
            <button
              onClick={handleSkipToCalculator}
              className="inline-flex items-center bg-[#b82429] text-white font-medium px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all duration-200 hover:bg-[#a52025]"
            >
              <Calculator size={18} className="mr-2 text-white" />
              <span>I have it figured out calculate my costs</span>
              <span className="ml-1 font-bold">»»</span>
            </button>
          </div>
        </div>

        {/* Options with improved spacing */}
        <div className="flex justify-center gap-12 w-full max-w-2xl mx-auto mb-16">
          {OPTIONS.map((option) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              className={`relative cursor-pointer overflow-hidden shadow-md bg-white
                ${option.id === "purchase" ? "border-2 border-[#b82429]" : "border border-gray-300"}
              `}
              onClick={() => handleOptionSelect(option.id)}
              onMouseEnter={() => setHoveredOption(option.id)}
              onMouseLeave={() => setHoveredOption(null)}
              style={{ width: "240px", height: "70px" }}
            >
              <div className="relative h-full w-full flex items-center justify-center">
                <div
                  className={`text-center font-bold text-2xl tracking-wide font-heading text-black transition-opacity duration-300`}
                >
                  {option.name}
                </div>

                {/* Hover overlay - shows when hovering but not selected */}
                <div
                  className={`absolute inset-0 bg-black/75 flex items-center justify-center transition-all duration-300 ease-in-out ${
                    hoveredOption === option.id ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="text-white font-bold text-xl tracking-wide">SELECT OPTION</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Back button with improved spacing */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-700 hover:text-[#b82429] transition-colors font-sans"
          >
            <ArrowLeft size={20} className="mr-1" />
            <span className="font-medium">Back</span>
          </button>
        </div>

        {/* Pagination dots with improved spacing */}
        <div className="mb-8">
          <PaginationDots currentStep={currentStep} totalSteps={totalSteps} />
        </div>
      </div>
    </div>
  )
}
