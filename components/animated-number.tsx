"use client"

import { useEffect, useState } from "react"

interface AnimatedNumberProps {
  value: number
  formatFn?: (value: number) => string
  duration?: number
}

const AnimatedNumber = ({ value, formatFn = (val) => val.toString(), duration = 0.5 }: AnimatedNumberProps) => {
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    setDisplayValue(value)
  }, [value])

  // Format the value using the provided format function
  const formattedValue = formatFn(displayValue)

  // Simply return the formatted value without animation
  return <span className="inline-block">{formattedValue}</span>
}

export default AnimatedNumber
