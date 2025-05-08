"use client"

import { useState, useEffect } from "react"
import { Button, Select, InputNumber } from "antd"
import { Checkbox } from "antd"
import { formatPrice } from "../utils/priceFormatter"

const { Option } = Select

const fencingOptions = [
  {
    label: "Temporary Fencing (per meter)",
    value: "temporary",
    pricePerMeter: 15,
  },
  {
    label: "Crowd Control Barriers (per meter)",
    value: "crowdControl",
    pricePerMeter: 20,
  },
  {
    label: "Fence Netting (per meter)",
    value: "fenceNetting",
    pricePerMeter: 10,
  },
]

const durationOptions = [
  {
    label: "Days",
    value: "days",
  },
  {
    label: "Weeks",
    value: "weeks",
  },
  {
    label: "Months",
    value: "months",
  },
]

export default function FencingCalculator(props: {
  onUpdate?: (data: any) => void
  onQuoteRequest?: () => void
  onBookingRequest?: () => void
}) {
  const [metersRequired, setMetersRequired] = useState<number | null>(null)
  const [selectedOption, setSelectedOption] = useState(fencingOptions[0].value)
  const [hireDuration, setHireDuration] = useState<number | null>(null)
  const [durationUnit, setDurationUnit] = useState(durationOptions[0].value)
  const [isDeliveryRequired, setIsDeliveryRequired] = useState(false)
  const [isInstallationRequired, setIsInstallationRequired] = useState(false)
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  const calculatePrice = () => {
    if (metersRequired === null) return 0

    const selectedFencing = fencingOptions.find((option) => option.value === selectedOption)

    if (!selectedFencing) return 0

    let basePrice = metersRequired * selectedFencing.pricePerMeter

    if (isDeliveryRequired) {
      basePrice += 50
    }

    if (isInstallationRequired) {
      basePrice += 100
    }

    return basePrice
  }

  const totalPrice = calculatePrice()

  const itemsList = [
    {
      label: fencingOptions.find((option) => option.value === selectedOption)?.label,
      quantity: metersRequired,
      pricePerItem: fencingOptions.find((option) => option.value === selectedOption)?.pricePerMeter,
    },
    {
      label: "Delivery",
      quantity: isDeliveryRequired ? 1 : 0,
      pricePerItem: isDeliveryRequired ? 50 : 0,
    },
    {
      label: "Installation",
      quantity: isInstallationRequired ? 1 : 0,
      pricePerItem: isInstallationRequired ? 100 : 0,
    },
  ]

  const formatDuration = () => {
    if (hireDuration === null) return ""

    return `${hireDuration} ${durationUnit}`
  }

  // Update parent component with calculator data
  useEffect(() => {
    if (props.onUpdate) {
      props.onUpdate({
        itemsList,
        totalPrice,
        selectedOption,
        metersRequired,
        hireDuration,
        durationUnit,
      })
    }
  }, [totalPrice, selectedOption, metersRequired, hireDuration, durationUnit, props.onUpdate])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Fencing Calculator</h1>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fencing-type">
          Fencing Type
        </label>
        <Select
          id="fencing-type"
          defaultValue={selectedOption}
          style={{ width: "100%" }}
          onChange={(value) => setSelectedOption(value)}
        >
          {fencingOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="meters-required">
          Meters Required
        </label>
        <InputNumber
          id="meters-required"
          style={{ width: "100%" }}
          placeholder="Enter meters required"
          value={metersRequired}
          onChange={(value) => setMetersRequired(value)}
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="hire-duration">
          Hire Duration
        </label>
        <div className="flex">
          <InputNumber
            id="hire-duration"
            style={{ width: "50%" }}
            placeholder="Enter duration"
            value={hireDuration}
            onChange={(value) => setHireDuration(value)}
          />
          <Select defaultValue={durationUnit} style={{ width: "50%" }} onChange={(value) => setDurationUnit(value)}>
            {durationOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mb-4">
        <Checkbox checked={isDeliveryRequired} onChange={(e) => setIsDeliveryRequired(e.target.checked)}>
          Delivery Required?
        </Checkbox>
      </div>

      <div className="mb-4">
        <Checkbox checked={isInstallationRequired} onChange={(e) => setIsInstallationRequired(e.target.checked)}>
          Installation Required?
        </Checkbox>
      </div>

      <div className="mb-4">
        <p className="text-lg font-semibold">Total Price: {formatPrice(totalPrice)}</p>
      </div>

      <div className="flex space-x-4">
        <Button
          className="flex-1 bg-[#b82429] hover:bg-[#9e1f23] text-white py-6"
          onClick={() => props.onQuoteRequest && props.onQuoteRequest()}
        >
          Get a Quote
        </Button>
        <Button
          className="flex-1 bg-white border border-[#b82429] text-[#b82429] hover:bg-gray-50 py-6"
          onClick={() => props.onBookingRequest && props.onBookingRequest()}
        >
          Book a call!
        </Button>
      </div>
      {/* Modals are now handled by the parent component */}
    </div>
  )
}
