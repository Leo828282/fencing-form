"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Truck, MapPin, RotateCw, AlertCircle, ChevronUp, ChevronDown, X } from "lucide-react"
import { Poppins } from "next/font/google"
import { calculateDistance } from "@/app/actions/maps-server-actions"

// Initialize the Poppins font
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

// Constants for delivery fee calculation
const BASE_FEE = 100
const BASE_DISTANCE = 50 // km
const ADDITIONAL_KM_RATE = 2 // $ per km

// Company address (starting point)
const COMPANY_ADDRESS = "21C Richmond Rd, Homebush NSW 2140"

// Cache expiration time (24 hours in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000

// Interface for cache entries
interface CacheEntry {
  distance: number
  timestamp: number
}

// Type for the distance cache
interface DistanceCache {
  [key: string]: CacheEntry
}

interface DeliveryCalculatorProps {
  onDeliveryFeeCalculated: (fee: number) => void
}

export default function DeliveryCalculator({ onDeliveryFeeCalculated }: DeliveryCalculatorProps) {
  const [customerAddress, setCustomerAddress] = useState("")
  const [distance, setDistance] = useState<number | null>(null)
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [distanceCache, setDistanceCache] = useState<DistanceCache>({})
  const [cacheStatus, setCacheStatus] = useState<"hit" | "miss" | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Load cache from localStorage on component mount
  useEffect(() => {
    try {
      const cachedData = localStorage.getItem("distanceCache")
      if (cachedData) {
        const parsedCache = JSON.parse(cachedData) as DistanceCache

        // Clean expired entries
        const now = Date.now()
        const cleanedCache: DistanceCache = {}

        Object.entries(parsedCache).forEach(([key, entry]) => {
          if (now - entry.timestamp < CACHE_EXPIRATION) {
            cleanedCache[key] = entry
          }
        })

        setDistanceCache(cleanedCache)
        localStorage.setItem("distanceCache", JSON.stringify(cleanedCache))
      }
    } catch (err) {
      console.error("Error loading distance cache:", err)
      // If there's an error with the cache, just start fresh
      localStorage.removeItem("distanceCache")
    }
  }, [])

  // Save cache to localStorage when it changes
  useEffect(() => {
    if (Object.keys(distanceCache).length > 0) {
      try {
        localStorage.setItem("distanceCache", JSON.stringify(distanceCache))
      } catch (err) {
        console.error("Error saving distance cache:", err)
      }
    }
  }, [distanceCache])

  // Generate a cache key from addresses
  const getCacheKey = (origin: string, destination: string): string => {
    return `${origin.toLowerCase().trim()}|${destination.toLowerCase().trim()}`
  }

  // Check if a route is in the cache
  const getFromCache = (origin: string, destination: string): number | null => {
    const cacheKey = getCacheKey(origin, destination)
    const cachedEntry = distanceCache[cacheKey]

    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_EXPIRATION) {
      return cachedEntry.distance
    }

    return null
  }

  // Add a route to the cache
  const addToCache = (origin: string, destination: string, distance: number) => {
    const cacheKey = getCacheKey(origin, destination)
    const newCache = {
      ...distanceCache,
      [cacheKey]: {
        distance,
        timestamp: Date.now(),
      },
    }

    // Limit cache size to prevent localStorage issues (keep last 50 entries)
    const entries = Object.entries(newCache)
    if (entries.length > 50) {
      const sortedEntries = entries.sort((a, b) => b[1].timestamp - a[1].timestamp)
      const newEntries = sortedEntries.slice(0, 50)
      const limitedCache = Object.fromEntries(newEntries)
      setDistanceCache(limitedCache)
    } else {
      setDistanceCache(newCache)
    }
  }

  // Calculate distance using server action
  const calculateDistanceFromAddress = useCallback(async () => {
    if (!customerAddress.trim()) {
      setError("Please enter a delivery address")
      return
    }

    setIsCalculating(true)
    setError(null)
    setCacheStatus(null)

    // Check cache first
    const cachedDistance = getFromCache(COMPANY_ADDRESS, customerAddress)
    if (cachedDistance !== null) {
      setCacheStatus("hit")
      setDistance(cachedDistance)
      const fee = calculateDeliveryFee(cachedDistance)
      setDeliveryFee(fee)
      onDeliveryFeeCalculated(fee)
      setIsCalculating(false)
      return
    }

    setCacheStatus("miss")

    try {
      // Call the server action
      const result = await calculateDistance(customerAddress)

      if (result.error) {
        setError(result.error)
        setUsingFallback(result.usingFallback || false)
      } else {
        // Add to cache
        addToCache(COMPANY_ADDRESS, customerAddress, result.distance)

        setDistance(result.distance)
        setDeliveryFee(result.fee)
        onDeliveryFeeCalculated(result.fee)
        setUsingFallback(result.usingFallback || false)
      }
    } catch (err) {
      console.error("Error calculating distance:", err)
      setError("Failed to calculate distance. Please try again later.")
    } finally {
      setIsCalculating(false)
    }
  }, [customerAddress, onDeliveryFeeCalculated])

  // Calculate delivery fee based on distance
  const calculateDeliveryFee = (distanceInKm: number): number => {
    if (distanceInKm <= BASE_DISTANCE) {
      return BASE_FEE
    } else {
      const additionalKm = distanceInKm - BASE_DISTANCE
      return BASE_FEE + additionalKm * ADDITIONAL_KM_RATE
    }
  }

  // Auto-calculate when address changes (with debounce)
  useEffect(() => {
    if (customerAddress.trim().length > 5) {
      const timer = setTimeout(() => {
        calculateDistanceFromAddress()
      }, 1000) // Wait 1 second after typing stops

      return () => clearTimeout(timer)
    }
  }, [customerAddress, calculateDistanceFromAddress])

  // Toggle map view for mobile
  const toggleMapView = () => {
    setShowMap(!showMap)
  }

  // Format price with commas for thousands
  const formatPrice = (price: number) => {
    return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  return (
    <div className={`w-full ${poppins.className}`}>
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        {/* Collapsible Header - Larger touch target for mobile */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-5 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
          aria-expanded={isExpanded}
          aria-controls="delivery-calculator-content"
        >
          <div className="flex items-center">
            <Truck className="mr-3 text-[#b82429] h-6 w-6" />
            <h2 className="text-lg font-bold">Delivery Fee Calculator</h2>
          </div>
          <div className="text-gray-500">
            {isExpanded ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
          </div>
        </button>

        {/* Collapsible Content */}
        {isExpanded && (
          <div id="delivery-calculator-content" className="p-4">
            {/* Mobile View */}
            {isMobile ? (
              <div className="space-y-4">
                {/* Simple Address Input */}
                <div>
                  <label htmlFor="customer-address-mobile" className="block text-base font-medium mb-2">
                    Enter Delivery Address
                  </label>
                  <div className="relative">
                    <Input
                      id="customer-address-mobile"
                      placeholder="Type your address here"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className={`text-base py-6 ${isCalculating ? "pr-10" : ""}`}
                    />
                    {isCalculating && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <RotateCw className="h-5 w-5 animate-spin text-gray-400" />
                      </div>
                    )}
                  </div>
                  {error && (
                    <div className="text-red-500 text-sm mt-2 flex items-start">
                      <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}
                </div>

                {/* Results Section - Only show when we have results */}
                {distance !== null && deliveryFee !== null && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                    <div className="text-center mb-3">
                      <p className="text-sm text-gray-600">Your delivery fee:</p>
                      <p className="text-3xl font-bold text-[#b82429]">${formatPrice(deliveryFee)}</p>
                      <p className="text-sm text-gray-600 mt-1">{distance.toFixed(1)} km from our location</p>
                    </div>

                    {/* View Map Button */}
                    <Button
                      onClick={toggleMapView}
                      variant={showMap ? "outline" : "default"}
                      className="w-full py-6 mt-2 text-base"
                    >
                      {showMap ? (
                        <>
                          <X className="mr-2 h-5 w-5" />
                          Hide Map
                        </>
                      ) : (
                        <>
                          <MapPin className="mr-2 h-5 w-5" />
                          View on Map
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Map View - Only show when requested */}
                {showMap && (
                  <div className="w-full h-[300px] rounded-md border border-gray-200 overflow-hidden relative mt-4">
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <div className="text-center text-gray-500">
                        <MapPin className="h-12 w-12 text-[#b82429] mx-auto mb-2" />
                        <p className="text-sm">Using estimated distances</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Simple Fee Explanation */}
                <p className="text-sm text-gray-500 mt-2">
                  Delivery fee: $100 base rate for the first 50km plus $2 per additional km.
                </p>
              </div>
            ) : (
              /* Desktop View - Original Layout */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Left column - Input fields */}
                <div className="space-y-3">
                  <div>
                    <label htmlFor="customer-address" className="block text-sm font-medium mb-1">
                      Site Location / Address
                    </label>
                    <div className="relative">
                      <Input
                        id="customer-address"
                        placeholder="Enter delivery address"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className={isCalculating ? "pr-10" : ""}
                      />
                      {isCalculating && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <RotateCw className="h-4 w-4 animate-spin text-gray-400" />
                        </div>
                      )}
                    </div>
                    {error && (
                      <div className="text-red-500 text-xs mt-1 flex items-start">
                        <AlertCircle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                        <p>{error}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="distance-display" className="block text-sm font-medium mb-1">
                        Distance
                      </label>
                      <Input
                        id="distance-display"
                        value={distance !== null ? `${distance.toFixed(1)} km` : ""}
                        readOnly
                        className="bg-gray-50"
                        placeholder="(km)"
                      />
                    </div>

                    <div>
                      <label htmlFor="delivery-fee" className="block text-sm font-medium mb-1">
                        Delivery Fee
                      </label>
                      <div className="relative">
                        <Input
                          id="delivery-fee"
                          value={deliveryFee !== null ? `${deliveryFee.toFixed(2)}` : ""}
                          readOnly
                          className="bg-gray-50 font-medium"
                          placeholder="$0.00"
                        />
                      </div>
                    </div>
                  </div>

                  {distance !== null && deliveryFee !== null && (
                    <div className="mt-3 bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">Delivery Summary</p>
                          <p className="text-xs text-gray-600">{distance.toFixed(1)} km from our location</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-[#b82429]">${deliveryFee.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-500">
                    Delivery fee: $100 base rate for the first 50km plus $2 per additional km.
                  </p>
                </div>

                {/* Right column - Map */}
                <div className="md:col-span-2">
                  <div className="w-full h-[300px] rounded-md border border-gray-200 overflow-hidden relative">
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <div className="text-center text-gray-500">
                        <MapPin className="h-8 w-8 text-[#b82429] mx-auto mb-1" />
                        <p className="text-xs">Using estimated distances</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
