interface PaginationDotsProps {
  currentStep: number
  totalSteps: number
}

export default function PaginationDots({ currentStep, totalSteps = 5 }: PaginationDotsProps) {
  return (
    <div className="flex justify-center space-x-2 mt-8">
      {[...Array(totalSteps)].map((_, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full ${
            i + 1 === currentStep
              ? "bg-[#b82429]"
              : i + 1 < currentStep
                ? "bg-[#b82429] bg-opacity-50" // Transparent red for completed steps
                : "bg-gray-300"
          }`}
        />
      ))}
    </div>
  )
}
