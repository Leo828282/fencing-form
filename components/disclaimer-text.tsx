import type React from "react"

interface DisclaimerTextProps {
  className?: string
}

export const DisclaimerText: React.FC<DisclaimerTextProps> = ({ className = "" }) => {
  return (
    <div className={`text-center text-xs text-gray-500 mt-2 px-4 ${className}`}>
      This calculation is a guide only and based on the limited information provided, excluding any fees or charges. It
      does not constitute a formal quote, nor a suggestion on recommendation of any product.
    </div>
  )
}
