"use client"

import { useState } from "react"
import { Button } from "../ui/button"

const FencingCalculator = () => {
  const [length, setLength] = useState<number | null>(null)
  const [width, setWidth] = useState<number | null>(null)
  const [height, setHeight] = useState<number | null>(null)
  const [materialCost, setMaterialCost] = useState<number | null>(null)
  const [laborCost, setLaborCost] = useState<number | null>(null)
  const [totalCost, setTotalCost] = useState<number | null>(null)

  const handleCalculateCosts = () => {
    if (length === null || width === null || height === null || materialCost === null || laborCost === null) {
      alert("Please enter all values")
      return
    }

    const perimeter = 2 * (length + width)
    const fenceArea = perimeter * height
    const materialCosts = fenceArea * materialCost
    const laborCosts = perimeter * laborCost
    const totalCosts = materialCosts + laborCosts

    setTotalCost(totalCosts)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Fencing Calculator</h1>

      <div className="mb-4">
        <label htmlFor="length" className="block text-gray-700 text-sm font-bold mb-2">
          Length (feet):
        </label>
        <input
          type="number"
          id="length"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter length"
          onChange={(e) => setLength(Number.parseFloat(e.target.value))}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="width" className="block text-gray-700 text-sm font-bold mb-2">
          Width (feet):
        </label>
        <input
          type="number"
          id="width"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter width"
          onChange={(e) => setWidth(Number.parseFloat(e.target.value))}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="height" className="block text-gray-700 text-sm font-bold mb-2">
          Height (feet):
        </label>
        <input
          type="number"
          id="height"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter height"
          onChange={(e) => setHeight(Number.parseFloat(e.target.value))}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="materialCost" className="block text-gray-700 text-sm font-bold mb-2">
          Material Cost (per sq ft):
        </label>
        <input
          type="number"
          id="materialCost"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter material cost"
          onChange={(e) => setMaterialCost(Number.parseFloat(e.target.value))}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="laborCost" className="block text-gray-700 text-sm font-bold mb-2">
          Labor Cost (per linear ft):
        </label>
        <input
          type="number"
          id="laborCost"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter labor cost"
          onChange={(e) => setLaborCost(Number.parseFloat(e.target.value))}
        />
      </div>

      <Button
        onClick={handleCalculateCosts}
        className="w-full bg-[#b82429] hover:bg-[#9e1f23] text-white py-3 px-4 rounded-lg font-medium text-sm sm:text-base"
      >
        I have it figured out calculate my costs
      </Button>

      {totalCost !== null && (
        <div className="mt-4">
          <h2 className="text-lg font-bold">Total Estimated Cost:</h2>
          <p className="text-xl">${totalCost.toFixed(2)}</p>
        </div>
      )}
    </div>
  )
}

export default FencingCalculator
