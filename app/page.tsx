"use client"

import { Suspense } from "react"
import FencingCalculatorIntegration from "@/components/fencing-calculator-integration"

export default function Page() {
  return (
    <main>
      <Suspense fallback={<div>Loading calculator...</div>}>
        <FencingCalculatorIntegration />
      </Suspense>
    </main>
  )
}
