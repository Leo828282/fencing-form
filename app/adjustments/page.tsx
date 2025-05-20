"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

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
  const totalSteps = 5

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

  // Calculate slider percentage for fill
  const getMetersPercentage = () => (metersRequired / 100) * 100
  const getDurationPercentage = () => {
    const min = getMinimumDuration(durationUnit)
    const max = getMaxDuration(durationUnit)
    return ((hireDuration - min) / (max - min)) * 100
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        {/* Header section */}
        <div className="text-center mb-8">
          <h1 className="text-[48px] font-bold mb-2 font-heading text-black">Adjust for what you need!</h1>
          <p className="text-gray-600 font-sans">
            <button onClick={handleSkipToCalculator} className="text-gray-600 hover:text-[#b82429]">
              I have it figured out calculate my costs ---&gt;
            </button>
          </p>
        </div>

        {/* Main content area */}
        <div className="w-full max-w-md">
          {/* Meters of Fencing Required */}
          <div className="mb-8">
            <div className="font-bold mb-2 font-heading">Meters of Fencing Required</div>
            <div className="bg-gray-100 p-4 rounded mb-3">
              <div className="text-lg font-sans">{metersRequired}</div>
            </div>
            <div className="relative h-2 bg-gray-300 rounded-full">
              <div
                className="absolute top-0 left-0 h-full bg-[#b82429] rounded-full"
                style={{ width: `${getMetersPercentage()}%` }}
              ></div>
              <div
                className="absolute top-0 w-5 h-5 bg-[#b82429] rounded-full -mt-1.5 transform -translate-x-1/2"
                style={{ left: `${getMetersPercentage()}%` }}
              ></div>
              <input
                type="range"
                min="1"
                max="100"
                value={metersRequired}
                onChange={(e) => setMetersRequired(Number(e.target.value))}
                className="absolute top-0 left-0 w-full h-8 opacity-0 cursor-pointer z-10 -mt-3"
              />
            </div>
          </div>

          {/* Hire Duration - only show if hire was selected */}
          {selectedOption === "hire" && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <div className="font-bold font-heading">Hire Duration</div>
                <div className="text-sm font-sans">
                  Unit:
                  <select
                    value={durationUnit || "weeks"}
                    onChange={(e) => setDurationUnit(e.target.value)}
                    className="ml-1 border-none bg-transparent font-sans"
                  >
                    <option value="weeks">Weeks ▼</option>
                    <option value="days">Days ▼</option>
                    <option value="months">Months ▼</option>
                  </select>
                </div>
              </div>
              <div className="bg-gray-100 p-4 rounded mb-3">
                <div className="text-lg font-sans">{hireDuration}</div>
              </div>
              <div className="relative h-2 bg-gray-300 rounded-full">
                <div
                  className="absolute top-0 left-0 h-full bg-[#b82429] rounded-full"
                  style={{ width: `${getDurationPercentage()}%` }}
                ></div>
                <div
                  className="absolute top-0 w-5 h-5 bg-[#b82429] rounded-full -mt-1.5 transform -translate-x-1/2"
                  style={{ left: `${getDurationPercentage()}%` }}
                ></div>
                <input
                  type="range"
                  min={getMinimumDuration(durationUnit)}
                  max={getMaxDuration(durationUnit)}
                  value={hireDuration}
                  onChange={(e) => setHireDuration(Number(e.target.value))}
                  className="absolute top-0 left-0 w-full h-8 opacity-0 cursor-pointer z-10 -mt-3"
                />
              </div>
            </div>
          )}

          {/* Back button */}
          <div className="flex justify-center mt-6 mb-6">
            <Link href="/purchase-options" className="flex items-center text-gray-600 hover:text-[#b82429] font-sans">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
          </div>

          {/* Next button */}
          <div className="flex justify-center mb-12">
            <button
              onClick={handleNext}
              className="bg-[#b82429] text-white px-6 py-2 font-medium hover:bg-[#a01f24] transition-colors font-sans"
            >
              NEXT &gt;
            </button>
          </div>
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center space-x-2">
          {[...Array(totalSteps)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i + 1 === currentStep ? "bg-[#b82429]" : i + 1 < currentStep ? "bg-[#e57373]" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
