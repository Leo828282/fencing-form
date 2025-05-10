"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Truck, MapPin, RotateCw, AlertCircle, CheckCircle2, DollarSign, Info } from "lucide-react"
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

interface DeliveryCalculatorRedesignProps {
  onDeliveryFeeCalculated: (fee: number) => void
}

export default function DeliveryCalculatorRedesign({ onDeliveryFeeCalculated }: DeliveryCalculatorRedesignProps) {
  const [customerAddress, setCustomerAddress] = useState("")
  const [distance, setDistance] = useState<number | null>(null)
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [distanceCache, setDistanceCache] = useState<DistanceCache>({})
  const [cacheStatus, setCacheStatus] = useState<"hit" | "miss" | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)

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

  // Calculate delivery fee based on distance
  const calculateDeliveryFee = (distanceInKm: number): number => {
    if (distanceInKm <= BASE_DISTANCE) {
      return BASE_FEE
    } else {
      const additionalKm = distanceInKm - BASE_DISTANCE
      return BASE_FEE + additionalKm * ADDITIONAL_KM_RATE
    }
  }

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
        setUsingFallback(true)
      } else {
        // Add to cache
        addToCache(COMPANY_ADDRESS, customerAddress, result.distance)

        setDistance(result.distance)
        setDeliveryFee(result.fee)
        onDeliveryFeeCalculated(result.fee)
      }
    } catch (err) {
      console.error("Error calculating distance:", err)
      setError("Failed to calculate distance. Using estimated distance.")
      setUsingFallback(true)
    } finally {
      setIsCalculating(false)
    }
  }, [customerAddress, onDeliveryFeeCalculated])

  // Auto-calculate when address changes (with debounce)
  useEffect(() => {
    if (customerAddress.trim().length > 5) {
      const timer = setTimeout(() => {
        calculateDistanceFromAddress()
      }, 1000) // Wait 1 second after typing stops

      return () => clearTimeout(timer)
    }
  }, [customerAddress, calculateDistanceFromAddress])

  return (
    <Card className={`bg-white shadow-md w-full ${poppins.className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Truck className="mr-2 text-[#b82429]" />
          Delivery Fee Calculator
        </CardTitle>
      </CardHeader>

      <CardContent>
        {usingFallback && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-700 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              Using estimated distances. For accurate calculations, please use on your live website.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Left side - Input fields */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <label htmlFor="company-address" className="block text-sm font-medium mb-1">
                Our Location
              </label>
              <Input id="company-address" value={COMPANY_ADDRESS} disabled className="bg-gray-50" />
            </div>

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
              <p className="text-xs text-gray-500 mt-1">
                {usingFallback
                  ? "Enter your delivery address for an estimated distance"
                  : "Start typing to see address suggestions"}
              </p>
              {cacheStatus === "hit" && (
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Using cached distance calculation
                </p>
              )}
            </div>

            <div>
              <label htmlFor="distance-display" className="block text-sm font-medium mb-1">
                Distance (km)
              </label>
              <div className="relative">
                <Input
                  id="distance-display"
                  value={distance !== null ? `${distance.toFixed(1)} km` : ""}
                  readOnly
                  className="bg-gray-50"
                  placeholder="(km)"
                />
                {isCalculating && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <RotateCw className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
              {error && (
                <div className="text-red-500 text-sm mt-1 flex items-start">
                  <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="delivery-fee" className="block text-sm font-medium mb-1">
                Delivery Fee ($)
              </label>
              <div className="relative">
                <Input
                  id="delivery-fee"
                  value={deliveryFee !== null ? `${deliveryFee.toFixed(2)}` : ""}
                  readOnly
                  className="bg-gray-50 font-medium pl-7"
                  placeholder="Calculated after address entry"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  {!deliveryFee && <DollarSign className="h-4 w-4 text-gray-400" />}
                </div>
                {isCalculating && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <RotateCw className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {deliveryFee !== null
                  ? distance && distance <= BASE_DISTANCE
                    ? `Flat rate of $${BASE_FEE} for locations within ${BASE_DISTANCE}km of our depot.`
                    : `$${BASE_FEE} base rate for the first ${BASE_DISTANCE}km plus $${ADDITIONAL_KM_RATE} per additional km.`
                  : "Our delivery fee will be calculated automatically after you enter a valid address."}
              </p>
            </div>

            {distance !== null && deliveryFee !== null && (
              <div className="bg-gray-100 p-3 rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Delivery Summary</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {distance.toFixed(1)} km from our location
                      {usingFallback && <span className="text-xs text-yellow-600 ml-1">(estimated)</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#b82429]">${deliveryFee.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Total Delivery Fee</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right side - Map */}
          <div className="md:col-span-3">
            <div className="w-full h-[300px] rounded-md border border-gray-200 overflow-hidden relative">
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-500">
                  <MapPin className="h-12 w-12 text-[#b82429] mx-auto mb-2" />
                  <p className="text-sm font-medium">Map preview unavailable</p>
                  <p className="text-xs max-w-sm mt-1">
                    Using estimated distances for preview. For accurate calculations and map display, please use on your
                    live website.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 rounded-md">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p>
                  Our delivery fee is calculated as $100 base rate for the first 50km plus $2 per additional km. The
                  actual fee may vary based on traffic conditions, accessibility, and other factors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
