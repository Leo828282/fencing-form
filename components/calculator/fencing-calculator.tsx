"use client"

import { useState, useEffect, useRef } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  HelpCircle,
  Info,
  Clock,
  Fence,
  Footprints,
  Link,
  CornerRightDown,
  DollarSign,
  Truck,
  Shield,
} from "lucide-react"
import { Poppins } from "next/font/google"
import { Card } from "@/components/ui/card"

// Initialize the Poppins font
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

// Fence panel options with their details
const FENCE_OPTIONS = [
  {
    id: "builders",
    name: "Builder's Temporary Smart Duty Panels (2.5mm Wire Mesh)",
    length: 2.4,
    price: 50,
    hirePrice: 5, // Changed from 8 to 5
    panelType: "smart_duty",
    needsClamp: true,
    needsBrace: true,
    panelsPerBrace: 7,
    description:
      "Smart Duty Panels are cost-effective with 2.5mm wire mesh, suitable for standard construction sites with moderate security needs. Ideal for: Festivals and Concerts, Construction Sites, Street Parades and Marches, Sporting Events, Markets and Fairs, Public Gatherings, Traffic Management, Filming and Photography, VIP Areas and Backstage Access, Airport and Transportation Hubs.",
  },
  {
    id: "premium",
    name: "Premium Grade Heavy Duty Panels (4mm Wire Mesh)",
    length: 2.4,
    price: 80,
    hirePrice: 8, // Changed from 12 to 8
    panelType: "heavy_duty",
    needsClamp: true,
    needsBrace: false,
    description:
      "Heavy Duty Panels feature 4mm wire mesh and are ideal for construction sites requiring maximum security and durability. Ideal for: Festivals and Concerts, Construction Sites, Street Parades and Marches, Sporting Events, Markets and Fairs, Public Gatherings, Traffic Management, Filming and Photography, VIP Areas and Backstage Access, Airport and Transportation Hubs.",
  },
  {
    id: "pool",
    name: "Temporary Fence Pool Panels",
    length: 2.3,
    price: 95,
    hirePrice: 5, // Changed from 10 to 5
    panelType: "pool",
    needsClamp: true,
    needsBrace: true,
    panelsPerBrace: 7,
    description:
      "Pool Panels are designed to meet pool safety regulations with smaller gaps in the mesh to prevent climbing. Use for pool construction, renovation projects, or emergency fence and gate damage to secure your pool area.",
  },
  {
    id: "crowd",
    name: "Crowd Control Barriers",
    length: 2.2,
    price: 57,
    hirePrice: 5, // Changed from 8 to 5
    panelType: "crowd_control",
    needsClamp: false,
    needsBrace: false,
    description:
      "Crowd Control Barriers are lightweight and portable, ideal for managing pedestrian traffic at events. Quick and easy to install barrier system using interlocking panels for fast setup.",
  },
]

// Feet options for the fence
const FEET_OPTIONS = [
  {
    id: "feet",
    name: "Premium Plastic Temporary Fencing Feet (27kgs)",
    price: 25,
    hirePrice: 2, // Price per week
    description:
      "UV resistant plastic is an anti-trip fluorescent red for increased visibility in all lighting conditions, making them perfect for construction fencing and event fencing. Best for standard installations and heavy-duty panels on level ground.",
  },
  {
    id: "hookStay",
    name: "Hook Stay",
    price: 35,
    hirePrice: 4, // Price per week
    description:
      "Hook Stays provide the perfect reinforcement, ensuring your Temp Fence remains secure even in challenging conditions. Designed to withstand high winds and the added pressure of shade cloth, these Hook Stays offer extra support where it's needed most.",
  },
]

// Additional items with full details
const ADDITIONAL_ITEMS_FULL = {
  feet: { name: "Premium Plastic Temporary Fencing Feet (27kgs)", price: 25, hirePrice: 0 }, // Included with panel
  brace: { name: "Temporary Fencing Stay Support (Brace)", price: 35, hirePrice: 10 }, // Price per week
  clamp: { name: "Temporary Fencing Clamp", price: 4, hirePrice: 4 }, // Price per week
  stayFeet: { name: "Premium Plastic Temporary Fencing Feet for Braces", price: 25, hirePrice: 2 }, // Price per week
  hookStay: { name: "Temporary Fencing Hook Stay", price: 35, hirePrice: 4 }, // Price per week
  delivery: { name: "Delivery Fee", price: 150, hirePrice: 150 }, // Flat fee
}

// Additional items with simplified names for display in the items list
const ADDITIONAL_ITEMS = {
  feet: { name: "Fencing Feet", price: 25, hirePrice: 0 }, // Included with panel
  brace: { name: "Fencing Stay Support", price: 35, hirePrice: 10 }, // Price per week
  clamp: { name: "Fencing Clamp", price: 4, hirePrice: 4 }, // Price per week
  stayFeet: { name: "Fencing Feet", price: 25, hirePrice: 2 }, // Price per week
  hookStay: { name: "Hook Stays", price: 35, hirePrice: 4 }, // Price per week
  delivery: { name: "Delivery Fee", price: 150, hirePrice: 150 }, // Flat fee
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
const DAYS_PER_MONTH = 30.4167 // 730 days / 24 months
const WEEKS_PER_MONTH = 4.3333 // 104 weeks / 24 months

// Damage waiver rate (10% of hire cost)
const DAMAGE_WAIVER_RATE = 0.1

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
  includeDamageWaiver,
  deliveryFee,
) {
  // Input validation
  if (length <= 0) throw new Error("Length must be greater than 0")
  if (duration <= 0) throw new Error("Duration must be greater than 0")
  if (!panelType) throw new Error("Panel type is required")
  if (!durationUnit) throw new Error("Duration unit is required")

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
      price: 8, // Changed from 12 to 8
      length: 2.4,
    },
    smart_duty: {
      price: 5, // Changed from 8 to 5
      length: 2.4,
    },
    pool: {
      price: 5, // Changed from 10 to 5
      length: 2.3,
    },
    crowd_control: {
      price: 5, // Changed from 8 to 5
      length: 2.2,
    },
  }

  if (!panelPricing[panelType]) {
    throw new Error("Invalid panel type")
  }

  const panelData = panelPricing[panelType]
  const numPanels = Math.ceil(length / panelData.length)
  const numClamps = numPanels // 1 clamp per panel
  const numStays = Math.ceil(numPanels / 7) // 1 stay per 7 panels

  // Calculate total feet needed
  const numFeet = numPanels + 1 + numStays * 2 // 1 foot per panel + 1 extra at end + 2 extra per stay

  // Component pricing (per week)
  const baseWeeklyPanelPrice = panelData.price

  // Convert duration to days first for consistent calculation
  let durationInDays
  let durationInWeeks

  // Special cases for exact conversions to ensure consistent pricing
  if (durationUnit === "days" && duration === 730) {
    durationInDays = 730
    durationInWeeks = 104
  } else if (durationUnit === "weeks" && duration === 104) {
    durationInDays = 730
    durationInWeeks = 104
  } else if (durationUnit === "months" && duration === 24) {
    durationInDays = 730
    durationInWeeks = 104
  } else {
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
  }

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
  let totalCost = panelCost + clampCost + stayCost + feetCost + calculatedDeliveryFee

  // Add damage waiver if selected (10% of hire cost before GST)
  const damageWaiverCost = includeDamageWaiver ? totalCost * DAMAGE_WAIVER_RATE : 0
  totalCost += damageWaiverCost

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
    damageWaiverCost,
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

// Tooltip component
const InfoTooltip = ({ children, content }) => {
  return (
    <div className="relative group">
      {children}
      <div className="absolute z-10 invisible group-hover:visible bg-[#fff0f0] text-black text-xs rounded-md p-2 w-64 bottom-full left-0 mb-2 border-2 border-[#b82429]">
        {content}
      </div>
    </div>
  )
}

// Get icon for item category
const getItemIcon = (category) => {
  switch (category) {
    case "panels":
      return <Fence size={16} className="mr-2 text-[#b82429]" />
    case "feet":
      return <Footprints size={16} className="mr-2 text-[#b82429]" />
    case "connectors":
      return <Link size={16} className="mr-2 text-[#b82429]" />
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
      return null
  }
}

export default function FencingCalculator({ onUpdate, onQuoteRequest, onBookingRequest }) {
  const [selectedFenceType, setSelectedFenceType] = useState(FENCE_OPTIONS[0].id)
  const [selectedOption, setSelectedOption] = useState(SELECT_OPTIONS[0].id)
  const [selectedFeetOption, setSelectedFeetOption] = useState(FEET_OPTIONS[0].id)
  const [metersRequired, setMetersRequired] = useState(10)
  const [hireDuration, setHireDuration] = useState(1)
  const [durationUnit, setDurationUnit] = useState(DURATION_UNITS[1].id) // Default to weeks
  const [itemsList, setItemsList] = useState<
    Array<{ name: string; quantity: number; price: number; priceDisplay?: string; isTBC?: boolean; category?: string }>
  >([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [purchaseTotal, setPurchaseTotal] = useState(0)
  const [hireTotal, setHireTotal] = useState(0)
  const sliderRef = useRef<HTMLInputElement>(null)
  const durationSliderRef = useRef<HTMLInputElement>(null)
  const [showComparison, setShowComparison] = useState(false)
  const [installFee, setInstallFee] = useState(0)
  const [removalFee, setRemovalFee] = useState(0)
  const includeDelivery = true
  const includeDamageWaiver = true
  const [calculatedDeliveryFee, setCalculatedDeliveryFee] = useState(ADDITIONAL_ITEMS_FULL.delivery.price)
  const [isDeliveryCalculated, setIsDeliveryCalculated] = useState(false)

  // Helper function to get summary panel names
  const getPanelSummaryName = (panelId: string) => {
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
  }

  // Get the duration in days (for calculation)
  const getDurationInDays = () => {
    if (durationUnit === "days") {
      return hireDuration
    } else if (durationUnit === "weeks") {
      return hireDuration * DAYS_PER_WEEK
    } else if (durationUnit === "months") {
      return hireDuration * DAYS_PER_MONTH
    }
    return 0
  }

  // Get the max duration value based on the selected unit
  const getMaxDuration = () => {
    if (durationUnit === "days") {
      return MAX_DURATION_DAYS
    } else if (durationUnit === "weeks") {
      return 104 // Exactly 104 weeks for 730 days
    } else if (durationUnit === "months") {
      return 24 // Exactly 24 months for 730 days
    }
    return 1
  }

  // Format duration for display - rounded for display but precise for calculations
  const formatDuration = () => {
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
  }

  // Load saved configuration from local storage
  useEffect(() => {
    const savedConfig = localStorage.getItem("fencingCalculatorConfig")
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig)
        setSelectedFenceType(config.selectedFenceType)
        setSelectedOption(config.selectedOption)
        setSelectedFeetOption(config.selectedFeetOption)
        setMetersRequired(Math.max(1, config.metersRequired || 10))

        // Ensure the loaded duration meets the minimum requirements
        const minDuration = getMinimumDuration(config.durationUnit)
        setHireDuration(Math.max(minDuration, config.hireDuration))
        setDurationUnit(config.durationUnit)
      } catch (e) {
        console.error("Error loading saved configuration", e)
      }
    }
  }, [])

  // Save configuration to local storage when it changes
  useEffect(() => {
    const config = {
      selectedFenceType,
      selectedOption,
      selectedFeetOption,
      metersRequired,
      hireDuration,
      durationUnit,
    }
    localStorage.setItem("fencingCalculatorConfig", JSON.stringify(config))
  }, [selectedFenceType, selectedOption, selectedFeetOption, metersRequired, hireDuration, durationUnit])

  // Ensure minimum duration is maintained when duration unit changes
  useEffect(() => {
    const minDuration = getMinimumDuration(durationUnit)
    if (hireDuration < minDuration) {
      setHireDuration(minDuration)
    }
  }, [durationUnit, hireDuration])

  // Calculate the required items and total price for purchase
  useEffect(() => {
    // If meters required is 0, show empty list
    if (metersRequired <= 0) {
      setItemsList([])
      setTotalPrice(0)
      setPurchaseTotal(0)
      return
    }

    const selectedFence = FENCE_OPTIONS.find((option) => option.id === selectedFenceType)!
    const selectedFeet = FEET_OPTIONS.find((option) => option.id === selectedFeetOption)!
    const items: Array<{
      name: string
      quantity: number
      price: number
      category: string
      priceDisplay?: string
      isTBC?: boolean
    }> = []
    let total = 0
    let panelCost = 0
    let feetCost = 0
    let clampCost = 0
    let braceCost = 0

    // Calculate number of panels needed
    const panelsNeeded = Math.ceil(metersRequired / selectedFence.length)
    items.push({
      name: getPanelSummaryName(selectedFence.id),
      quantity: panelsNeeded,
      price: selectedFence.price * panelsNeeded,
      category: "panels",
    })
    total += selectedFence.price * panelsNeeded
    panelCost += selectedFence.price * panelsNeeded

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
      feetCost += selectedFeet.price * feetNeeded
    } else if (selectedFeetOption === "hookStay") {
      items.push({
        name: ADDITIONAL_ITEMS.hookStay.name,
        quantity: feetNeeded,
        price: selectedFeet.price * feetNeeded,
        category: "feet",
      })
      total += selectedFeet.price * feetNeeded
      feetCost += selectedFeet.price * feetNeeded
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
      clampCost += ADDITIONAL_ITEMS_FULL.clamp.price * clampsNeeded
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
      braceCost += ADDITIONAL_ITEMS_FULL.brace.price * bracesNeeded

      // Each brace needs 2 additional feet
      const braceFeetNeeded = bracesNeeded * 2
      items.push({
        name: `${ADDITIONAL_ITEMS.feet.name} (for braces)`,
        quantity: braceFeetNeeded,
        price: ADDITIONAL_ITEMS_FULL.feet.price * braceFeetNeeded,
        category: "feet",
      })
      total += ADDITIONAL_ITEMS_FULL.feet.price * braceFeetNeeded
      feetCost += ADDITIONAL_ITEMS_FULL.feet.price * braceFeetNeeded
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
      name: "Installation",
      quantity: 1,
      price: 0, // Not included in total
      isTBC: true,
      category: "services",
    })

    // Add GST (10%)
    const gst = total * 0.1
    total += gst

    setItemsList(items)
    setTotalPrice(selectedOption === "purchase" ? total : hireTotal)
    setPurchaseTotal(total)
  }, [
    selectedFenceType,
    metersRequired,
    selectedOption,
    selectedFeetOption,
    calculatedDeliveryFee,
    isDeliveryCalculated,
    hireTotal,
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

    const selectedFence = FENCE_OPTIONS.find((option) => option.id === selectedFenceType)!
    const selectedFeet = FEET_OPTIONS.find((option) => option.id === selectedFeetOption)!

    // Ensure minimum duration is respected
    const minDuration = getMinimumDuration(durationUnit)
    const duration = Math.max(minDuration, hireDuration)

    try {
      const result = calculateFencingCost(
        metersRequired,
        selectedFence.panelType,
        duration,
        durationUnit,
        installFee,
        removalFee,
        selectedFeetOption,
        includeDelivery,
        includeDamageWaiver,
        isDeliveryCalculated ? calculatedDeliveryFee : 0,
      )

      const items: Array<{
        name: string
        quantity: number
        price: number
        priceDisplay?: string
        isTBC?: boolean
        category?: string
      }> = []

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
          isTBC: !isDeliveryCalculated,
        })
      }

      // Add damage waiver if selected
      if (includeDamageWaiver) {
        items.push({
          name: "Damage Waiver",
          quantity: 1,
          price: isDeliveryCalculated ? result.damageWaiverCost : 0,
          priceDisplay: "Included",
          category: "insurance",
          isTBC: !isDeliveryCalculated,
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

      // Add GST (10%)
      const gst = result.totalCost * 0.1
      const totalWithGST = result.totalCost + gst

      if (selectedOption === "hire") {
        setItemsList(items)
        setTotalPrice(totalWithGST)
      }
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
  ])

  // Format price with commas for thousands
  const formatPrice = (price: number) => {
    return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  // Update slider fill based on value
  useEffect(() => {
    if (sliderRef.current) {
      const percentage = ((metersRequired - 1) / (800 - 1)) * 100
      sliderRef.current.style.background = `linear-gradient(to right, #b82429 ${percentage}%, #e2e8f0 ${percentage}%)`
    }

    if (durationSliderRef.current && durationUnit) {
      const maxDuration = getMaxDuration()
      const minDuration = getMinimumDuration(durationUnit)
      const percentage = ((hireDuration - minDuration) / (maxDuration - minDuration)) * 100
      durationSliderRef.current.style.background = `linear-gradient(to right, #b82429 ${percentage}%, #e2e8f0 ${percentage}%)`
    }
  }, [metersRequired, hireDuration, durationUnit])

  // Handle duration unit change
  const handleDurationUnitChange = (newUnit: string) => {
    // Special cases for exact conversions
    if (durationUnit === "days" && hireDuration === 730 && newUnit === "weeks") {
      setDurationUnit(newUnit)
      setHireDuration(104)
      return
    } else if (durationUnit === "days" && hireDuration === 730 && newUnit === "months") {
      setDurationUnit(newUnit)
      setHireDuration(24)
      return
    } else if (durationUnit === "weeks" && hireDuration === 104 && newUnit === "days") {
      setDurationUnit(newUnit)
      setHireDuration(730)
      return
    } else if (durationUnit === "weeks" && hireDuration === 104 && newUnit === "months") {
      setDurationUnit(newUnit)
      setHireDuration(24)
      return
    } else if (durationUnit === "months" && hireDuration === 24 && newUnit === "days") {
      setDurationUnit(newUnit)
      setHireDuration(730)
      return
    } else if (durationUnit === "months" && hireDuration === 24 && newUnit === "weeks") {
      setDurationUnit(newUnit)
      setHireDuration(104)
      return
    }

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
  }

  // Update parent component with calculator data
  useEffect(() => {
    if (onUpdate && itemsList.length > 0) {
      onUpdate({
        itemsList,
        totalPrice,
        selectedOption,
        metersRequired,
        hireDuration,
        durationUnit,
        selectedFenceType, // Add this
        selectedFeetOption, // Add this
      })
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

  return (
    <>
      <div className="w-full bg-gray-100 py-6 pb-9 mb-0" />
      <div className={`min-h-screen w-full bg-gray-100 pt-0 pb-12 px-8 ${poppins.className}`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-6">
              <div style={{ width: "100%" }}>
                <h2 className="font-bold mb-2 text-[18px]" id="option-heading">
                  Select an Option
                </h2>
                <div className="flex gap-2" role="radiogroup" aria-labelledby="option-heading">
                  {SELECT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedOption(option.id)}
                      className="transition-colors text-sm"
                      style={{
                        borderRadius: "8px",
                        width: "119px",
                        height: "45px",
                        border: "1px solid #b82429",
                        padding: "8px 16px",
                        fontWeight: 400,
                        color: "rgb(37, 40, 42)",
                        backgroundColor: selectedOption === option.id ? "rgba(184, 36, 41, 0.1)" : "white",
                      }}
                      role="radio"
                      aria-checked={selectedOption === option.id}
                      aria-label={option.label}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ width: "100%" }}>
                <h2 className="font-bold mb-2 text-[18px]" id="fence-panel-heading">
                  Fence Panel Options
                </h2>
                <p id="fence-panel-description" className="sr-only">
                  Select the type of fence panel you need for your project.
                </p>
                <RadioGroup
                  value={selectedFenceType}
                  onValueChange={setSelectedFenceType}
                  className="grid grid-cols-1 gap-2"
                  aria-labelledby="fence-panel-heading"
                  aria-describedby="fence-panel-description"
                >
                  {FENCE_OPTIONS.map((option) => (
                    <div
                      key={option.id}
                      className={`flex items-center space-x-2 bg-white p-4 border ${
                        selectedFenceType === option.id ? "border-[#b82429] shadow-sm" : "border-gray-200"
                      } hover:border-[#b82429] transition-all duration-200`}
                      style={{
                        borderRadius: "4px",
                        cursor: "pointer",
                        transform: selectedFenceType === option.id ? "translateY(-1px)" : "none",
                      }}
                      onClick={() => setSelectedFenceType(option.id)}
                    >
                      <div className="relative flex items-center justify-center h-4 w-4">
                        <RadioGroupItem
                          value={option.id}
                          id={option.id}
                          className="h-4 w-4 before:content-none after:content-none border-0 outline-none"
                          style={{
                            appearance: "none",
                            backgroundColor: selectedFenceType === option.id ? "rgba(184, 36, 41, 0.3)" : "transparent",
                            border: `2px solid ${selectedFenceType === option.id ? "#b82429" : "#d1d5db"}`,
                            borderRadius: "50%",
                            boxShadow:
                              selectedFenceType === option.id ? "inset 0 0 0 2px rgba(255, 255, 255, 0.5)" : "none",
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <Label htmlFor={option.id} className="flex-1 font-bold">
                            {option.length}m {option.name}
                            {selectedOption === "purchase" ? ` – $${option.price} + GST` : ""}
                          </Label>
                          <div className="relative group">
                            <button
                              className="text-gray-500 hover:text-gray-700"
                              aria-label={`Information about ${option.name}`}
                            >
                              <HelpCircle size={16} />
                            </button>
                            <div className="absolute z-10 invisible group-hover:visible bg-[#fff0f0] text-black text-xs rounded-md p-2 w-64 right-0 bottom-full mb-2 border-2 border-[#b82429]">
                              <p>{option.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div style={{ width: "100%" }}>
                <h2 className="font-bold mb-2 text-[18px]" id="feet-option-heading">
                  Feet Option
                </h2>
                <RadioGroup
                  value={selectedFeetOption}
                  onValueChange={setSelectedFeetOption}
                  className="grid grid-cols-1 gap-2"
                  aria-labelledby="feet-option-heading"
                >
                  {FEET_OPTIONS.map((option) => (
                    <div
                      key={option.id}
                      className={`flex items-center space-x-2 bg-white p-4 border ${
                        selectedFeetOption === option.id ? "border-[#b82429] shadow-sm" : "border-gray-200"
                      } hover:border-[#b82429] transition-all duration-200`}
                      style={{
                        borderRadius: "4px",
                        cursor: "pointer",
                        transform: selectedFeetOption === option.id ? "translateY(-1px)" : "none",
                      }}
                      onClick={() => setSelectedFeetOption(option.id)}
                    >
                      <div className="relative flex items-center justify-center h-4 w-4">
                        <RadioGroupItem
                          value={option.id}
                          id={`feet-${option.id}`}
                          className="h-4 w-4 before:content-none after:content-none border-0 outline-none"
                          style={{
                            appearance: "none",
                            backgroundColor:
                              selectedFeetOption === option.id ? "rgba(184, 36, 41, 0.3)" : "transparent",
                            border: `2px solid ${selectedFeetOption === option.id ? "#b82429" : "#d1d5db"}`,
                            borderRadius: "50%",
                            boxShadow:
                              selectedFeetOption === option.id ? "inset 0 0 0 2px rgba(255, 255, 255, 0.5)" : "none",
                          }}
                        />
                        <style jsx global>{`
                      .RadioGroupItem[data-state="checked"]::before,
                      .RadioGroupItem[data-state="checked"]::after,
                      [data-state="checked"]::before,
                      [data-state="checked"]::after {
                        content: none !important;
                        display: none !important;
                        opacity: 0 !important;
                        visibility: hidden !important;
                        background: transparent !important;
                        border: none !important;
                        box-shadow: none !important;
                        width: 0 !important;
                        height: 0 !important;
                      }

                      /* Target any potential inner elements */
                      .RadioGroupItem[data-state="checked"] *,
                      [data-state="checked"] * {
                        display: none !important;
                      }

                      /* Override any potential background images */
                      .RadioGroupItem[data-state="checked"],
                      [data-state="checked"] {
                        background-image: none !important;
                      }
                    `}</style>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <Label htmlFor={`feet-${option.id}`} className="flex-1 font-bold">
                            {option.name}
                            {selectedOption === "purchase" ? ` – $${option.price} + GST` : ""}
                          </Label>
                          <div className="relative group">
                            <button
                              className="text-gray-500 hover:text-gray-700"
                              aria-label={`Information about ${option.name}`}
                            >
                              <HelpCircle size={16} />
                            </button>
                            <div className="absolute z-10 invisible group-hover:visible bg-[#fff0f0] text-black text-xs rounded-md p-2 w-64 right-0 bottom-full mb-2 border-2 border-[#b82429]">
                              <p>{option.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div style={{ width: "100%" }}>
                <h2 className="font-bold mb-2 text-[18px]" id="meters-heading">
                  Meters of Fencing Required
                </h2>
                <div className="space-y-2">
                  <div className="bg-white border" style={{ borderRadius: 0 }}>
                    <Input
                      type="number"
                      min={1}
                      value={metersRequired || ""}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === "") {
                          setMetersRequired(0)
                        } else {
                          const numValue = Number(value)
                          setMetersRequired(Math.min(800, Math.max(1, numValue)))
                        }
                      }}
                      className="border-0 shadow-none focus-visible:ring-0 py-5 rounded-none text-[16px] font-bold"
                      style={{ height: "auto", fontSize: "16px", fontWeight: "bold" }}
                      aria-labelledby="meters-heading"
                      aria-valuemin={1}
                      aria-valuemax={800}
                      aria-valuenow={metersRequired}
                    />
                  </div>
                  <div className="px-1 mt-2">
                    <input
                      ref={sliderRef}
                      type="range"
                      min={1}
                      max={800}
                      value={metersRequired}
                      onChange={(e) => setMetersRequired(Number(e.target.value))}
                      className="w-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #b82429 ${((metersRequired - 1) / (800 - 1)) * 100}%, #e2e8f0 ${
                          ((metersRequired - 1) / (800 - 1)) * 100
                        }%)`,
                        height: "8px",
                        borderRadius: "4px",
                        outline: "none",
                      }}
                      aria-labelledby="meters-heading"
                      aria-valuemin={1}
                      aria-valuemax={800}
                      aria-valuenow={metersRequired}
                      aria-valuetext={`${metersRequired} meters`}
                    />
                    <style jsx>{`
input[type="range"]::-webkit-slider-thumb {
-webkit-appearance: none;
appearance: none;
width: 19.8px;
height: 19.8px;
border-radius: 50%;
background: #b82429;
cursor: pointer;
border: none;
box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
}
input[type="range"]::-moz-range-thumb {
width: 19.8px;
height: 19.8px;
border-radius: 50%;
background: #b82429;
cursor: pointer;
border: none;
box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
}
input[type="range"] {
-webkit-appearance: none;
appearance: none;
height: 8px;
border-radius: 4px;
outline: none;
}
`}</style>
                  </div>
                </div>
              </div>

              {selectedOption === "hire" && (
                <div style={{ width: "100%" }}>
                  {/* Hire Duration with unit selector */}
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-[18px]" id="duration-heading">
                      Hire Duration
                    </h2>
                    <div className="flex items-center">
                      <div className="text-sm mr-2">Unit:</div>
                      <Select value={durationUnit} onValueChange={handleDurationUnitChange}>
                        <SelectTrigger className="w-[100px] h-8 text-sm">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {DURATION_UNITS.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white border" style={{ borderRadius: 0 }}>
                      <Input
                        type="number"
                        min={getMinimumDuration(durationUnit)}
                        max={getMaxDuration()}
                        step="any" // Allow decimal values in the input
                        value={hireDuration ? Number(hireDuration.toFixed(2)) : ""}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === "") {
                            setHireDuration(getMinimumDuration(durationUnit))
                          } else {
                            const numValue = Number(value)
                            setHireDuration(
                              Math.min(getMaxDuration(), Math.max(getMinimumDuration(durationUnit), numValue)),
                            )
                          }
                        }}
                        className="border-0 shadow-none focus-visible:ring-0 py-5 rounded-none text-[16px] font-bold"
                        style={{ height: "auto", fontSize: "16px", fontWeight: "bold" }}
                        aria-labelledby="duration-heading"
                        aria-valuemin={getMinimumDuration(durationUnit)}
                        aria-valuemax={getMaxDuration()}
                        aria-valuenow={hireDuration}
                      />
                    </div>
                    <div className="px-1 mt-2">
                      <input
                        ref={durationSliderRef}
                        type="range"
                        min={getMinimumDuration(durationUnit)}
                        max={getMaxDuration()}
                        step={1} // Keep step as 1 for the slider
                        value={Math.round(hireDuration)} // Round for the slider
                        onChange={(e) => {
                          // Set the exact integer value from the slider
                          setHireDuration(Number(e.target.value))
                        }}
                        className="w-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #b82429 ${
                            ((Math.round(hireDuration) - getMinimumDuration(durationUnit)) /
                              (getMaxDuration() - getMinimumDuration(durationUnit))) *
                            100
                          }%, #e2e8f0 ${((Math.round(hireDuration) - getMinimumDuration(durationUnit)) / (getMaxDuration() - getMinimumDuration(durationUnit))) * 100}%)`,
                          height: "8px",
                          borderRadius: "4px",
                          outline: "none",
                        }}
                        aria-labelledby="duration-heading"
                        aria-valuemin={getMinimumDuration(durationUnit)}
                        aria-valuemax={getMaxDuration()}
                        aria-valuenow={Math.round(hireDuration)}
                        aria-valuetext={`${Math.round(hireDuration)} ${durationUnit}`}
                      />
                      <style jsx>{`
input[type="range"]::-webkit-slider-thumb {
-webkit-appearance: none;
appearance: none;
width: 19.8px;
height: 19.8px;
border-radius: 50%;
background: #b82429;
cursor: pointer;
border: none;
box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
}
input[type="range"]::-moz-range-thumb {
width: 19.8px;
height: 19.8px;
border-radius: 50%;
background: #b82429;
cursor: pointer;
border: none;
box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
}
input[type="range"] {
-webkit-appearance: none;
appearance: none;
height: 8px;
border-radius: 4px;
outline: none;
}
`}</style>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Card className="p-6 bg-white shadow-md" style={{ width: "100%" }}>
                <div className="text-center mb-1">
                  <h2 className="text-[26px] font-bold">Estimated Fencing Costs</h2>
                  <div className="text-[#b82429] text-4xl font-bold mt-4">
                    ${formatPrice(totalPrice)}
                    <span>(inc. GST)</span>
                  </div>
                </div>

                <div className="mb-4 text-center" style={{ marginTop: "2px" }}>
                  <p className="font-bold text-[22px]">Get an instant quote</p>
                </div>

                <div className="mb-4">
                  <button
                    onClick={() => setShowComparison(!showComparison)}
                    className="text-[#b82429] hover:text-[#9e1f23] text-sm font-medium flex items-center"
                  >
                    <Info size={16} className="mr-1" />
                    {showComparison ? "Hide comparison" : "Compare purchase vs hire"}
                  </button>
                </div>
                {showComparison && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4 border rounded-md">
                      <h3 className="font-bold text-lg mb-2">Purchase Cost</h3>
                      <p className="text-2xl font-bold text-[#b82429]">${formatPrice(purchaseTotal)}</p>
                      <p className="text-sm text-gray-600 mt-1">One-time payment</p>
                    </div>
                    <div className="bg-white p-4 border rounded-md">
                      <h3 className="font-bold text-lg mb-2">Hire Cost ({formatDuration()})</h3>
                      <p className="text-2xl font-bold text-[#b82429]">${formatPrice(hireTotal)}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {((hireTotal / purchaseTotal) * 100).toFixed(0)}% of purchase price
                      </p>
                    </div>
                  </div>
                )}
                <div className="bg-gray-100 p-3 rounded-md mb-6">
                  <h3 className="font-semibold mb-4 text-lg">Items List:</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2 font-medium">Item</th>
                        <th className="py-2 font-medium text-center">Qty</th>
                        <th className="py-2 font-medium text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemsList
                        .filter((item) => !item.name.includes("Hire Duration") && !item.name.includes("Discount:"))
                        .map((item, index) => (
                          <tr key={index} className={item.isTBC ? "text-gray-700" : ""}>
                            <td className="py-2">
                              <div className="flex items-center">
                                {getItemIcon(item.category)}
                                <span>{item.name}</span>
                              </div>
                            </td>
                            <td className="py-2 text-center font-medium">{item.quantity}</td>
                            <td className="py-2 text-right">
                              {item.isTBC ? (
                                <span className="text-gray-500">TBC</span>
                              ) : (
                                <span>{item.priceDisplay || `$${formatPrice(item.price)}`}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t font-bold">
                        <td className="py-2">Total (inc. GST):</td>
                        <td></td>
                        <td className="text-right text-[#b82429]">${formatPrice(totalPrice)}</td>
                      </tr>
                      {selectedOption === "hire" && (
                        <>
                          {itemsList.find((item) => item.name.includes("Hire Duration")) && (
                            <tr>
                              <td colSpan={3} className="pt-2">
                                <div className="flex items-center">
                                  <Clock size={16} className="mr-2 text-gray-500" />
                                  <span className="font-medium">
                                    {itemsList.find((item) => item.name.includes("Hire Duration"))?.name}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          )}
                          {itemsList.find((item) => item.name.includes("Discount:")) && (
                            <tr>
                              <td colSpan={3} className="pt-2">
                                <div className="flex items-center">
                                  <Info size={16} className="mr-2 text-[#b82429]" />
                                  <span className="font-medium text-[#b82429]">
                                    {itemsList.find((item) => item.name.includes("Discount:"))?.name}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      )}
                    </tfoot>
                  </table>
                </div>
                <div className="flex gap-4">
                  <Button
                    className="flex-1 bg-[#b82429] hover:bg-[#9e1f23] text-white text-lg py-[27px]"
                    onClick={onQuoteRequest}
                  >
                    Get a Quote
                  </Button>
                  <Button
                    className="flex-1 bg-white border border-[#b82429] text-[#b82429] hover:bg-gray-50 text-lg py-[27px]"
                    onClick={onBookingRequest}
                  >
                    Book a call!
                  </Button>
                </div>

                <p className="text-xs mt-4 text-center text-gray-600 mx-0">
                  This calculation is a guide only and based on the limited information provided, excluding any fees or
                  charges. It does not constitute a formal quote, nor a suggestion on recommendation of any product.
                </p>
              </Card>
              {selectedOption === "hire" && (
                <div className="mt-6 border border-[#b82429] rounded p-3 bg-[#b8242910]" style={{ width: "100%" }}>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-sm">Duration Discounts</h4>
                    <span className="text-sm bg-[#b82429] text-white px-2 py-0.5 rounded">
                      Current: {formatDuration()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div
                      className={`flex items-center ${
                        getDurationInDays() / DAYS_PER_MONTH >= 3 && getDurationInDays() / DAYS_PER_MONTH < 6
                          ? "font-bold"
                          : ""
                      }`}
                    >
                      <span className="w-2 h-2 bg-[#b82429] rounded-full mr-1.5"></span>3 months: 15%
                    </div>
                    <div
                      className={`flex items-center ${
                        getDurationInDays() / DAYS_PER_MONTH >= 6 && getDurationInDays() / DAYS_PER_MONTH < 9
                          ? "font-bold"
                          : ""
                      }`}
                    >
                      <span className="w-2 h-2 bg-[#b82429] rounded-full mr-1.5"></span>6 months: 25%
                    </div>
                    <div
                      className={`flex items-center ${
                        getDurationInDays() / DAYS_PER_MONTH >= 9 && getDurationInDays() / DAYS_PER_MONTH < 12
                          ? "font-bold"
                          : ""
                      }`}
                    >
                      <span className="w-2 h-2 bg-[#b82429] rounded-full mr-1.5"></span>9 months: 35%
                    </div>
                    <div
                      className={`flex items-center ${getDurationInDays() / DAYS_PER_MONTH >= 12 ? "font-bold" : ""}`}
                    >
                      <span className="w-2 h-2 bg-[#b82429] rounded-full mr-1.5"></span>
                      12+ months: 45%
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
