"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import PurchaseHireSelection from "@/components/purchase-hire-selection"

export default function Step3Page() {
  const router = useRouter()

  // Check if previous steps are completed
  useEffect(() => {
    const savedConfig = localStorage.getItem("fencingCalculatorConfig")
    if (!savedConfig || !JSON.parse(savedConfig).selectedFenceType || !JSON.parse(savedConfig).selectedFeetOption) {
      router.push("/")
    }
  }, [router])

  return <PurchaseHireSelection />
}
