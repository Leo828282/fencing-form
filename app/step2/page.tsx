"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import FeetSelection from "@/components/feet-selection"

export default function Step2Page() {
  const router = useRouter()

  // Check if fence type is selected
  useEffect(() => {
    const savedConfig = localStorage.getItem("fencingCalculatorConfig")
    if (!savedConfig || !JSON.parse(savedConfig).selectedFenceType) {
      router.push("/")
    }
  }, [router])

  return <FeetSelection />
}
