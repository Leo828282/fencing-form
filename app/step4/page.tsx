"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import AdjustmentsSelection from "@/components/adjustments-selection"

export default function Step4Page() {
  const router = useRouter()

  // Check if previous steps are completed
  useEffect(() => {
    const savedConfig = localStorage.getItem("fencingCalculatorConfig")
    if (
      !savedConfig ||
      !JSON.parse(savedConfig).selectedFenceType ||
      !JSON.parse(savedConfig).selectedFeetOption ||
      !JSON.parse(savedConfig).selectedOption
    ) {
      router.push("/")
    }
  }, [router])

  return <AdjustmentsSelection />
}
