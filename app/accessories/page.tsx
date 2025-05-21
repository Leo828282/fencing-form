"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import PageLayout from "@/components/shared/page-layout"

// Accessories options with their details
const ACCESSORIES_OPTIONS = [
  {
    id: "plastic-feet",
    name: "Premium Plastic Temporary Fencing Feet (27kgs)",
    shortName: "Premium Plastic Temporary Fencing Feet (27kgs)",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5-usBBG0U2hLlp78Sq6UrrnQYZdWMxE7.png",
    textSize: "text-sm",
  },
  {
    id: "hook-stay",
    name: "Hook Stay",
    shortName: "Hook Stay",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6-MUbqRoObX25UJzuufpfjtpkeyNGwx3.png",
    textSize: "text-base",
  },
]

export default function AccessoriesSelection() {
  const router = useRouter()
  const [hoveredAccessory, setHoveredAccessory] = useState<string | null>(null)

  // Handle accessory selection - navigate immediately
  const handleAccessorySelect = (accessoryId: string) => {
    // Save selection to localStorage
    const savedConfig = localStorage.getItem("fencingCalculatorConfig") || "{}"
    const config = JSON.parse(savedConfig)
    localStorage.setItem(
      "fencingCalculatorConfig",
      JSON.stringify({
        ...config,
        selectedAccessory: accessoryId,
      }),
    )

    // Navigate immediately
    router.push("/purchase-options")
  }

  return (
    <PageLayout title="Select what you're looking for!" currentStep={2} totalSteps={5} backHref="/">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 w-full justify-center">
        {ACCESSORIES_OPTIONS.map((option) => (
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
            onClick={() => handleAccessorySelect(option.id)}
            onMouseEnter={() => setHoveredAccessory(option.id)}
            onMouseLeave={() => setHoveredAccessory(null)}
            style={{ height: "400px" }}
          >
            <div className="relative h-full w-full">
              {/* Image container - now with overlay */}
              <div className="h-full w-full relative bg-white flex items-center justify-center">
                <div className="h-[340px] w-full flex items-center justify-center p-4">
                  {/* Black overlay - covers the entire image area */}
                  <div className="absolute inset-0 bg-black z-10" style={{ opacity: 0.043 }}></div>
                  <img
                    src={option.image || "/placeholder.svg"}
                    alt={option.name}
                    className="object-contain max-h-full max-w-full relative z-0"
                  />
                </div>

                {/* Product name banner */}
                <div
                  className={`absolute bottom-0 left-0 right-0 bg-[#b82429] text-white py-4 text-center font-medium h-[60px] flex items-center justify-center transition-opacity duration-300 z-20 ${
                    hoveredAccessory === option.id ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <div className={`px-2 ${option.textSize} font-sans`}>{option.shortName}</div>
                </div>

                {/* Hover overlay */}
                <div
                  className={`absolute inset-0 bg-black/75 flex items-center justify-center transition-all duration-300 ease-in-out ${
                    hoveredAccessory === option.id ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="text-white font-bold text-2xl tracking-wide font-heading">SELECT OPTION</div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </PageLayout>
  )
}
