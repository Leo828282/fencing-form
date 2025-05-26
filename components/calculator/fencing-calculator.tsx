"use client"

import { useState, useMemo, memo } from "react"
import { Info } from "react-feather"

const FencingCalculator = () => {
  const [fencePanelType, setFencePanelType] = useState("temporary")
  const [feetOption, setFeetOption] = useState("concrete")
  const [metersOfFencing, setMetersOfFencing] = useState(0)
  const [hireDuration, setHireDuration] = useState(1)
  const [customQuantities, setCustomQuantities] = useState({})

  const fencePanelOptions = [
    { value: "temporary", label: "Temporary Fence Panels" },
    { value: "chainLink", label: "Chain Link Fence Panels" },
  ]

  const feetOptions = [
    { value: "concrete", label: "Concrete Feet" },
    { value: "plastic", label: "Plastic Feet" },
  ]

  const items = useMemo(() => {
    const baseItems = [
      {
        name: "Temporary Fence Panel",
        category: "panels",
        price: 3.5,
        quantity: Math.ceil(metersOfFencing / 2.4),
        defaultQuantity: Math.ceil(metersOfFencing / 2.4),
        icon: "fence",
        isTBC: false,
      },
      {
        name: "Concrete Foot",
        category: "feet",
        price: 1.5,
        quantity: Math.ceil(metersOfFencing / 2.4),
        defaultQuantity: Math.ceil(metersOfFencing / 2.4),
        icon: "foot",
        isTBC: false,
      },
      {
        name: "Bracing",
        category: "accessories",
        price: 2.0,
        quantity: Math.ceil(metersOfFencing / 10),
        defaultQuantity: Math.ceil(metersOfFencing / 10),
        icon: "bracing",
        isTBC: false,
      },
      {
        name: "Coupler",
        category: "accessories",
        price: 0.5,
        quantity: Math.ceil(metersOfFencing / 2.4),
        defaultQuantity: Math.ceil(metersOfFencing / 2.4),
        icon: "coupler",
        isTBC: false,
      },
      {
        name: "Delivery",
        category: "delivery",
        price: 50.0,
        quantity: 1,
        defaultQuantity: 1,
        icon: "delivery",
        isTBC: false,
      },
      {
        name: "Hire Duration",
        category: "services",
        price: 5.0,
        quantity: hireDuration,
        defaultQuantity: hireDuration,
        icon: "duration",
        isTBC: false,
      },
    ]

    if (fencePanelType === "chainLink") {
      baseItems[0] = {
        name: "Chain Link Fence Panel",
        category: "panels",
        price: 5.0,
        quantity: Math.ceil(metersOfFencing / 2.4),
        defaultQuantity: Math.ceil(metersOfFencing / 2.4),
        icon: "fence",
        isTBC: false,
      }
    }

    if (feetOption === "plastic") {
      baseItems[1] = {
        name: "Plastic Foot",
        category: "feet",
        price: 2.0,
        quantity: Math.ceil(metersOfFencing / 2.4),
        defaultQuantity: Math.ceil(metersOfFencing / 2.4),
        icon: "foot",
        isTBC: false,
      }
    }

    const discount = calculateDiscount(baseItems)

    if (discount > 0) {
      baseItems.push({
        name: "Discount:",
        category: "discount",
        price: -discount,
        quantity: 1,
        defaultQuantity: 1,
        icon: "discount",
        isTBC: false,
      })
    }

    return baseItems
  }, [fencePanelType, feetOption, metersOfFencing, hireDuration])

  const calculateDiscount = (items) => {
    let totalPrice = 0
    items.forEach((item) => {
      if (item.category !== "discount") {
        totalPrice += item.price * item.quantity
      }
    })

    if (totalPrice > 500) {
      return totalPrice * 0.05
    }

    return 0
  }

  const totalPrice = useMemo(() => {
    let price = 0
    items.forEach((item) => {
      price += item.price * item.quantity
    })
    return price
  }, [items])

  const getItemIcon = (category, name) => {
    switch (category) {
      case "panels":
        return <span className="mr-2"></span> // Replace with actual fence icon
      case "feet":
        return <span className="mr-2"></span> // Replace with actual foot icon
      case "accessories":
        return <span className="mr-2"></span> // Replace with actual accessories icon
      case "delivery":
        return <span className="mr-2"></span> // Replace with actual delivery icon
      case "services":
        return <span className="mr-2"></span> // Replace with actual services icon
      case "discount":
        return <span className="mr-2"></span> // Replace with actual discount icon
      default:
        return <span className="mr-2"></span>
    }
  }

  const getItemQuantity = (item) => {
    return customQuantities[item.name] !== undefined ? customQuantities[item.name] : item.quantity
  }

  const hasCustomQuantity = (item) => {
    return customQuantities[item.name] !== undefined
  }

  const increaseQuantity = (itemName, itemCategory) => {
    setCustomQuantities((prevQuantities) => ({
      ...prevQuantities,
      [itemName]: (prevQuantities[itemName] || items.find((item) => item.name === itemName).quantity) + 1,
    }))
  }

  const decreaseQuantity = (itemName, itemCategory) => {
    const currentQuantity = customQuantities[itemName] || items.find((item) => item.name === itemName).quantity
    if (currentQuantity > 1) {
      setCustomQuantities((prevQuantities) => ({
        ...prevQuantities,
        [itemName]: currentQuantity - 1,
      }))
    }
  }

  const resetQuantity = (itemName) => {
    setCustomQuantities((prevQuantities) => {
      const newQuantities = { ...prevQuantities }
      delete newQuantities[itemName]
      return newQuantities
    })
  }

  const formatPrice = (price) => {
    return price.toFixed(2)
  }

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
          <td className="py-2 text-gray-900 text-sm">
            <div className="flex items-center">
              {getItemIcon(item.category, item.name)}
              <span className="text-gray-900">{item.name}</span>
            </div>
          </td>
          <td className="text-center py-2 text-gray-900 text-sm">
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
          <td className="text-right py-2 text-gray-900 text-sm">
            <span className="text-gray-900">
              {item.isTBC ? "TBC" : item.priceDisplay || `$${formatPrice(item.price)}`}
            </span>
          </td>
        </tr>
      )
    },
  )

  const itemsList = useMemo(() => {
    return items
  }, [items])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">Fencing Calculator</h1>

      <div className="mb-4">
        <h3 className="font-heading font-bold text-base mb-2 text-gray-900">Select Fence Panel Options</h3>
        <select
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={fencePanelType}
          onChange={(e) => setFencePanelType(e.target.value)}
        >
          {fencePanelOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <h3 className="font-heading font-bold text-base mb-2 text-gray-900">Select Feet Option</h3>
        <select
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={feetOption}
          onChange={(e) => setFeetOption(e.target.value)}
        >
          {feetOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <h3 className="font-heading font-bold text-base mb-3 text-gray-900">Meters of Fencing Required</h3>
        <input
          type="number"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={metersOfFencing}
          onChange={(e) => setMetersOfFencing(Number.parseFloat(e.target.value))}
        />
      </div>

      <div className="mb-4">
        <h3 className="font-heading font-bold text-base text-gray-900">Hire Duration</h3>
        <input
          type="number"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={hireDuration}
          onChange={(e) => setHireDuration(Number.parseInt(e.target.value))}
        />
      </div>

      <h3 className="font-heading font-bold text-base mb-4 text-gray-900">Item List:</h3>

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
  )
}

export default FencingCalculator
