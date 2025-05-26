"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calculator } from "lucide-react"
import PaginationDots from "@/components/shared/pagination-dots"

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

export default function AdjustmentsPage() {
  const router = useRouter()
  const [metersRequired, setMetersRequired] = useState(10)
  const [hireDuration, setHireDuration] = useState(10)
  const [durationUnit, setDurationUnit] = useState("weeks")
  const [selectedOption, setSelectedOption] = useState("hire") // Default to hire
  const [currentStep, setCurrentStep] = useState(4)
  const [totalSteps, setTotalSteps] = useState(5)
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false)

  // Load saved configuration
  useEffect(() => {
    const savedConfig = localStorage.getItem("fencingCalculatorConfig")
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig)
        if (config.metersRequired) setMetersRequired(config.metersRequired)
        if (config.hireDuration) setHireDuration(config.hireDuration)
        if (config.durationUnit) setDurationUnit(config.durationUnit || "weeks")
        if (config.selectedOption) setSelectedOption(config.selectedOption)
      } catch (e) {
        console.error("Error loading saved configuration", e)
      }
    }
  }, [])

  // Handle navigation to calculator
  const handleNext = () => {
    // Save adjustments to localStorage
    const savedConfig = localStorage.getItem("fencingCalculatorConfig") || "{}"
    const config = JSON.parse(savedConfig)
    localStorage.setItem(
      "fencingCalculatorConfig",
      JSON.stringify({
        ...config,
        metersRequired,
        hireDuration,
        durationUnit: durationUnit || "weeks",
      }),
    )

    // Navigate to calculator
    router.push("/calculator")
  }

  // Handle direct navigation to calculator
  const handleSkipToCalculator = () => {
    router.push("/calculator")
  }

  // Handle back navigation
  const handleBack = () => {
    router.push("/purchase-options")
  }

  // Calculate slider percentage for fill
  const getMetersPercentage = () => (metersRequired / 800) * 100
  const getDurationPercentage = () => {
    const min = getMinimumDuration(durationUnit)
    const max = getMaxDuration(durationUnit)
    return ((hireDuration - min) / (max - min)) * 100
  }

  // Handle meters input change
  const handleMetersChange = (e) => {
    const value = e.target.value === "" ? "" : Number(e.target.value)
    if (value === "" || (value >= 1 && value <= 800)) {
      setMetersRequired(value === "" ? "" : Number(value))
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
      setHireDuration(value === "" ? "" : Number(value))
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUnitDropdownOpen && !event.target.closest(".relative")) {
        setIsUnitDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isUnitDropdownOpen])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        {/* Header section with standardized spacing */}
        <div className="text-center mb-16 mt-16">
          <h1 className="text-[48px] font-bold mb-6 font-heading text-[#222] leading-tight">
            Adjust for what you need!
          </h1>
          <div className="flex items-center justify-center">
            <button
              onClick={handleSkipToCalculator}
              className="inline-flex items-center bg-[#B82429] text-white font-medium px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all duration-200 hover:bg-[#a01f24]"
            >
              <Calculator size={18} className="mr-2 text-white" />
              <span>I have it figured out calculate my costs</span>
              <span className="ml-1 font-bold">»»</span>
            </button>
          </div>
        </div>

        {/* Main content area */}
        <div className="w-full max-w-md mb-16">
          {/* Meters of Fencing Required */}
          <div className="mb-8">
            <div className="font-bold mb-3 font-heading text-gray-800 text-lg">Meters of Fencing Required</div>
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 shadow-sm mb-4">
              <input
                type="number"
                min="1"
                max="800"
                value={metersRequired}
                onChange={handleMetersChange}
                onBlur={handleMetersBlur}
                className="text-xl font-semibold font-sans w-full bg-transparent border-none focus:outline-none text-gray-800"
              />
            </div>
            <div className="relative h-3 bg-gray-200 rounded-full shadow-inner">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#B82429] to-[#d63447] rounded-full shadow-sm"
                style={{ width: `${getMetersPercentage()}%` }}
              ></div>
              <div
                className="absolute top-0 w-6 h-6 bg-white border-3 border-[#B82429] rounded-full shadow-lg -mt-1.5 transform -translate-x-1/2 hover:scale-110 transition-transform duration-200"
                style={{ left: `${getMetersPercentage()}%` }}
              ></div>
              <input
                type="range"
                min="1"
                max="800"
                value={metersRequired || 1}
                onChange={(e) => setMetersRequired(Number(e.target.value))}
                className="absolute top-0 left-0 w-full h-8 opacity-0 cursor-pointer z-10 -mt-2.5"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1m</span>
              <span>400m</span>
              <span>800m</span>
            </div>
          </div>

          {/* Hire Duration - only show if hire was selected */}
          {selectedOption === "hire" && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <div className="font-bold mb-3 font-heading text-gray-800 text-lg">Hire Duration</div>
                <div className="flex items-center">
                  <span className="text-sm mr-3 text-gray-700 font-medium">Unit:</span>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsUnitDropdownOpen(!isUnitDropdownOpen)}
                      className="flex items-center justify-between w-28 px-4 py-2.5 text-sm font-semibold text-gray-800 bg-white border-2 border-[#B82429] rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#B82429] focus:ring-offset-2 transition-all duration-200"
                    >
                      <span>{DURATION_UNITS.find((unit) => unit.id === durationUnit)?.label || "Weeks"}</span>
                      <svg
                        className={`w-4 h-4 ml-2 text-[#B82429] transition-transform duration-200 ${isUnitDropdownOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isUnitDropdownOpen && (
                      <div className="absolute z-10 w-28 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
                        {DURATION_UNITS.map((unit, index) => (
                          <button
                            key={unit.id}
                            type="button"
                            onClick={() => {
                              setDurationUnit(unit.id)
                              setIsUnitDropdownOpen(false)
                            }}
                            className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors duration-150 ${
                              index === 0 ? "rounded-t-lg" : ""
                            } ${index === DURATION_UNITS.length - 1 ? "rounded-b-lg" : ""} ${
                              durationUnit === unit.id ? "bg-[#B82429]/5" : ""
                            }`}
                          >
                            <span>{unit.label}</span>
                            {durationUnit === unit.id && (
                              <svg className="w-4 h-4 text-[#B82429]" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 shadow-sm mb-4">
                <input
                  type="number"
                  min={getMinimumDuration(durationUnit)}
                  max={getMaxDuration(durationUnit)}
                  value={hireDuration}
                  onChange={handleDurationChange}
                  onBlur={handleDurationBlur}
                  className="text-xl font-semibold font-sans w-full bg-transparent border-none focus:outline-none text-gray-800"
                />
              </div>
              <div className="relative h-3 bg-gray-200 rounded-full shadow-inner">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#B82429] to-[#d63447] rounded-full shadow-sm"
                  style={{ width: `${getDurationPercentage()}%` }}
                ></div>
                <div
                  className="absolute top-0 w-6 h-6 bg-white border-3 border-[#B82429] rounded-full shadow-lg -mt-1.5 transform -translate-x-1/2 hover:scale-110 transition-transform duration-200"
                  style={{ left: `${getDurationPercentage()}%` }}
                ></div>
                <input
                  type="range"
                  min={getMinimumDuration(durationUnit)}
                  max={getMaxDuration(durationUnit)}
                  value={hireDuration || getMinimumDuration(durationUnit)}
                  onChange={(e) => setHireDuration(Number(e.target.value))}
                  className="absolute top-0 left-0 w-full h-8 opacity-0 cursor-pointer z-10 -mt-2.5"
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
          )}

          {/* Next button */}
          <div className="flex justify-center">
            <button
              onClick={handleNext}
              className="bg-[#B82429] text-white px-6 py-2 font-medium hover:bg-[#a01f24] transition-colors font-sans"
            >
              NEXT &gt;
            </button>
          </div>
        </div>

        {/* Back button */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-700 hover:text-[#B82429] transition-colors font-sans"
          >
            <ArrowLeft size={20} className="mr-1" />
            <span className="font-medium">Back</span>
          </button>
        </div>

        {/* Pagination dots */}
        <div className="mb-8">
          <PaginationDots currentStep={currentStep} totalSteps={totalSteps} />
        </div>
      </div>
    </div>
  )
}
