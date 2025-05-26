"use client"

import { useState, useEffect, useRef, useCallback, memo } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Footprints, CornerRightDown, DollarSign, Truck, Shield, Clock, Info, Grid, LinkIcon } from "lucide-react"
import ActionButtons from "./action-buttons"
import { FenceIcon } from "@/components/icons/fence-icon"

// Add CSS for the slider
const sliderStyles = `
  .slider-container {
    position: relative;
    height: 8px;
    background-color: #e5e7eb;
    border-radius: 9999px;
    margin: 1rem 0;
  }
  
  .slider-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: #b82429;
    border-radius: 9999px;
  }
`

// Memoize the action buttons component
const MemoizedActionButtons = memo(ActionButtons)

// Fence panel options with their details
const FENCE_OPTIONS = [
  {
    id: "builders",
    name: "Builder's Temporary Smart Duty Panels (2.5mm Wire Mesh)",
    length: 2.4,
    price: 50,
    hirePrice: 5,
    panelType: "smart_duty",
    needsClamp: true,
    needsBrace: true,
    panelsPerBrace: 7,
    description:
      "Smart Duty Panels are cost-effective with 2.5mm wire mesh, suitable for standard construction sites with moderate security needs.",
  },
  {
    id: "premium",
    name: "Premium Grade Heavy Duty Panels (4mm Wire Mesh)",
    length: 2.4,
    price: 80,
    hirePrice: 8,
    panelType: "heavy_duty",
    needsClamp: true,
    needsBrace: false,
    description:
      "Heavy Duty Panels feature 4mm wire mesh and are ideal for construction sites requiring maximum security and durability.",
  },
  {
    id: "pool",
    name: "Temporary Fence Pool Panels",
    length: 2.3,
    price: 95,
    hirePrice: 5,
    panelType: "pool",
    needsClamp: true,
    needsBrace: true,
    panelsPerBrace: 7,
    description:
      "Pool Panels are designed to meet pool safety regulations with smaller gaps in the mesh to prevent climbing.",
  },
  {
    id: "crowd",
    name: "Crowd Control Barriers",
    length: 2.2,
    price: 57,
    hirePrice: 5,
    panelType: "crowd_control",
    needsClamp: false,
    needsBrace: false,
    description:
      "Crowd Control Barriers are lightweight and portable, ideal for managing pedestrian traffic at events.",
  },
]

// Feet options for the fence
const FEET_OPTIONS = [
  {
    id: "feet",
    name: "Premium Plastic Temporary Fencing Feet (27kgs)",
    price: 25,
    hirePrice: 2,
    description:
      "UV resistant plastic is an anti-trip fluorescent red for increased visibility in all lighting conditions.",
  },
  {
    id: "hookStay",
    name: "Hook Stay",
    price: 35,
    hirePrice: 4,
    description:
      "Hook Stays provide the perfect reinforcement, ensuring your Temp Fence remains secure even in challenging conditions.",
  },
]

// Additional items with simplified names for display in the items list
const ADDITIONAL_ITEMS = {
  feet: { name: "Fencing Feet", price: 25, hirePrice: 0 },
  brace: { name: "Fencing Stay Support", price: 35, hirePrice: 10 },
  clamp: { name: "Fencing Clamp", price: 4, hirePrice: 4 },
  stayFeet: { name: "Fencing Feet (for braces)", price: 25, hirePrice: 2 },
  hookStay: { name: "Hook Stays", price: 35, hirePrice: 4 },
  delivery: { name: "Delivery Fee", price: 150, hirePrice: 150 },
}

// Additional items with full details
const ADDITIONAL_ITEMS_FULL = {
  feet: { name: "Premium Plastic Temporary Fencing Feet (27kgs)", price: 25, hirePrice: 0 },
  brace: { name: "Temporary Fencing Stay Support (Brace)", price: 35, hirePrice: 10 },
  clamp: { name: "Temporary Fencing Clamp", price: 4, hirePrice: 4 },
  stayFeet: { name: "Premium Plastic Temporary Fencing Feet for Braces", price: 25, hirePrice: 2 },
  hookStay: { name: "Temporary Fencing Hook Stay", price: 35, hirePrice: 4 },
  delivery: { name: "Delivery Fee", price: 150, hirePrice: 150 },
}

// Update options to show Purchase and Hire
const SELECT_OPTIONS = [
  { id: "purchase", label: "Purchase" },
  { id: "hire", label: "Hire" },
]

// Duration unit options with minimum values
const DURATION_UNITS = [
  { id: "days", label: "Days", multiplier: 1, minimum: 7 },
  { id: "weeks", label: "Weeks", multiplier: 7, minimum: 1 },
  { id: "months", label: "Months", multiplier: 30.4167, minimum: 1 },
]

// Maximum duration in days (2 years)
const MAX_DURATION_DAYS = 730

// Constants for duration conversion
const DAYS_PER_WEEK = 7
const DAYS_PER_MONTH = 30.4167

// Function to calculate hire costs with panel-based discount structure
function calculateFencingCost(
  length,
  panelType,
  duration,
  durationUnit,
  installFee,
  removalFee,
  feetOption,
  includeDelivery,
  deliveryFee,
) {
  // Input validation
  if (length <= 0) throw new Error("Length must be greater than 0")
  if (duration <= 0) throw new Error("Duration must be greater than 0")
  if (!panelType) throw new Error("Panel type is required")
  if (!durationUnit || typeof durationUnit !== "string" || durationUnit.trim() === "") {
    throw new Error("Duration unit is required and must be a non-empty string")
  }

  // Enforce minimum duration based on unit
  const durationUnitObj = DURATION_UNITS.find((unit) => unit.id === durationUnit)
  if (!durationUnitObj) throw new Error("Invalid duration unit")

  const minDuration = durationUnitObj.minimum
  if (duration < minDuration) {
    duration = minDuration
  }

  // Define pricing per panel type
  const panelPricing = {
    heavy_duty: {
      price: 8,
      length: 2.4,
    },
    smart_duty: {
      price: 5,
      length: 2.4,
    },
    pool: {
      price: 5,
      length: 2.3,
    },
    crowd_control: {
      price: 5,
      length: 2.2,
    },
  }

  if (!panelPricing[panelType]) {
    throw new Error("Invalid panel type")
  }

  const panelData = panelPricing[panelType]
  const numPanels = Math.ceil(length / panelData.length)
  const numClamps = numPanels
  const numStays = Math.ceil(numPanels / 7)

  // Calculate total feet needed
  const numFeet = numPanels + 1 + numStays * 2

  // Component pricing (per week)
  const baseWeeklyPanelPrice = panelData.price

  // Convert duration to days first for consistent calculation
  let durationInDays
  let durationInWeeks

  // Standard conversions
  if (durationUnit === "days") {
    durationInDays = duration
  } else if (durationUnit === "weeks") {
    durationInDays = duration * DAYS_PER_WEEK
  } else if (durationUnit === "months") {
    durationInDays = duration * DAYS_PER_MONTH
  }

  // Convert days to weeks for pricing calculation
  durationInWeeks = durationInDays / DAYS_PER_WEEK

  // Replace the panel quantity discount code with this duration-based discount code
  let durationDiscountFactor = 1.0
  let durationDiscountPercentage = 0

  // Convert duration to months for consistent discount calculation
  const durationInMonths = durationInDays / DAYS_PER_MONTH

  // Apply duration-based discount
  if (durationInMonths >= 12) {
    durationDiscountFactor = 0.55 // 45% discount
    durationDiscountPercentage = 45
  } else if (durationInMonths >= 9) {
    durationDiscountFactor = 0.65 // 35% discount
    durationDiscountPercentage = 35
  } else if (durationInMonths >= 6) {
    durationDiscountFactor = 0.75 // 25% discount
    durationDiscountPercentage = 25
  } else if (durationInMonths >= 3) {
    durationDiscountFactor = 0.85 // 15% discount
    durationDiscountPercentage = 15
  } else {
    durationDiscountFactor = 1.0 // No discount
    durationDiscountPercentage = 0
  }

  // Apply the discount to the weekly prices
  const discountFactor = durationDiscountFactor
  const discountPercentage = durationDiscountPercentage

  // Apply the discount to the weekly prices
  const discountedWeeklyPanelPrice = baseWeeklyPanelPrice * discountFactor

  // For hire, include all accessories in the panel cost
  const totalWeeklyPanelPrice = discountedWeeklyPanelPrice

  // Calculate total costs for the entire duration
  const panelCost = numPanels * totalWeeklyPanelPrice * durationInWeeks

  // For hire, we include all these costs in the panel cost
  const clampCost = 0
  const stayCost = 0
  const feetCost = 0

  // Add delivery fee if selected
  const calculatedDeliveryFee = includeDelivery ? deliveryFee : 0

  // Base total
  const totalCost = panelCost + clampCost + stayCost + feetCost + calculatedDeliveryFee

  // Add installation and removal fees if provided
  const finalCost = totalCost + (installFee || 0) + (removalFee || 0)

  return {
    numPanels,
    numClamps,
    numStays,
    numFeet,
    panelCost,
    clampCost,
    stayCost,
    feetCost,
    feetOption,
    baseWeeklyPanelPrice,
    discountedWeeklyPanelPrice,
    discountFactor,
    discountPercentage,
    duration,
    durationUnit,
    durationInDays,
    durationInWeeks,
    durationInMonths,
    deliveryFee: calculatedDeliveryFee,
    totalCost,
    finalCost,
    isPanelDiscount: false,
    durationDiscountPercentage,
  }
}

// Helper function to convert between duration units precisely
function convertDuration(value, fromUnit, toUnit) {
  if (value <= 0) return getMinimumDuration(toUnit)

  // First convert to days as the common unit
  let days
  if (fromUnit === "days") {
    days = value
  } else if (fromUnit === "weeks") {
    days = value * DAYS_PER_WEEK
  } else if (fromUnit === "months") {
    days = value * DAYS_PER_MONTH
  }

  // Then convert from days to the target unit
  if (toUnit === "days") {
    return Math.max(getMinimumDuration(toUnit), days)
  } else if (toUnit === "weeks") {
    return Math.max(getMinimumDuration(toUnit), days / DAYS_PER_WEEK)
  } else if (toUnit === "months") {
    return Math.max(getMinimumDuration(toUnit), days / DAYS_PER_MONTH)
  }

  return Math.max(getMinimumDuration(toUnit), value) // Fallback
}

// Get the minimum duration for a given unit
function getMinimumDuration(unit) {
  const unitObj = DURATION_UNITS.find((u) => u.id === unit)
  return unitObj ? unitObj.minimum : 1
}

// Get icon for item category
const getItemIcon = (category, itemName = "") => {
  switch (category) {
    case "panels":
      return <FenceIcon size={16} className="mr-2 text-[#b82429]" strokeWidth={1.5} />
    case "feet":
      return <Footprints size={16} className="mr-2 text-[#b82429]" />
    case "connectors":
      return <LinkIcon size={16} className="mr-2 text-[#b82429]" />
    case "supports":
      return <CornerRightDown size={16} className="mr-2 text-[#b82429]" />
    case "services":
      return <DollarSign size={16} className="mr-2 text-[#b82429]" />
    case "duration":
      return <Clock size={16} className="mr-2 text-[#b82429]" />
    case "discount":
      return <Info size={16} className="mr-2 text-[#b82429]" />
    case "delivery":
      return <Truck size={16} className="mr-2 text-[#b82429]" />
    case "insurance":
      return <Shield size={16} className="mr-2 text-[#b82429]" />
    default:
      // Fallback based on item name
      if (itemName.includes("Panel") || itemName.includes("Builders")) {
        return <FenceIcon size={16} className="mr-2 text-[#b82429]" strokeWidth={1.5} />
      } else if (itemName.includes("Feet") || itemName.includes("feet")) {
        return <Footprints size={16} className="mr-2 text-[#b82429]" />
      } else if (itemName.includes("Stay") || itemName.includes("Brace")) {
        return <CornerRightDown size={16} className="mr-2 text-[#b82429]" />
      } else if (itemName.includes("Clamp")) {
        return <LinkIcon size={16} className="mr-2 text-[#b82429]" />
      } else if (itemName.includes("Delivery")) {
        return <Truck size={16} className="mr-2 text-[#b82429]" />
      } else if (itemName.includes("Installation")) {
        return <DollarSign size={16} className="mr-2 text-[#b82429]" />
      }
      return <Grid size={16} className="mr-2 text-[#b82429]" />
  }
}

// Memoize the item row component for better performance
const ItemRow = memo(
  ({
    item,
    getItemIcon,
    getItemQuantity,
    hasCustomQuantity,
    formatPrice,
    increaseQuantity,
    decreaseQuantity,
    resetQuantity,
  }) => {
    return (
      <tr className="border-b border-gray-100">
        <td className="py-2">
          <div className="flex items-center">
            {getItemIcon(item.category, item.name)}
            <span className="text-gray-900">{item.name}</span>
          </div>
        </td>
        <td className="text-center py-2">
          {item.category === "services" || item.category === "delivery" ? (
            <span className="text-gray-900">{item.quantity}</span>
          ) : (
            <div className="flex items-center justify-center">
              <button
                onClick={() => decreaseQuantity(item.name, item.category)}
                className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-l-md text-gray-900"
                disabled={getItemQuantity(item) <= 1}
              >
                -
              </button>
              <span className={`px-2 text-gray-900 ${hasCustomQuantity(item) ? "text-[#b82429] font-medium" : ""}`}>
                {getItemQuantity(item)}
                {hasCustomQuantity(item) && <span className="text-[#b82429] font-bold ml-1 text-sm">*</span>}
              </span>
              <button
                onClick={() => increaseQuantity(item.name, item.category)}
                className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-r-md text-gray-900"
              >
                +
              </button>
              {hasCustomQuantity(item) && (
                <button
                  onClick={() => resetQuantity(item.name)}
                  className="ml-2 text-xs text-gray-500 hover:text-gray-700 underline"
                  title="Reset to default quantity"
                >
                  Reset
                </button>
              )}
            </div>
          )}
        </td>
        <td className="text-right py-2">
          <span className="text-gray-900">
            {item.isTBC ? "TBC" : item.priceDisplay || `$${formatPrice(item.price)}`}
          </span>
        </td>
      </tr>
    )
  },
)

export default function FencingCalculator({ onUpdate, onBookingRequest }) {
  const router = useRouter()
  const [selectedFenceType, setSelectedFenceType] = useState(FENCE_OPTIONS[0].id)
  const [selectedOption, setSelectedOption] = useState(SELECT_OPTIONS[0].id)
  const [selectedFeetOption, setSelectedFeetOption] = useState(FEET_OPTIONS[0].id)
  const [metersRequired, setMetersRequired] = useState(10)
  const [hireDuration, setHireDuration] = useState(10)
  const [durationUnit, setDurationUnit] = useState(DURATION_UNITS[1].id) // Default to weeks
  const [itemsList, setItemsList] = useState([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [purchaseTotal, setPurchaseTotal] = useState(0)
  const [hireTotal, setHireTotal] = useState(0)
  const sliderRef = useRef(null)
  const durationSliderRef = useRef(null)
  const includeDelivery = true
  const [calculatedDeliveryFee, setCalculatedDeliveryFee] = useState(ADDITIONAL_ITEMS_FULL.delivery.price)
  const [isDeliveryCalculated, setIsDeliveryCalculated] = useState(false)
  const [installFee, setInstallFee] = useState(0)
  const [removalFee, setRemovalFee] = useState(0)
  const [customQuantities, setCustomQuantities] = useState({})
  const [configLoaded, setConfigLoaded] = useState(false)

  // Add a ref to track if we should update the parent
  const shouldUpdateParent = useRef(false)

  // Add these new refs for the slider fill elements
  const metersSliderFillRef = useRef(null)
  const durationSliderFillRef = useRef(null)

  // Define the recalculation functions first before they're used
  const recalculatePurchaseTotal = useCallback(
    (customQtys) => {
      const selectedFence = FENCE_OPTIONS.find((option) => option.id === selectedFenceType)
      const selectedFeet = FEET_OPTIONS.find((option) => option.id === selectedFeetOption)

      if (!selectedFence || !selectedFeet) return

      // Start with a copy of the current items list
      const updatedItems = [...itemsList].map((item) => {
        if (item.category === "services" || item.category === "delivery") {
          return item
        }

        const customQty = customQtys[item.name]
        if (customQty !== undefined) {
          // Get the base unit price
          const unitPrice = item.price / item.quantity
          return {
            ...item,
            quantity: customQty,
            price: unitPrice * customQty,
          }
        }
        return item
      })

      // Recalculate total based on updated items
      const updatedTotal = updatedItems.reduce((sum, item) => sum + (item.isTBC ? 0 : item.price), 0)
      const updatedGst = updatedTotal * 0.1

      setItemsList(updatedItems)
      setTotalPrice(updatedTotal + updatedGst)
    },
    [selectedFenceType, selectedFeetOption, itemsList],
  )

  const recalculateHireTotal = useCallback(
    (customQtys) => {
      // For hire, we mainly need to update the displayed quantities
      // since most prices are "Included" and not directly affected
      const updatedItems = [...itemsList].map((item) => {
        if (
          item.category === "services" ||
          item.category === "delivery" ||
          item.category === "duration" ||
          item.category === "discount"
        ) {
          return item
        }

        const customQty = customQtys[item.name]
        if (customQty !== undefined) {
          return {
            ...item,
            quantity: customQty,
          }
        }
        return item
      })

      setItemsList(updatedItems)
    },
    [itemsList],
  )

  // Now define the quantity modification functions
  const increaseQuantity = useCallback(
    (itemName, category) => {
      if (category === "services" || category === "delivery") return

      setCustomQuantities((prev) => {
        // Find the item in the itemsList to get its current quantity
        const item = itemsList.find((item) => item.name === itemName)
        const currentQuantity = item ? item.quantity : 0

        // If we already have a custom quantity, use that as the base, otherwise use the calculated quantity
        const baseQuantity = prev[itemName] !== undefined ? prev[itemName] : currentQuantity

        const newQuantities = {
          ...prev,
          [itemName]: baseQuantity + 1,
        }

        // Force recalculation of prices on next render
        if (selectedOption === "purchase") {
          // Delay to ensure state is updated
          setTimeout(() => recalculatePurchaseTotal(newQuantities), 0)
        } else {
          setTimeout(() => recalculateHireTotal(newQuantities), 0)
        }

        return newQuantities
      })
    },
    [selectedOption, recalculatePurchaseTotal, recalculateHireTotal, itemsList],
  )

  const decreaseQuantity = useCallback(
    (itemName, category) => {
      if (category === "services" || category === "delivery") return

      setCustomQuantities((prev) => {
        // Find the item in the itemsList to get its current quantity
        const item = itemsList.find((item) => item.name === itemName)
        const currentQuantity = item ? item.quantity : 0

        // If we already have a custom quantity, use that as the base, otherwise use the calculated quantity
        const baseQuantity = prev[itemName] !== undefined ? prev[itemName] : currentQuantity

        const newQuantities = {
          ...prev,
          [itemName]: Math.max(1, baseQuantity - 1),
        }

        // Force recalculation of prices on next render
        if (selectedOption === "purchase") {
          // Delay to ensure state is updated
          setTimeout(() => recalculatePurchaseTotal(newQuantities), 0)
        } else {
          setTimeout(() => recalculateHireTotal(newQuantities), 0)
        }

        return newQuantities
      })
    },
    [selectedOption, recalculatePurchaseTotal, recalculateHireTotal, itemsList],
  )

  // Add this function after the decreaseQuantity function
  const resetQuantity = useCallback(
    (itemName) => {
      setCustomQuantities((prev) => {
        const newQuantities = { ...prev }
        delete newQuantities[itemName]

        // Force recalculation of prices on next render
        if (selectedOption === "purchase") {
          // Delay to ensure state is updated
          setTimeout(() => recalculatePurchaseTotal({}), 0)
        } else {
          setTimeout(() => recalculateHireTotal({}), 0)
        }

        return newQuantities
      })
    },
    [selectedOption, recalculatePurchaseTotal, recalculateHireTotal],
  )

  // Add a function to get the final quantity (either custom or calculated)
  const getItemQuantity = useCallback(
    (item) => {
      if (item.category === "services" || item.category === "delivery") {
        return item.quantity
      }
      return customQuantities[item.name] !== undefined ? customQuantities[item.name] : item.quantity
    },
    [customQuantities],
  )

  // Add this function after the getItemQuantity function
  const hasCustomQuantity = useCallback(
    (item) => {
      return customQuantities[item.name] !== undefined
    },
    [customQuantities],
  )

  // Helper function to get summary panel names
  const getPanelSummaryName = useCallback((panelId) => {
    switch (panelId) {
      case "premium":
        return "Heavy Duty Panel"
      case "builders":
        return "Builders Duty Panels"
      case "pool":
        return "Fence Pool Panels"
      case "crowd":
        return "Crowd Control Barriers"
      default:
        return "Panel"
    }
  }, [])

  // Get the duration in days (for calculation)
  const getDurationInDays = useCallback(() => {
    if (durationUnit === "days") {
      return hireDuration
    } else if (durationUnit === "weeks") {
      return hireDuration * DAYS_PER_WEEK
    } else if (durationUnit === "months") {
      return hireDuration * DAYS_PER_MONTH
    }
    return 0
  }, [durationUnit, hireDuration])

  // Get the max duration value based on the selected unit
  const getMaxDuration = useCallback(() => {
    if (durationUnit === "days") {
      return MAX_DURATION_DAYS
    } else if (durationUnit === "weeks") {
      return 104 // Exactly 104 weeks for 730 days
    } else if (durationUnit === "months") {
      return 24 // Exactly 24 months for 730 days
    }
    return 1
  }, [durationUnit])

  // Format duration for display - rounded for display but precise for calculations
  const formatDuration = useCallback(() => {
    // Round to nearest whole number for display purposes only
    const displayValue = Math.round(hireDuration)

    if (durationUnit === "days") {
      return `${displayValue} ${displayValue === 1 ? "day" : "days"}`
    } else if (durationUnit === "weeks") {
      return `${displayValue} ${displayValue === 1 ? "week" : "weeks"}`
    } else if (durationUnit === "months") {
      return `${displayValue} ${displayValue === 1 ? "month" : "months"}`
    }
    return `${displayValue} ${durationUnit}`
  }, [hireDuration, durationUnit])

  // Load saved configuration from local storage
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem("fencingCalculatorConfig")

      if (savedConfig) {
        const config = JSON.parse(savedConfig)

        // Set fence type if available
        if (config.selectedFenceType) {
          setSelectedFenceType(config.selectedFenceType)
        }

        // Set purchase/hire option if available
        if (config.selectedOption) {
          setSelectedOption(config.selectedOption)
        }

        // Set feet option if available - THIS IS THE KEY CHANGE
        if (config.selectedFeetOption) {
          console.log("Loading feet option from config:", config.selectedFeetOption)
          setSelectedFeetOption(config.selectedFeetOption)
        }

        // Set meters if available
        if (config.metersRequired) {
          setMetersRequired(Math.max(1, config.metersRequired))
        }

        // Set duration settings if available
        if (config.durationUnit) {
          setDurationUnit(config.durationUnit)

          // Ensure the loaded duration meets the minimum requirements
          const minDuration = getMinimumDuration(config.durationUnit)
          if (config.hireDuration) {
            setHireDuration(Math.max(minDuration, config.hireDuration))
          }
        }
      }

      // Mark config as loaded
      setConfigLoaded(true)

      // Set the flag to update parent after initial load
      shouldUpdateParent.current = true
    } catch (e) {
      console.error("Error loading saved configuration", e)
      setConfigLoaded(true) // Still mark as loaded even if there was an error
    }
  }, [])

  // Save configuration to local storage when it changes
  useEffect(() => {
    // Only save if config has been loaded (to prevent overwriting with default values)
    if (configLoaded) {
      const config = {
        selectedFenceType,
        selectedOption,
        selectedFeetOption,
        metersRequired,
        hireDuration,
        durationUnit,
      }

      console.log("Saving config with feet option:", selectedFeetOption)
      localStorage.setItem("fencingCalculatorConfig", JSON.stringify(config))
    }
  }, [configLoaded, selectedFenceType, selectedOption, selectedFeetOption, metersRequired, hireDuration, durationUnit])

  // Ensure minimum duration is maintained when duration unit changes
  useEffect(() => {
    const minDuration = getMinimumDuration(durationUnit)
    if (hireDuration < minDuration) {
      setHireDuration(minDuration)
    }
  }, [durationUnit, hireDuration])

  // Update the updateSliderFill function
  const updateSliderFill = useCallback(() => {
    // Update the meters slider fill
    if (sliderRef.current && metersSliderFillRef.current) {
      const min = 1
      const max = 800
      const val = metersRequired
      const percentage = ((val - min) / (max - min)) * 100

      // Update the fill element's width directly with percentage
      metersSliderFillRef.current.style.width = `${percentage}%`
    }

    // Update the duration slider fill
    if (durationSliderRef.current && durationSliderFillRef.current && durationUnit) {
      const min = getMinimumDuration(durationUnit)
      const max = getMaxDuration()
      const val = hireDuration
      const percentage = ((val - min) / (max - min)) * 100

      // Update the fill element's width directly with percentage
      durationSliderFillRef.current.style.width = `${percentage}%`
    }
  }, [metersRequired, hireDuration, durationUnit, getMaxDuration])

  // Update slider fill when values change
  useEffect(() => {
    updateSliderFill()
    // Set a small timeout to ensure the DOM has fully rendered
    const timeoutId = setTimeout(updateSliderFill, 50)
    return () => clearTimeout(timeoutId)
  }, [metersRequired, hireDuration, durationUnit, updateSliderFill])

  // Calculate the required items and total price for purchase
  useEffect(() => {
    // If meters required is 0, show empty list
    if (metersRequired <= 0) {
      if (selectedOption === "purchase") {
        setItemsList([])
        setTotalPrice(0)
      }
      setPurchaseTotal(0)
      return
    }

    const selectedFence = FENCE_OPTIONS.find((option) => option.id === selectedFenceType)
    const selectedFeet = FEET_OPTIONS.find((option) => option.id === selectedFeetOption)
    const items = []
    let total = 0

    // Calculate number of panels needed
    const panelsNeeded = Math.ceil(metersRequired / selectedFence.length)
    items.push({
      name: getPanelSummaryName(selectedFence.id),
      quantity: panelsNeeded,
      price: selectedFence.price * panelsNeeded,
      category: "panels",
    })
    total += selectedFence.price * panelsNeeded

    // Calculate feet needed (1 per panel + 1 extra at end)
    const feetNeeded = panelsNeeded + 1

    // Add the selected feet option
    if (selectedFeetOption === "feet") {
      items.push({
        name: ADDITIONAL_ITEMS.feet.name,
        quantity: feetNeeded,
        price: selectedFeet.price * feetNeeded,
        category: "feet",
      })
      total += selectedFeet.price * feetNeeded
    } else if (selectedFeetOption === "hookStay") {
      items.push({
        name: ADDITIONAL_ITEMS.hookStay.name,
        quantity: feetNeeded,
        price: selectedFeet.price * feetNeeded,
        category: "feet",
      })
      total += selectedFeet.price * feetNeeded
    }

    // Add clamps if needed
    if (selectedFence.needsClamp) {
      const clampsNeeded = panelsNeeded
      items.push({
        name: ADDITIONAL_ITEMS.clamp.name,
        quantity: clampsNeeded,
        price: ADDITIONAL_ITEMS_FULL.clamp.price * clampsNeeded,
        category: "connectors",
      })
      total += ADDITIONAL_ITEMS_FULL.clamp.price * clampsNeeded
    }

    // Add braces if needed
    if (selectedFence.needsBrace) {
      const bracesNeeded = Math.ceil(panelsNeeded / selectedFence.panelsPerBrace)

      // Add the braces
      items.push({
        name: ADDITIONAL_ITEMS.brace.name,
        quantity: bracesNeeded,
        price: ADDITIONAL_ITEMS_FULL.brace.price * bracesNeeded,
        category: "supports",
      })
      total += ADDITIONAL_ITEMS_FULL.brace.price * bracesNeeded

      // Each brace needs 2 additional feet
      const braceFeetNeeded = bracesNeeded * 2
      items.push({
        name: `${ADDITIONAL_ITEMS.feet.name} (for braces)`,
        quantity: braceFeetNeeded,
        price: ADDITIONAL_ITEMS_FULL.feet.price * braceFeetNeeded,
        category: "feet",
      })
      total += ADDITIONAL_ITEMS_FULL.feet.price * braceFeetNeeded
    }

    // Add delivery fee if selected
    if (includeDelivery) {
      items.push({
        name: ADDITIONAL_ITEMS.delivery.name,
        quantity: 1,
        price: isDeliveryCalculated ? calculatedDeliveryFee : 0,
        priceDisplay: isDeliveryCalculated ? "Included" : "TBC",
        category: "delivery",
        isTBC: !isDeliveryCalculated,
      })
      if (isDeliveryCalculated) {
        total += calculatedDeliveryFee
      }
    }

    // Add installation fees (TBC)
    items.push({
      name: selectedOption === "hire" ? "Installation & Removal Fees" : "Installation",
      quantity: 1,
      price: 0, // Not included in total
      isTBC: true,
      category: "services",
    })

    // Add GST (10%)
    const gst = total * 0.1

    // In the purchase calculation useEffect, add this after calculating the initial items:
    // Around line 500, after all the items are added but before setting the state
    const updatedItems = items.map((item) => {
      if (item.category === "services" || item.category === "delivery") {
        return item
      }

      const customQty = customQuantities[item.name]
      if (customQty !== undefined) {
        // Recalculate price based on custom quantity
        const unitPrice = item.price / item.quantity
        return {
          ...item,
          quantity: customQty,
          price: unitPrice * customQty,
        }
      }
      return item
    })

    // Then update the setItemsList call to use updatedItems instead of items
    if (selectedOption === "purchase") {
      setItemsList(updatedItems)

      // Recalculate total based on updated items
      const updatedTotal = updatedItems.reduce((sum, item) => sum + (item.isTBC ? 0 : item.price), 0)
      const updatedGst = updatedTotal * 0.1
      setTotalPrice(updatedTotal + updatedGst)
    }

    setPurchaseTotal(total + gst)
  }, [
    selectedFenceType,
    metersRequired,
    selectedOption,
    selectedFeetOption,
    calculatedDeliveryFee,
    isDeliveryCalculated,
    hireTotal,
    customQuantities,
    getPanelSummaryName,
  ])

  // Calculate hire costs
  useEffect(() => {
    if (metersRequired <= 0) {
      setHireTotal(0)
      if (selectedOption === "hire") {
        setItemsList([])
        setTotalPrice(0)
      }
      return
    }

    const selectedFence = FENCE_OPTIONS.find((option) => option.id === selectedFenceType)
    const selectedFeet = FEET_OPTIONS.find((option) => option.id === selectedFeetOption)

    // Ensure minimum duration is respected
    const minDuration = getMinimumDuration(durationUnit)
    const durationValue = Math.max(minDuration, hireDuration)

    if (!durationUnit) {
      // Set a default duration unit if it's undefined
      setDurationUnit(DURATION_UNITS[1].id) // Default to weeks
      return // Exit early and wait for the next render with the updated state
    }

    try {
      const result = calculateFencingCost(
        metersRequired,
        selectedFence.panelType,
        durationValue,
        durationUnit,
        installFee,
        removalFee,
        selectedFeetOption,
        includeDelivery,
        isDeliveryCalculated ? calculatedDeliveryFee : 0,
      )

      // Only create and set the items list if we're in hire mode
      if (selectedOption === "hire") {
        const items = []

        // Add panels with discount information
        items.push({
          name: getPanelSummaryName(selectedFence.id),
          quantity: result.numPanels,
          price: result.panelCost,
          priceDisplay: `${result.discountPercentage}% Off`,
          category: "panels",
        })

        // Add the selected feet option - but mark as included
        const totalFeet = result.numPanels + 1 + (selectedFence.needsBrace ? result.numStays * 2 : 0)

        if (selectedFeetOption === "feet") {
          items.push({
            name: ADDITIONAL_ITEMS.feet.name,
            quantity: totalFeet,
            price: 0,
            priceDisplay: "Included",
            category: "feet",
          })
        } else if (selectedFeetOption === "hookStay") {
          items.push({
            name: ADDITIONAL_ITEMS.hookStay.name,
            quantity: totalFeet,
            price: 0,
            priceDisplay: "Included",
            category: "feet",
          })
        }

        // Add clamps if needed - but mark as included
        if (selectedFence.needsClamp) {
          items.push({
            name: ADDITIONAL_ITEMS.clamp.name,
            quantity: result.numClamps,
            price: 0,
            priceDisplay: "Included",
            category: "connectors",
          })
        }

        // Add braces if needed - but mark as included
        if (selectedFence.needsBrace) {
          items.push({
            name: ADDITIONAL_ITEMS.brace.name,
            quantity: result.numStays,
            price: 0,
            priceDisplay: "Included",
            category: "supports",
          })
        }

        // Add delivery fee if selected
        if (includeDelivery) {
          items.push({
            name: ADDITIONAL_ITEMS.delivery.name,
            quantity: 1,
            price: isDeliveryCalculated ? result.deliveryFee : 0,
            priceDisplay: isDeliveryCalculated ? "Included" : "TBC",
            category: "delivery",
          })
        }

        // Add installation and removal fees (TBC)
        items.push({
          name: "Installation & Removal Fees",
          quantity: 1,
          price: 0, // Not included in total
          isTBC: true,
          category: "services",
        })

        // Add duration info
        items.push({
          name: `Hire Duration: ${formatDuration()}`,
          quantity: 1,
          price: 0, // Price is already factored into the calculation
          category: "duration",
        })

        // Add discount info
        if (result.discountPercentage > 0) {
          items.push({
            name: `Discount: Applied ${result.discountPercentage}% (Duration Discount)`,
            quantity: 1,
            price: 0,
            category: "discount",
          })
        }

        // Similarly update the hire calculation useEffect
        // In the hire calculation useEffect, add similar logic before setting the state
        // Around line 650, after all the items are added but before setting the state
        const updatedItems = items.map((item) => {
          if (
            item.category === "services" ||
            item.category === "delivery" ||
            item.category === "duration" ||
            item.category === "discount"
          ) {
            return item
          }

          const customQty = customQuantities[item.name]
          if (customQty !== undefined) {
            // For hire, we don't adjust prices since they're included
            return {
              ...item,
              quantity: customQty,
            }
          }
          return item
        })

        setItemsList(updatedItems)

        // Add GST (10%)
        const gst = result.totalCost * 0.1
        const totalWithGST = result.totalCost + gst

        setTotalPrice(totalWithGST)
      }

      // Add GST (10%)
      const gst = result.totalCost * 0.1
      const totalWithGST = result.totalCost + gst

      setHireTotal(totalWithGST)
    } catch (error) {
      console.error("Error calculating hire cost:", error)
      if (selectedOption === "hire") {
        setItemsList([])
        setTotalPrice(0)
      }
      setHireTotal(0)
    }
  }, [
    selectedFenceType,
    metersRequired,
    hireDuration,
    durationUnit,
    selectedOption,
    selectedFeetOption,
    installFee,
    removalFee,
    calculatedDeliveryFee,
    isDeliveryCalculated,
    customQuantities,
    formatDuration,
    getPanelSummaryName,
  ])

  // Format price with commas for thousands
  const formatPrice = useCallback((price) => {
    return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }, [])

  // Handle duration unit change
  const handleDurationUnitChange = useCallback(
    (newUnit) => {
      // Get the current duration in days
      const currentDays = getDurationInDays()

      // Convert to the new unit with exact precision
      let newDuration = convertDuration(currentDays, "days", newUnit)

      // Ensure the new duration meets the minimum for the new unit
      const minDurationInNewUnit = getMinimumDuration(newUnit)
      newDuration = Math.max(minDurationInNewUnit, newDuration)

      // Ensure the new duration is within bounds
      const maxDurationInNewUnit = getMaxDuration()
      const boundedNewDuration = Math.min(maxDurationInNewUnit, newDuration)

      setDurationUnit(newUnit)
      setHireDuration(boundedNewDuration)
    },
    [getDurationInDays, getMaxDuration],
  )

  // Update parent component with calculator data - THIS IS THE KEY CHANGE
  useEffect(() => {
    // Only update the parent if we have items and the flag is set
    if (onUpdate && itemsList.length > 0 && shouldUpdateParent.current) {
      const calculatorData = {
        itemsList,
        totalPrice,
        selectedOption,
        metersRequired,
        hireDuration,
        durationUnit,
        selectedFenceType,
        selectedFeetOption,
      }

      // Use a timeout to avoid immediate updates
      const timeoutId = setTimeout(() => {
        onUpdate(calculatorData)
      }, 0)

      return () => clearTimeout(timeoutId)
    }
  }, [
    itemsList,
    totalPrice,
    selectedOption,
    metersRequired,
    hireDuration,
    durationUnit,
    selectedFenceType,
    selectedFeetOption,
    onUpdate,
  ])

  // Add a useEffect to reset custom quantities when fence type or option changes
  useEffect(() => {
    setCustomQuantities({})
  }, [selectedFenceType, selectedOption, selectedFeetOption])

  // Optimize the handleQuoteRequest function
  const handleQuoteRequest = useCallback(() => {
    try {
      // Save current configuration to localStorage first
      const config = {
        selectedFenceType,
        selectedOption,
        selectedFeetOption,
        metersRequired,
        hireDuration,
        durationUnit,
        totalCost: totalPrice,
      }
      localStorage.setItem("fencingCalculatorConfig", JSON.stringify(config))

      // Use the router directly for faster navigation
      window.location.href = "/quote-request"
    } catch (error) {
      console.error("Navigation error:", error)
      // Fallback if navigation fails
      window.location.href = "/quote-request"
    }
  }, [selectedFenceType, selectedOption, selectedFeetOption, metersRequired, hireDuration, durationUnit, totalPrice])

  // Add this effect to save the calculator state including itemsList to localStorage
  useEffect(() => {
    if (itemsList.length > 0) {
      const calculatorState = {
        itemsList,
        totalPrice,
        selectedOption,
        metersRequired,
        hireDuration,
        durationUnit,
        selectedFenceType,
        selectedFeetOption,
      }
      localStorage.setItem("calculatorState", JSON.stringify(calculatorState))
    }
  }, [
    itemsList,
    totalPrice,
    selectedOption,
    metersRequired,
    hireDuration,
    durationUnit,
    selectedFenceType,
    selectedFeetOption,
  ])

  return (
    <div className="w-full font-sans">
      <style jsx>{sliderStyles}</style>
      <div className="container mx-auto p-3 py-6">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            {SELECT_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`flex-1 py-3 text-center transition-all duration-200 text-lg font-medium rounded-none border-2 ${
                  selectedOption === option.id
                    ? "bg-[#b82429]/10 border-[#b82429] text-[#b82429]"
                    : "bg-white border-[#b82429] text-[#b82429] hover:bg-gray-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-heading font-bold text-base mb-2 text-gray-900">Select Fence Panel Options</h3>
              <Select value={selectedFenceType} onValueChange={setSelectedFenceType}>
                <SelectTrigger
                  className={`w-full border border-gray-300 rounded-md h-12 ${
                    selectedFenceType ? "bg-gray-100" : "bg-white"
                  }`}
                >
                  <SelectValue placeholder="Select Fence Panel Options" />
                </SelectTrigger>
                <SelectContent>
                  {FENCE_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.id}
                      value={option.id}
                      className={selectedFenceType === option.id ? "bg-gray-100" : ""}
                    >
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="font-heading font-bold text-base mb-2 text-gray-900">Select Feet Option</h3>
              <Select value={selectedFeetOption} onValueChange={setSelectedFeetOption}>
                <SelectTrigger
                  className={`w-full border border-gray-300 rounded-md h-12 ${
                    selectedFeetOption ? "bg-gray-100" : "bg-white"
                  }`}
                >
                  <SelectValue placeholder="Select Feet Option" />
                </SelectTrigger>
                <SelectContent>
                  {FEET_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.id}
                      value={option.id}
                      className={selectedFeetOption === option.id ? "bg-gray-100" : ""}
                    >
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-heading font-bold text-base mb-3 text-gray-900">Meters of Fencing Required</h3>
            <div className="mb-3">
              <Input
                type="number"
                min={1}
                max={800}
                value={metersRequired}
                onChange={(e) => {
                  const value = Number.parseInt(e.target.value)
                  if (!isNaN(value)) {
                    setMetersRequired(Math.min(800, Math.max(1, value)))
                  }
                }}
                className="border border-gray-300 rounded-none h-12 mb-2 bg-white text-gray-900"
              />
              <div className="slider-container relative h-2 bg-gray-300 rounded-full">
                <div ref={metersSliderFillRef} className="absolute top-0 left-0 h-full bg-[#b82429] rounded-full"></div>
                <input
                  ref={sliderRef}
                  type="range"
                  min={1}
                  max={800}
                  value={metersRequired}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value)
                    setMetersRequired(value)
                  }}
                  className="w-full absolute top-0 left-0 opacity-0 h-8 cursor-pointer z-10 -mt-3"
                  aria-label="Meters of fencing"
                />
                <div
                  className="absolute top-0 w-5 h-5 bg-[#b82429] rounded-full -mt-1.5 transform -translate-x-1/2 pointer-events-none"
                  style={{ left: `${((metersRequired - 1) / 799) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1m</span>
                <span>400m</span>
                <span>800m</span>
              </div>
            </div>
          </div>

          {selectedOption === "hire" && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-heading font-bold text-base text-gray-900">Hire Duration</h3>
                <div className="flex items-center">
                  <span className="text-sm mr-2 text-gray-900">Unit:</span>
                  <Select value={durationUnit} onValueChange={handleDurationUnitChange}>
                    <SelectTrigger
                      className={`w-[100px] h-10 text-sm border border-gray-300 rounded-md ${
                        durationUnit ? "bg-gray-100" : "bg-white"
                      }`}
                    >
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_UNITS.map((unit) => (
                        <SelectItem
                          key={unit.id}
                          value={unit.id}
                          className={durationUnit === unit.id ? "bg-gray-100" : ""}
                        >
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mb-3">
                <Input
                  type="number"
                  min={getMinimumDuration(durationUnit)}
                  max={getMaxDuration()}
                  value={hireDuration}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value)
                    if (!isNaN(value)) {
                      setHireDuration(Math.min(getMaxDuration(), Math.max(getMinimumDuration(durationUnit), value)))
                    }
                  }}
                  className="border border-gray-300 rounded-none h-12 mb-2 bg-white text-gray-900"
                />
                <div className="slider-container relative h-2 bg-gray-300 rounded-full">
                  <div
                    ref={durationSliderFillRef}
                    className="absolute top-0 left-0 h-full bg-[#b82429] rounded-full"
                  ></div>
                  <input
                    ref={durationSliderRef}
                    type="range"
                    min={getMinimumDuration(durationUnit)}
                    max={getMaxDuration()}
                    value={hireDuration}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value)
                      setHireDuration(value)
                    }}
                    className="w-full absolute top-0 left-0 opacity-0 h-8 cursor-pointer z-10 -mt-3"
                    aria-label="Hire duration"
                  />
                  <div
                    className="absolute top-0 w-5 h-5 bg-[#b82429] rounded-full -mt-1.5 transform -translate-x-1/2 pointer-events-none"
                    style={{
                      left: `${((hireDuration - getMinimumDuration(durationUnit)) / (getMaxDuration() - getMinimumDuration(durationUnit))) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>
                    {getMinimumDuration(durationUnit)} {durationUnit}
                  </span>
                  <span>
                    {Math.floor(getMaxDuration() / 2)} {durationUnit}
                  </span>
                  <span>
                    {getMaxDuration()} {durationUnit}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="border border-gray-200 rounded-md p-4 mb-6">
            <h3 className="font-heading font-bold text-base mb-4 text-gray-900">Item List:</h3>
            {Object.keys(customQuantities).length > 0 && (
              <div className="mb-4 p-3 bg-[#f8d7d9] border border-[#b82429] rounded-md">
                <div className="flex items-center text-[#b82429]">
                  <Info size={18} className="mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Custom quantities in use</p>
                    <p className="text-sm">
                      Items marked with * have been manually adjusted from the calculated values.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCustomQuantities({})
                      // Force recalculation with empty custom quantities
                      if (selectedOption === "purchase") {
                        setTimeout(() => recalculatePurchaseTotal({}), 0)
                      } else {
                        setTimeout(() => recalculateHireTotal({}), 0)
                      }
                    }}
                    className="ml-auto bg-white text-[#b82429] px-3 py-1 text-sm font-medium border border-[#b82429] rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Reset All
                  </button>
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-900 text-xs font-medium">Item:</th>
                    <th className="text-center py-2 text-gray-900 text-xs font-medium">Qty</th>
                    <th className="text-right py-2 text-gray-900 text-xs font-medium">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsList
                    .filter((item) => !item.name.includes("Hire Duration") && !item.name.includes("Discount:"))
                    .map((item, index) => (
                      <ItemRow
                        key={index}
                        item={item}
                        getItemIcon={getItemIcon}
                        getItemQuantity={getItemQuantity}
                        hasCustomQuantity={hasCustomQuantity}
                        formatPrice={formatPrice}
                        increaseQuantity={increaseQuantity}
                        decreaseQuantity={decreaseQuantity}
                        resetQuantity={resetQuantity}
                      />
                    ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200 font-bold">
                    <td className="py-3 text-[#b82429] font-bold text-sm">Total (Incl. GST)</td>
                    <td></td>
                    <td className="text-right py-3 text-[#b82429] font-bold text-sm">${formatPrice(totalPrice)}</td>
                  </tr>
                </tfoot>
                {Object.keys(customQuantities).length > 0 && (
                  <>
                    <caption className="mt-3 text-sm font-medium text-[#b82429] text-left flex items-center">
                      <Info size={16} className="mr-2" />* Custom quantities have been manually adjusted
                    </caption>
                  </>
                )}
              </table>
            </div>
          </div>

          {/* Replace the action buttons section with this: */}
          <MemoizedActionButtons onGetQuote={handleQuoteRequest} onBookCall={onBookingRequest} />

          {/* Single set of pagination dots */}
          <div className="flex justify-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i === 4 ? "bg-[#b82429]" : "bg-gray-300"}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
