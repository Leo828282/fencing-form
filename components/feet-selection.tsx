"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { Lato } from "next/font/google"

// Initialize the Lato font
const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
  variable: "--font-lato",
})

// Feet options for the fence
const FEET_OPTIONS = [
  {
    id: "feet",
    name: "Premium Plastic Temporary Fencing Feet (27kgs)",
    shortName: "Premium Plastic Temporary Fencing Feet",
    image: "/images/fence-feet.png",
  },
  {
    id: "hookStay",
    name: "Hook Stay",
    shortName: "Hook Stay",
    image: "/images/hook-stay.png",
  },
]

export default function FeetSelection() {
  const router = useRouter()
  const [selectedFeet, setSelectedFeet] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(2)
  const totalSteps = 4

  // Load saved configuration
  useEffect(() => {
    const savedConfig = localStorage.getItem("fencingCalculatorConfig")
    if (savedConfig) {
      const config = JSON.parse(savedConfig)
      if (config.selectedFeetOption) {
        setSelectedFeet(config.selectedFeetOption)
      }
    }
  }, [])

  // Handle feet selection
  const handleFeetSelect = (feetId: string) => {
    setSelectedFeet(feetId)

    // Save selection to localStorage
    const savedConfig = localStorage.getItem("fencingCalculatorConfig") || "{}"
    const config = JSON.parse(savedConfig)
    localStorage.setItem(
      "fencingCalculatorConfig",
      JSON.stringify({
        ...config,
        selectedFeetOption: feetId,
      }),
    )
  }

  // Handle continue to next step
  const handleContinue = () => {
    if (selectedFeet) {
      router.push("/step3")
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Select your feet option</h1>
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
          {FEET_OPTIONS.map((option) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="relative cursor-pointer rounded-lg overflow-hidden shadow-md bg-white"
              onClick={() => handleFeetSelect(option.id)}
              style={{ height: "320px" }}
            >
              <div className="relative h-full w-full">
                <div className="h-[280px] w-full relative bg-gray-100 flex items-center justify-center">
                  <Image
                    src={option.image || "/placeholder.svg"}
                    alt={option.name}
                    width={280}
                    height={280}
                    className="object-contain"
                  />

                  {/* Overlay when selected */}
                  {selectedFeet === option.id && (
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
                    selectedFeet === option.id ? "opacity-0" : "opacity-100"
                  }`}
                >
                  {option.shortName}
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
