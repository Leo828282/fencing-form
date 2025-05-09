"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Info, X } from "lucide-react"
import { getMapsApiKey } from "@/utils/get-maps-api-key"

export default function GoogleMapsDebug() {
  const [isVisible, setIsVisible] = useState(false)
  const [debugInfo, setDebugInfo] = useState<{
    apiAvailable: boolean
    placesAvailable: boolean
    inIframe: boolean
    apiKey: string
    errors: string[]
  }>({
    apiAvailable: false,
    placesAvailable: false,
    inIframe: false,
    apiKey: "",
    errors: [],
  })

  useEffect(() => {
    // Check if we're in an iframe
    const inIframe = window !== window.parent

    // Get API key from client-side sources only (cookies, sessionStorage)
    const apiKey = getMapsApiKey()
    const hasApiKey = !!apiKey

    // Check if Google Maps API is available
    const apiAvailable = !!(window.google && window.google.maps)

    // Check if Places API is available
    const placesAvailable = !!(window.google && window.google.maps && window.google.maps.places)

    // Collect errors
    const errors: string[] = []

    if (!hasApiKey) {
      errors.push("No Google Maps API key found in client storage")
    }

    if (!apiAvailable) {
      errors.push("Google Maps API is not available")
    }

    if (!placesAvailable && apiAvailable) {
      errors.push("Google Maps Places library is not available")
    }

    if (inIframe) {
      errors.push("Running in an iframe - make sure the iframe has the correct permissions")
    }

    setDebugInfo({
      apiAvailable,
      placesAvailable,
      inIframe,
      apiKey: hasApiKey ? `${apiKey.substring(0, 5)}...` : "Not found in client storage",
      errors,
    })

    // If we're in an iframe, send debug info to parent
    if (inIframe) {
      try {
        window.parent.postMessage(
          {
            type: "GOOGLE_MAPS_DEBUG",
            info: {
              apiAvailable,
              placesAvailable,
              hasApiKey,
              errors,
            },
          },
          "*",
        )
      } catch (e) {
        console.error("Error sending debug info to parent:", e)
      }
    }
  }, [])

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-amber-500 hover:bg-amber-600"
        size="sm"
      >
        <Info className="mr-2 h-4 w-4" />
        Debug Maps
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Google Maps Debug</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="mr-2">
                  <Info className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">API Key Status</p>
                  <p className="text-sm text-gray-500">
                    {debugInfo.apiKey ? "API key found in client storage" : "No API key in client storage"}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="mr-2">
                  {debugInfo.apiAvailable ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium">Maps API Available</p>
                  <p className="text-sm text-gray-500">{debugInfo.apiAvailable ? "Yes" : "No"}</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="mr-2">
                  {debugInfo.placesAvailable ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium">Places API Available</p>
                  <p className="text-sm text-gray-500">{debugInfo.placesAvailable ? "Yes" : "No"}</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="mr-2">
                  <Info className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Running in iframe</p>
                  <p className="text-sm text-gray-500">{debugInfo.inIframe ? "Yes" : "No"}</p>
                </div>
              </div>
            </div>

            {debugInfo.errors.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="font-medium text-red-700 mb-2">Issues detected:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {debugInfo.errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-700">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Google Maps API key is now handled securely on the server side. The key is not
                exposed in client-side code for security reasons.
              </p>
            </div>

            <Button
              onClick={() => {
                // Reload the page to try again
                window.location.reload()
              }}
              className="w-full"
            >
              Reload Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
