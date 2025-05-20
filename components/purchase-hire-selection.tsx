"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ChevronRight, ShoppingCart, Clock } from "lucide-react"
import { Lato } from "next/font/google"

// Initialize the Lato font
const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
  variable: "--font-lato",
})

// Purchase/Hire options
const OPTIONS = [
  {
    id: "purchase",
    name: "Purchase",
    description: "Buy the fencing equipment outright",
    icon: <ShoppingCart size={48} className="mb-4 text-[#b82429]" />,
    image: "/images/purchase.png",
  },
  {
    id: "hire",
    name: "Hire",
    description: "Rent the fencing equipment for a period of time",
    icon: <Clock size={48} className="mb-4 text-[#b82429]" />,
    image: "/images/hire.png",
  },
]

export default function PurchaseHireSelection() {
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(3)
  const totalSteps = 4

  // Load saved configuration
  useEffect(() => {
    const savedConfig = localStorage.getItem("fencingCalculatorConfig")
    if (savedConfig) {
      const config = JSON.parse(savedConfig)
      if (config.selectedOption) {
        setSelectedOption(config.selectedOption)
      }
    }
  }, [])

  // Handle option selection
  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId)

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

  // Handle continue to next step
  const handleContinue = () => {
    if (selectedOption) {
      router.push("/step4")
    }
  }

  return (
    <div className={`min-h-screen flex flex-col ${lato.className}`} style={{ backgroundColor: "#F1EFEA" }}>
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Would you like to purchase or hire?</h1>
          <p className="text-gray-600 flex items-center justify-center">
            I have it figured out calculate my costs
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
              className="ml-1 inline-flex"
            >
              <ChevronRight size={18} className="text-[#b82429]" />
              <ChevronRight size={18} className="text-[#b82429] -ml-3" />
              <ChevronRight size={18} className="text-[#b82429] -ml-3" />
            </motion.span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          {OPTIONS.map((option) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="relative cursor-pointer rounded-lg overflow-hidden shadow-md bg-white"
              onClick={() => handleOptionSelect(option.id)}
              style={{ height: "320px" }}
            >
              <div className="relative h-full w-full">
                <div className="h-[280px] w-full relative bg-gray-100 flex items-center justify-center">
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    {option.icon}
                    <h3 className="text-2xl font-bold mb-2">{option.name}</h3>
                    <p className="text-gray-600">{option.description}</p>
                  </div>

                  {/* Overlay when selected */}
                  {selectedOption === option.id && (
                    <div className="absolute inset-0 bg-gray-700/80 flex items-center justify-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-white font-bold text-xl"
                        onClick={handleContinue}
                      >
                        SELECT OPTION
                      </motion.div>
                    </div>
                  )}
                </div>

                {/* Product name banner */}
                <div
                  className={`absolute bottom-0 left-0 right-0 bg-[#b82429] text-white p-2 text-center text-sm font-medium transition-opacity duration-300 ${
                    selectedOption === option.id ? "opacity-0" : "opacity-100"
                  }`}
                >
                  {option.name}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center mt-8 space-x-2">
          {[...Array(totalSteps)].map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full ${i + 1 === currentStep ? "bg-[#b82429]" : "bg-gray-300"}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
