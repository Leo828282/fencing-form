import type React from "react"
import Image from "next/image"

interface FenceImageIconProps {
  size?: number
  className?: string
}

export const FenceImageIcon: React.FC<FenceImageIconProps> = ({ size = 24, className = "" }) => {
  return (
    <div style={{ width: size, height: size }} className={className}>
      <Image src="/icons/fence-icon.png" alt="Fence" width={size} height={size} style={{ objectFit: "contain" }} />
    </div>
  )
}
