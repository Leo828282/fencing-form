"use client"

import type { ReactNode } from "react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import PaginationDots from "./pagination-dots"

interface PageLayoutProps {
  children: ReactNode
  title: string
  currentStep: number
  totalSteps: number
  backHref?: string
  skipToCalculator?: boolean
}

export default function PageLayout({
  children,
  title,
  currentStep,
  totalSteps,
  backHref,
  skipToCalculator = true,
}: PageLayoutProps) {
  const router = useRouter()

  const handleBack = () => {
    if (backHref) {
      router.push(backHref)
    }
  }

  const handleSkipToCalculator = () => {
    router.push("/calculator")
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        {/* Header section - consistent across all pages */}
        <div className="text-center mb-16 mt-16">
          <h1 className="text-[48px] font-bold mb-4 font-heading text-[#222] leading-tight">{title}</h1>
          {skipToCalculator && (
            <div className="flex items-center justify-center">
              <button
                onClick={handleSkipToCalculator}
                className="text-gray-600 flex items-center hover:text-[#b82429] transition-colors duration-300 font-sans"
              >
                I have it figured out calculate my costs
                <span className="ml-2 text-[#b82429]">»»»</span>
              </button>
            </div>
          )}
        </div>

        {/* Main content area */}
        <div className="w-full max-w-7xl mb-16">{children}</div>

        {/* Back button - consistent position across all pages */}
        {backHref && (
          <div className="mb-8">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-700 hover:text-[#b82429] transition-colors font-sans"
            >
              <ArrowLeft size={20} className="mr-1" />
              <span className="font-medium">Back</span>
            </button>
          </div>
        )}

        {/* Pagination dots - consistent across all pages */}
        <PaginationDots currentStep={currentStep} totalSteps={totalSteps} />
      </div>
    </div>
  )
}
