"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import ProductSelection from "@/components/product-selection"

export default function HomePage() {
  const router = useRouter()

  // Reset the configuration when landing on the home page
  useEffect(() => {
    // Keep any existing configuration but mark that we're starting a new session
    const savedConfig = localStorage.getItem("fencingCalculatorConfig")
    if (savedConfig) {
      const config = JSON.parse(savedConfig)
      localStorage.setItem(
        "fencingCalculatorConfig",
        JSON.stringify({
          ...config,
          newSession: true,
        }),
      )
    } else {
      localStorage.setItem(
        "fencingCalculatorConfig",
        JSON.stringify({
          newSession: true,
        }),
      )
    }
  }, [])

  return <ProductSelection />
}
