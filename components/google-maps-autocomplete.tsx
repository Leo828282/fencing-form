"use client"

import { useEffect, useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { RotateCw, MapPin, X } from "lucide-react"
import { getPlacePredictions, getPlaceDetails } from "@/app/actions/maps-server-actions"

interface Prediction {
  place_id: string
  description: string
}

interface GoogleMapsAutocompleteProps {
  onAddressSelect: (address: string, placeId: string) => void
  onCalculating?: (isCalculating: boolean) => void
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  isValid?: boolean
  className?: string
  id?: string
  name?: string
}

export default function GoogleMapsAutocomplete({
  onAddressSelect,
  onCalculating,
  value,
  onChange,
  placeholder = "Enter address",
  error,
  isValid,
  className = "",
  id = "google-maps-autocomplete",
  name = "address",
}: GoogleMapsAutocompleteProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showClear, setShowClear] = useState(false)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [showPredictions, setShowPredictions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const predictionsRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch predictions when input changes
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Don't search if input is too short
    if (value.length < 3) {
      setPredictions([])
      setShowPredictions(false)
      return
    }

    // Set a new timer
    debounceTimerRef.current = setTimeout(async () => {
      setIsLoading(true)
      if (onCalculating) onCalculating(true)

      try {
        // Use server action instead of client-side API call
        const predictions = await getPlacePredictions(value)

        if (predictions && predictions.length > 0) {
          setPredictions(predictions)
          setShowPredictions(true)
        } else {
          setPredictions([])
          setShowPredictions(false)
        }
      } catch (error) {
        console.error("Error fetching predictions:", error)
        setPredictions([])
        setShowPredictions(false)
      } finally {
        setIsLoading(false)
        if (onCalculating) onCalculating(false)
      }
    }, 300) // 300ms debounce

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [value, onCalculating])

  // Handle prediction selection
  const handleSelectPrediction = async (prediction: Prediction) => {
    setIsLoading(true)
    if (onCalculating) onCalculating(true)

    try {
      // Use server action instead of client-side API call
      const placeDetails = await getPlaceDetails(prediction.place_id)

      if (placeDetails && placeDetails.formatted_address) {
        const address = placeDetails.formatted_address
        onChange(address)
        onAddressSelect(address, prediction.place_id)
        setShowClear(!!address)
      } else {
        // If we can't get details, at least use the description
        onChange(prediction.description)
        onAddressSelect(prediction.description, prediction.place_id)
        setShowClear(!!prediction.description)
      }
    } catch (error) {
      console.error("Error fetching place details:", error)
      // Fallback to using the prediction description
      onChange(prediction.description)
      onAddressSelect(prediction.description, prediction.place_id)
      setShowClear(!!prediction.description)
    } finally {
      setIsLoading(false)
      if (onCalculating) onCalculating(false)
      setShowPredictions(false)
    }
  }

  // Close predictions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        predictionsRef.current &&
        !predictionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowPredictions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Update showClear state when value changes
  useEffect(() => {
    setShowClear(!!value)
  }, [value])

  // Handle clear button click
  const handleClearClick = () => {
    onChange("")
    setShowClear(false)
    setPredictions([])
    setShowPredictions(false)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        id={id}
        name={name}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setShowClear(!!e.target.value)
        }}
        onFocus={() => {
          if (predictions.length > 0) {
            setShowPredictions(true)
          }
        }}
        placeholder={placeholder}
        className={`pr-10 ${className} ${error ? "border-red-500" : ""} ${isValid ? "border-green-500" : ""}`}
        autoComplete="off"
      />

      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        {isLoading ? (
          <RotateCw className="h-5 w-5 animate-spin text-gray-400" />
        ) : isValid ? (
          <MapPin className="h-5 w-5 text-green-500" />
        ) : showClear ? (
          <button
            type="button"
            onClick={handleClearClick}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      {/* Predictions dropdown */}
      {showPredictions && (
        <div
          ref={predictionsRef}
          className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto"
        >
          {predictions.map((prediction) => (
            <div
              key={prediction.place_id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => handleSelectPrediction(prediction)}
            >
              {prediction.description}
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
