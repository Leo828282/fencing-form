"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

export default function TestGoHighLevel() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/test-gohighlevel")
      const data = await response.json()

      setResult(data)

      if (!data.success) {
        setError(data.message || "Unknown error")
      }
    } catch (err) {
      setError("Failed to test connection: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setLoading(false)
    }
  }

  const verifyFields = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/verify-gohighlevel-fields")
      const data = await response.json()

      setResult(data)

      if (!data.success) {
        setError(data.message || "Unknown error")
      }
    } catch (err) {
      setError("Failed to verify fields: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Test GoHighLevel Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <Button onClick={testConnection} disabled={loading}>
              {loading ? "Testing..." : "Test Connection"}
            </Button>
            <Button onClick={verifyFields} disabled={loading} variant="outline">
              {loading ? "Verifying..." : "Verify Field Names"}
            </Button>
          </div>

          {error && <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">{error}</div>}

          {result && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
              <h3 className="font-medium mb-2">Result:</h3>
              <pre className="text-xs overflow-auto p-2 bg-white border border-gray-200 rounded">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-4">
          <p className="text-sm text-gray-500">
            This page helps you test your GoHighLevel integration and verify the field mappings.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
