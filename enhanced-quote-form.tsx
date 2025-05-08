"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle } from "lucide-react"
import { Poppins } from "next/font/google"
import Script from "next/script"

// Initialize the Poppins font
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

interface EnhancedQuoteFormProps {
  onClose: () => void
  itemsList: Array<{
    name: string
    quantity: number
    price: number
    priceDisplay?: string
    isTBC?: boolean
    category?: string
  }>
  totalPrice: number
  selectedOption: string
  metersRequired: number
  hireDuration?: number
  durationUnit?: string
  formatDuration?: () => string
  formatPrice?: (price: number) => string
}

export default function EnhancedQuoteForm({
  onClose,
  itemsList,
  totalPrice,
  selectedOption,
  metersRequired,
  hireDuration,
  durationUnit,
  formatDuration,
  formatPrice = (price) => price.toFixed(2),
}: EnhancedQuoteFormProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  // Handle form submission message
  useEffect(() => {
    if (scriptLoaded) {
      const handleMessage = (event) => {
        // Check if the message is from our form
        if (event.data && typeof event.data === "string" && event.data.includes("formSubmitted")) {
          setShowSuccess(true)
          // Close the modal after showing success message
          setTimeout(() => {
            onClose()
          }, 2000)
        }
      }

      window.addEventListener("message", handleMessage)
      return () => window.removeEventListener("message", handleMessage)
    }
  }, [scriptLoaded, onClose])

  // Handle iframe load
  const handleScriptLoad = () => {
    setScriptLoaded(true)
    setIsLoading(false)
  }

  // Open in new tab when submit fails
  const handleSubmitError = () => {
    window.open("https://api.leadconnectorhq.com/widget/form/rxYMbGaZWJjlM3c0clDG", "_blank")
    setShowSuccess(true)
    setTimeout(() => {
      onClose()
    }, 2000)
  }

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 ${poppins.className}`}
      style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div
        className="bg-[#1D1D1D] rounded-lg shadow-xl w-full max-h-[90vh] overflow-auto"
        style={{ maxWidth: "996px" }}
      >
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 border-b border-[#333333] bg-[#1D1D1D]">
          <h2 className="text-xl font-bold text-white">Request a Quote</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#333333] text-white transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 md:p-8">
          {showSuccess ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 animate-fadeIn">
              <div className="relative">
                <div className="absolute inset-0 bg-[#B82429] rounded-full scale-[1.15] blur-md opacity-30 animate-pulse"></div>
                <div className="bg-[#B82429] rounded-full p-6 mb-8 relative z-10 shadow-lg">
                  <CheckCircle size={64} className="text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-3 animate-slideUp">Thank you!</h3>
              <p className="text-2xl text-white text-center mb-6 animate-slideUp" style={{ animationDelay: "100ms" }}>
                We'll be in touch!
              </p>
              <div
                className="w-16 h-1 bg-[#B82429] rounded-full animate-slideUp"
                style={{ animationDelay: "200ms" }}
              ></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left side - Quote Summary */}
              <div className="flex flex-col">
                <h3 className="text-lg font-bold mb-6 text-white flex items-center">
                  <span className="w-1 h-6 bg-[#B82429] rounded-full mr-3"></span>
                  Quote Summary
                </h3>

                <div className="space-y-4 mb-6 bg-[#252525] p-5 rounded-lg border border-[#333333]">
                  <div className="flex justify-between">
                    <span className="text-[#cccccc]">Option:</span>
                    <span className="font-medium text-white">
                      {selectedOption === "purchase" ? "Purchase" : "Hire"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#cccccc]">Fencing Required:</span>
                    <span className="font-medium text-white">{metersRequired} meters</span>
                  </div>
                  {selectedOption === "hire" && (
                    <div className="flex justify-between">
                      <span className="text-[#cccccc]">Duration:</span>
                      <span className="font-medium text-white">
                        {formatDuration ? formatDuration() : `${hireDuration} ${durationUnit}`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mb-6 bg-[#252525] p-5 rounded-lg border border-[#333333]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#cccccc] font-medium">Total:</span>
                    <span className="text-[#B82429] text-xl font-bold">${formatPrice(totalPrice)}</span>
                  </div>
                </div>

                <h4 className="font-bold mb-4 text-white flex items-center">
                  <span className="w-1 h-5 bg-[#B82429] rounded-full mr-3"></span>
                  Items Included:
                </h4>
                <div className="mb-6 overflow-visible bg-[#252525] rounded-lg border border-[#333333]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#333333]">
                        <th className="text-left py-3 px-4 font-medium text-[#cccccc]">Item</th>
                        <th className="text-right py-3 px-4 font-medium text-[#cccccc]">Qty</th>
                        <th className="text-right py-3 px-4 font-medium text-[#cccccc]">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemsList
                        .filter((item) => !item.name.includes("Hire Duration") && !item.name.includes("Discount:"))
                        .map((item, index, filteredItems) => (
                          <tr
                            key={index}
                            className={`border-t border-[#333333] hover:bg-[#2a2a2a] transition-colors ${
                              index === filteredItems.length - 1 ? "rounded-b-lg overflow-hidden" : ""
                            }`}
                          >
                            <td className="py-3 px-4 text-[#cccccc]">
                              <div className="flex items-center">
                                <span className="ml-2">{item.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-[#B82429]">{item.quantity}</td>
                            <td className="py-3 px-4 text-right text-[#cccccc]">
                              {item.isTBC ? (
                                <span>TBC</span>
                              ) : item.priceDisplay ? (
                                <span>
                                  {item.priceDisplay.includes("$") ? item.priceDisplay : `${item.priceDisplay}`}
                                </span>
                              ) : (
                                <span>${formatPrice(item.price)}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-[#252525] p-4 rounded-lg border border-[#333333] text-xs text-[#999999]">
                  By submitting this form, you agree to be contacted regarding your quote request. We'll use your
                  information to prepare a detailed quote for your fencing needs.
                </div>
              </div>

              {/* Right side - Form */}
              <div>
                <h3 className="text-lg font-bold mb-6 text-white flex items-center">
                  <span className="w-1 h-6 bg-[#B82429] rounded-full mr-3"></span>
                  Your Details
                </h3>

                {/* Loading Indicator */}
                {isLoading && (
                  <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#B82429]"></div>
                  </div>
                )}

                {/* CDV Embedded Form */}
                <div
                  className="ghl-form-wrapper"
                  style={{
                    display: isLoading ? "none" : "block",
                    position: "relative",
                    height: "500px", // Fixed height to cut off below Submit Quote
                    overflow: "hidden",
                  }}
                >
                  <iframe
                    src="https://api.leadconnectorhq.com/widget/form/rxYMbGaZWJjlM3c0clDG"
                    style={{
                      width: "100%",
                      height: "700px", // Make iframe taller than container to hide bottom
                      border: "none",
                      borderRadius: "8px",
                      marginTop: "-20px", // Adjust to position the form properly
                    }}
                    id="inline-rxYMbGaZWJjlM3c0clDG"
                    data-layout="{'id':'INLINE'}"
                    data-trigger-type="alwaysShow"
                    data-trigger-value=""
                    data-activation-type="alwaysActivated"
                    data-activation-value=""
                    data-deactivation-type="neverDeactivate"
                    data-deactivation-value=""
                    data-form-name="Form 1"
                    data-height="700"
                    data-layout-iframe-id="inline-rxYMbGaZWJjlM3c0clDG"
                    data-form-id="rxYMbGaZWJjlM3c0clDG"
                    title="Form 1"
                  />
                  <Script
                    src="https://link.msgsndr.com/js/form_embed.js"
                    onLoad={handleScriptLoad}
                    strategy="lazyOnload"
                  />

                  {/* Error handler overlay */}
                  <div className="absolute inset-0 bg-transparent z-10" onClick={handleSubmitError}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add CSS for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.5; }
          100% { transform: scale(1); opacity: 0.3; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
        }
        
        .animate-pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  )
}
