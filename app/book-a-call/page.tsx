"use client"
import { useState } from "react"
import { Mail, Phone, Calendar } from "lucide-react"

export default function BookACallPage() {
  const [showBookingForm, setShowBookingForm] = useState(false)

  // Contact information
  const phoneNumber = "0489 088 149"
  const emailAddress = "Team@capridigital.com.au"

  // Get booking URL from environment variable with fallback
  const bookingUrl =
    process.env.NEXT_PUBLIC_BOOKING_URL || "https://api.leadconnectorhq.com/widget/booking/tj0ThRD4A9JGUpWp4WiU"

  // Handle back button click
  const handleBack = () => {
    if (showBookingForm) {
      setShowBookingForm(false)
    } else {
      window.location.href = "/calculator"
    }
  }

  if (showBookingForm) {
    return (
      <div className="h-screen w-screen flex flex-col overflow-hidden">
        <div className="flex-1">
          <iframe
            src={bookingUrl}
            className="w-full h-full border-0"
            style={{ height: "calc(100vh - 60px)" }}
            title="Booking Calendar"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        </div>
        <div className="p-4 text-center bg-white">
          <button onClick={handleBack} className="text-[#b82429] hover:underline text-lg font-medium font-sans">
            ← Back to Contact Options
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-screen bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center py-8">
        <div className="container mx-auto px-4 w-full max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4 font-heading">Contact Us</h2>
            <p className="text-xl text-gray-600 font-sans">For quotes and inquiries, please contact us:</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Book a Call Option - Now first */}
            <div className="bg-white rounded-lg border p-12 shadow-md text-center">
              <div className="text-[#b82429] mb-8 flex justify-center">
                <Calendar size={80} />
              </div>

              <h3 className="font-bold text-3xl mb-4 text-gray-800 font-heading">Book a Call</h3>
              <p
                className="text-2xl text-[#b82429] underline cursor-pointer hover:text-[#9e1f23] font-sans"
                onClick={() => setShowBookingForm(true)}
              >
                Schedule online →
              </p>
            </div>

            {/* Call Option - Now second */}
            <div className="bg-white rounded-lg border p-12 shadow-md text-center">
              <div className="text-[#b82429] mb-8 flex justify-center">
                <Phone size={80} />
              </div>

              <h3 className="font-bold text-3xl mb-4 text-gray-800 font-heading">Call Us</h3>
              <p className="text-2xl text-gray-700 font-sans">{phoneNumber}</p>
            </div>

            {/* Email Option - Stays third */}
            <div className="bg-white rounded-lg border p-12 shadow-md text-center">
              <div className="text-[#b82429] mb-8 flex justify-center">
                <Mail size={80} />
              </div>

              <h3 className="font-bold text-3xl mb-4 text-gray-800 font-heading">Email Us</h3>
              <p className="text-2xl text-gray-700 font-sans">{emailAddress}</p>
            </div>
          </div>

          <div className="mt-12 text-center text-gray-600">
            <p className="text-lg font-sans">We'll respond to your inquiry within 24 hours during business days.</p>
          </div>
        </div>
      </div>

      <div className="p-4 text-center bg-white border-t">
        <button onClick={handleBack} className="text-[#b82429] hover:underline text-lg font-medium font-sans">
          ← Back to Calculator
        </button>
      </div>
    </div>
  )
}
