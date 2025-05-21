"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ChevronRight, Ruler, Clock } from "lucide-react"
import { Lato } from "next/font/google"
import { Button } from "@/components/ui/button"

// Initialize the Lato font
const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
  variable: "--font-lato",
})

// Duration unit options with minimum values
const DURATION_UNITS = [
  { id: "days", label: "Days", multiplier: 1, minimum: 7 },
  { id: "weeks", label: "Weeks", multiplier: 7, minimum: 1 },
  { id: "months", label: "Months", multiplier: 30.4167, minimum: 1 },
]

// Maximum duration in days (2 years)
const MAX_DURATION_DAYS = 730

// Get the minimum duration for a given unit
function getMinimumDuration(unit) {
  const unitObj = DURATION_UNITS.find((u) => u.id === unit)
  return unitObj ? unitObj.minimum : 1
}

// Get the max duration value based on the selected unit
function getMaxDuration(durationUnit) {
  if (durationUnit === "days") {
    return MAX_DURATION_DAYS
  } else if (durationUnit === "weeks") {
    return 104 // Exactly 104 weeks for 730 days
  } else if (durationUnit === "months") {
    return 24 // Exactly 24 months for 730 days
  }
  return 1
}

export default function AdjustmentsSelection() {
  const router = useRouter()
  const [metersRequired, setMetersRequired] = useState(10)
  const [hireDuration, setHireDuration] = useState(10)
  const [durationUnit, setDurationUnit] = useState("weeks")
  const [selectedOption, setSelectedOption] = useState("purchase")
  const [currentStep, setCurrentStep] = useState(4)
  const totalSteps = 4

  const metersSliderRef = useRef(null)
  const durationSliderRef = useRef(null)
  const metersSliderFillRef = useRef(null)
  const durationSliderFillRef = useRef(null)

  // Load saved configuration
  useEffect(() => {
    const savedConfig = localStorage.getItem("fencingCalculatorConfig")
    if (savedConfig) {
      const config = JSON.parse(savedConfig)
      if (config.metersRequired) setMetersRequired(config.metersRequired)
      if (config.hireDuration) setHireDuration(config.hireDuration)
      if (config.durationUnit) setDurationUnit(config.durationUnit)
      if (config.selectedOption) setSelectedOption(config.selectedOption)
    }
  }, [])

  // Update slider fill when values change
  useEffect(() => {
    updateSliderFill()
    // Set a small timeout to ensure the DOM has fully rendered
    const timeoutId = setTimeout(updateSliderFill, 50)
    return () => clearTimeout(timeoutId)
  }, [metersRequired, hireDuration, durationUnit])

  // Update the slider fill
  const updateSliderFill = () => {
    // Update the meters slider fill
    if (metersSliderRef.current && metersSliderFillRef.current) {
      const min = 1
      const max = 800
      const val = metersRequired || min
      const percentage = ((val - min) / (max - min)) * 100

      // Get the slider's width
      const sliderWidth = metersSliderRef.current.offsetWidth

      // Calculate the fill width based on the percentage
      const fillWidth = (percentage / 100) * sliderWidth

      // Update the fill element's width
      metersSliderFillRef.current.style.width = `${fillWidth}px`
    }

    // Update the duration slider fill
    if (durationSliderRef.current && durationSliderFillRef.current && durationUnit) {
      const min = getMinimumDuration(durationUnit)
      const max = getMaxDuration(durationUnit)
      const val = hireDuration || min
      const percentage = ((val - min) / (max - min)) * 100

      // Get the slider's width
      const sliderWidth = durationSliderRef.current.offsetWidth

      // Calculate the fill width based on the percentage
      const fillWidth = (percentage / 100) * sliderWidth

      // Update the fill element's width
      durationSliderFillRef.current.style.width = `${fillWidth}px`
    }
  }

  // Handle meters input change
  const handleMetersChange = (e) => {
    const value = e.target.value === "" ? "" : Number(e.target.value)
    if (value === "" || (value >= 1 && value <= 800)) {
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

  // Handle duration input change
  const handleDurationChange = (e) => {
    const value = e.target.value === "" ? "" : Number(e.target.value)
    const min = getMinimumDuration(durationUnit)
    const max = getMaxDuration(durationUnit)
    if (value === "" || (value >= min && value <= max)) {
      setHireDuration(value)
    }
  }

  // Handle duration blur to ensure valid value
  const handleDurationBlur = () => {
    if (hireDuration === "" || isNaN(hireDuration)) {
      setHireDuration(getMinimumDuration(durationUnit))
    } else {
      const min = getMinimumDuration(durationUnit)
      const max = getMaxDuration(durationUnit)
      setHireDuration(Math.min(max, Math.max(min, Number(hireDuration))))
    }
  }

  // Handle continue to calculator
  const handleContinue = () => {
    // Ensure valid values before saving
    const validMeters =
      metersRequired === "" || isNaN(metersRequired) ? 1 : Math.min(800, Math.max(1, Number(metersRequired)))
    const validDuration =
      hireDuration === "" || isNaN(hireDuration)
        ? getMinimumDuration(durationUnit)
        : Math.min(getMaxDuration(durationUnit), Math.max(getMinimumDuration(durationUnit), Number(hireDuration)))

    // Save selections to localStorage
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

    router.push("/calculator")
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Adjust your requirements</h1>
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

        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl w-full">
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Ruler size={24} className="mr-2 text-[#b82429]" />
              <h3 className="text-xl font-bold">Meters of Fencing Required</h3>
            </div>

            <div className="mb-4">
              <input
                type="number"
                min={1}
                max={800}
                value={metersRequired}
                onChange={handleMetersChange}
                onBlur={handleMetersBlur}
                className="w-full border border-gray-300 rounded-md h-12 px-3 mb-2"
              />
              <div className="slider-container">
                <div ref={metersSliderFillRef} className="slider-fill"></div>
                <input
                  ref={metersSliderRef}
                  type="range"
                  min={1}
                  max={800}
                  value={metersRequired || 1}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value)
                    setMetersRequired(value)
                  }}
                  className="w-full"
                  aria-label="Meters of fencing"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1m</span>
                <span>400m</span>
                <span>800m</span>
              </div>
            </div>
          </div>

          {selectedOption === "hire" && (
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Clock size={24} className="mr-2 text-[#b82429]" />
                <h3 className="text-xl font-bold">Hire Duration</h3>
              </div>

              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium">Duration:</span>
                <div className="flex items-center">
                  <select
                    value={durationUnit}
                    onChange={(e) => setDurationUnit(e.target.value)}
                    className="ml-2 border border-gray-300 rounded-md h-10 px-2"
                  >
                    {DURATION_UNITS.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <input
                  type="number"
                  min={getMinimumDuration(durationUnit)}
                  max={getMaxDuration(durationUnit)}
                  value={hireDuration}
                  onChange={handleDurationChange}
                  onBlur={handleDurationBlur}
                  className="w-full border border-gray-300 rounded-md h-12 px-3 mb-2"
                />
                <div className="slider-container">
                  <div ref={durationSliderFillRef} className="slider-fill"></div>
                  <input
                    ref={durationSliderRef}
                    type="range"
                    min={getMinimumDuration(durationUnit)}
                    max={getMaxDuration(durationUnit)}
                    value={hireDuration || getMinimumDuration(durationUnit)}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value)
                      setHireDuration(value)
                    }}
                    className="w-full"
                    aria-label="Hire duration"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>
                    {getMinimumDuration(durationUnit)} {durationUnit}
                  </span>
                  <span>
                    {Math.floor(getMaxDuration(durationUnit) / 2)} {durationUnit}
                  </span>
                  <span>
                    {durationUnit === "days" ? "730 days" : durationUnit === "weeks" ? "104 weeks" : "24 months"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleContinue}
            className="w-full bg-[#b82429] hover:bg-[#9e1f23] text-white py-4 text-lg font-medium rounded-md"
          >
            Calculate My Costs
          </Button>
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
