import { Loader2 } from "lucide-react"

export default function BookingLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#b82429] mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800">Loading booking page...</h2>
        <p className="text-gray-500 mt-2">Please wait while we prepare your booking options.</p>
      </div>
    </div>
  )
}
