"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Loader, ChevronUp, ChevronDown, ArrowLeft } from "lucide-react"
import { Barlow, Roboto } from "next/font/google"

// Initialize the fonts
const barlow = Barlow({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
  variable: "--font-barlow",
})

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-roboto",
})

// Duration unit options
const DURATION_UNITS = [
  { id: "days", label: "Days" },
  { id: "weeks", label: "Weeks" },
  { id: "months", label: "Months" },
]

export default function AdjustmentsPageAlt() {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  const [currentStep, setCurrentStep] = useState(4)
  const totalSteps = 5

  // State for adjustments
  const [metersRequired, setMetersRequired] = useState(10)
  const [hireDuration, setHireDuration] = useState(10)
  const [durationUnit, setDurationUnit] = useState("weeks")
  const [selectedOption, setSelectedOption] = useState("hire") // Default to hire

  // Load saved configuration
  useEffect(() => {
    const savedConfig = localStorage.getItem("fencingCalculatorConfig")
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig)
        if (config.metersRequired) setMetersRequired(config.metersRequired)
        if (config.hireDuration) setHireDuration(config.hireDuration)
        if (config.durationUnit) setDurationUnit(config.durationUnit)
        if (config.selectedOption) setSelectedOption(config.selectedOption)
      } catch (e) {
        console.error("Error loading saved configuration", e)
      }
    }
  }, [])

  // Handle navigation to calculator
  const handleNext = () => {
    setIsNavigating(true)

    // Ensure valid values before saving
    const validMeters =
      metersRequired === "" || isNaN(metersRequired) ? 1 : Math.min(800, Math.max(1, Number(metersRequired)))
    const validDuration =
      hireDuration === "" || isNaN(hireDuration) ? 1 : Math.min(getMaxDuration(), Math.max(1, Number(hireDuration)))

    // Save adjustments to localStorage
    const savedConfig = localStorage.getItem("fencingCalculatorConfig") || "{}"
    const config = JSON.parse(savedConfig)
    localStorage.setItem(
      "fencingCalculatorConfig",
      JSON.stringify({
        ...config,
        metersRequired: validMeters,
        hireDuration: validDuration,
        durationUnit,
      }),
    )

    // Navigate to calculator after a short delay
    setTimeout(() => {
      router.push("/calculator")
    }, 800)
  }

  // Handle direct navigation to calculator
  const handleSkipToCalculator = () => {
    router.push("/calculator")
  }

  // Handle back navigation
  const handleBack = () => {
    router.push("/purchase-options")
  }

  // Increment/decrement functions
  const incrementMeters = () =>
    setMetersRequired((prev) => {
      const current = prev === "" || isNaN(prev) ? 0 : Number(prev)
      return Math.min(800, current + 10)
    })

  const decrementMeters = () =>
    setMetersRequired((prev) => {
      const current = prev === "" || isNaN(prev) ? 0 : Number(prev)
      return Math.max(1, current - 10)
    })

  const incrementDuration = () =>
    setHireDuration((prev) => {
      const current = prev === "" || isNaN(prev) ? 0 : Number(prev)
      return Math.min(getMaxDuration(), current + 1)
    })

  const decrementDuration = () =>
    setHireDuration((prev) => {
      const current = prev === "" || isNaN(prev) ? 0 : Number(prev)
      return Math.max(1, current - 1)
    })

  // Calculate slider percentage for fill
  const getMetersPercentage = () => {
    const value = metersRequired === "" || isNaN(metersRequired) ? 1 : Number(metersRequired)
    return (value / 800) * 100
  }

  const getDurationPercentage = () => {
    const value = hireDuration === "" || isNaN(hireDuration) ? 1 : Number(hireDuration)
    return (value / getMaxDuration()) * 100
  }

  // Helper functions for duration
  const getMinimumDuration = (unit) => {
    return 1
  }

  const getMaxDuration = () => {
    if (durationUnit === "days") return 730
    if (durationUnit === "weeks") return 104
    return 24
  }

  // Handle meters input change
  const handleMetersChange = (e) => {
    const value = e.target.value
    if (value === "" || (!isNaN(value) && Number(value) >= 1 && Number(value) <= 800)) {
      setMetersRequired(value)
    }
  }

  // Handle meters blur to ensure valid value
  const handleMetersBlur = () => {
    if (metersRequired === "" || isNaN(metersRequired)) {
      setMetersRequired(1)
    } else {
      setMetersRequired(Math.min(800, Math.max(1, Number(metersRequired))))
    }
  }

  return (
    <div
      className={`min-h-screen flex flex-col ${barlow.variable} ${roboto.variable}`}
      style={{ backgroundColor: "white" }}
    >
      {/* Back button */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8">
        <button onClick={handleBack} className="flex items-center text-gray-700 hover:text-[#b82429] transition-colors">
          <ArrowLeft size={20} className="mr-1" />
          <span className="font-medium">Back</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="text-center mb-8">
          <h1 className="text-[40px] md:text-[48px] font-bold mb-4 font-barlow text-[#222] leading-tight">
            Adjust for what you need!
          </h1>
          <div className="flex items-center justify-center">
            <button
              onClick={handleSkipToCalculator}
              className="text-gray-600 flex items-center hover:text-[#b82429] transition-colors duration-300 font-roboto"
            >
              I have it figured out calculate my costs
              <span className="ml-2 text-[#b82429]">»</span>
            </button>
          </div>
        </div>

        <div className="max-w-xl w-full bg-white p-8 rounded-lg shadow-sm">
          {/* Meters of Fencing Required */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div className="font-bold text-lg">Meters of Fencing Required</div>
              <div className="flex items-center">
                <input
                  type="number"
                  min="1"
                  max="800"
                  value={metersRequired}
                  onChange={handleMetersChange}
                  onBlur={handleMetersBlur}
                  className="w-16 text-center border border-gray-300 py-1 px-2"
                />
                <div className="flex flex-col ml-1">
                  <button
                    onClick={incrementMeters}
                    className="bg-white border border-gray-300 p-1 flex items-center justify-center hover:bg-gray-100"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={decrementMeters}
                    className="bg-white border border-gray-300 border-t-0 p-1 flex items-center justify-center hover:bg-gray-100"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>
            </div>
            <div className="relative h-1 bg-gray-300 rounded-full mb-8">
              <div
                className="absolute top-0 left-0 h-full bg-[#b82429] rounded-full"
                style={{ width: `${getMetersPercentage()}%` }}
              ></div>
              <input
                type="range"
                min="1"
                max="800"
                value={metersRequired || 1}
                onChange={(e) => setMetersRequired(Number(e.target.value))}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div
                className="absolute top-0 w-5 h-5 bg-[#b82429] rounded-full -mt-1.5 transform -translate-x-1/2"
                style={{ left: `${getMetersPercentage()}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1m</span>
              <span>400m</span>
              <span>800m</span>
            </div>
          </div>

          {/* Next button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={handleNext}
              className="bg-[#b82429] text-white px-8 py-2 font-medium text-lg hover:bg-[#a01f24] transition-colors"
              disabled={isNavigating}
            >
              {isNavigating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                  className="mr-2 inline-block"
                >
                  <Loader size={20} className="text-white" />
                </motion.div>
              ) : null}
              NEXT {">"}
            </button>
          </div>
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center mt-16 space-x-2">
          {[...Array(totalSteps)].map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full ${i + 1 === currentStep ? "bg-[#b82429]" : "bg-gray-300"}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
