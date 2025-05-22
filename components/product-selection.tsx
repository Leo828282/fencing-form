"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Barlow, Roboto } from "next/font/google"
import PageLayout from "./shared/page-layout"

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

// Fence type options with their details
const FENCE_OPTIONS = [
  {
    id: "builders",
    name: "2.4m Builder's Temporary Smart Duty Panels (2.5mm Wire Mesh)",
    shortName: "2.4m Builder's Temporary Smart Duty Panels (2.5mm Wire Mesh)",
    image: "/images/builders-panel.png",
    textSize: "text-xs", // Changed from text-sm to text-xs to accommodate longer text
  },
  {
    id: "premium",
    name: "2.4m Premium Grade Heavy Duty Panels (4mm Wire Mesh)",
    shortName: "2.4m Premium Grade Heavy Duty Panels (4mm Wire Mesh)",
    image: "/images/premium-panel.png",
    textSize: "text-xs", // Changed from text-sm to text-xs to accommodate longer text
  },
  {
    id: "pool",
    name: "2.3m Temporary Fence Pool Panels",
    shortName: "2.3m Temporary Fence Pool Panels",
    image: "/images/pool-panel.png",
    textSize: "text-sm",
  },
  {
    id: "crowd",
    name: "2.2m Crowd Control Barriers",
    shortName: "2.2m Crowd Control Barriers",
    image: "/images/crowd-control.png",
    textSize: "text-base",
  },
]

export default function ProductSelection() {
  const router = useRouter()
  const [hoveredFenceType, setHoveredFenceType] = useState<string | null>(null)

  // Handle fence type selection - navigate immediately
  const handleFenceTypeSelect = (fenceTypeId: string) => {
    // Save selection to localStorage
    const savedConfig = localStorage.getItem("fencingCalculatorConfig") || "{}"
    const config = JSON.parse(savedConfig)
    localStorage.setItem(
      "fencingCalculatorConfig",
      JSON.stringify({
        ...config,
        selectedFenceType: fenceTypeId,
      }),
    )

    // Navigate immediately
    router.push("/accessories")
  }

  // Handle direct navigation to calculator
  const handleSkipToCalculator = () => {
    router.push("/calculator")
  }

  return (
    <PageLayout title="Select what you're looking for!" currentStep={1} totalSteps={5}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 w-full">
        {FENCE_OPTIONS.map((option) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            whileHover={{
              y: -5,
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
            className="relative cursor-pointer overflow-hidden shadow-md bg-white"
            onClick={() => handleFenceTypeSelect(option.id)}
            onMouseEnter={() => setHoveredFenceType(option.id)}
            onMouseLeave={() => setHoveredFenceType(null)}
            style={{ height: "400px" }}
          >
            <div className="relative h-full w-full">
              {/* Image container - now with overlay */}
              <div className="h-full w-full relative bg-white flex items-center justify-center">
                <div className="h-[340px] w-full flex items-center justify-center">
                  {/* Black overlay - covers the entire image area */}
                  <div className="absolute inset-0 bg-black z-10" style={{ opacity: 0.043 }}></div>
                  <img
                    src={option.image || "/placeholder.svg"}
                    alt={option.name}
                    className="object-contain max-h-full max-w-full p-4 relative z-0"
                  />
                </div>

                {/* Product name banner */}
                <div
                  className={`absolute bottom-0 left-0 right-0 bg-[#b82429] text-white py-4 text-center font-medium h-[60px] flex items-center justify-center transition-opacity duration-300 z-20 ${
                    hoveredFenceType === option.id ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <div className={`px-2 ${option.textSize}`}>{option.shortName}</div>
                </div>

                {/* Hover overlay - shows when hovering */}
                <div
                  className={`absolute inset-0 bg-black/75 flex items-center justify-center transition-all duration-300 ease-in-out ${
                    hoveredFenceType === option.id ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="text-white font-bold text-2xl tracking-wide">SELECT OPTION</div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </PageLayout>
  )
}
