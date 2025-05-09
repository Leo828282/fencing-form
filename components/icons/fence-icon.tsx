import type React from "react"
import Image from "next/image"

interface FenceIconProps {
  size?: number
  className?: string
}

export const FenceIcon: React.FC<FenceIconProps> = ({ size = 16, className = "" }) => {
  return (
    <div style={{ width: size, height: size, display: "inline-flex" }} className={className}>
      <Image src="/icons/fence-icon.png" alt="Fence" width={size} height={size} style={{ objectFit: "contain" }} />
    </div>
  )
}
