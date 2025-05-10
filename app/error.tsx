"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ArrowLeft } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Unhandled error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="pb-4 space-y-1 bg-gradient-to-r from-[#b82429] to-[#d42f35] text-white">
          <CardTitle className="font-bold text-center">Error</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>

            <h2 className="text-xl font-bold mb-4 text-center">Something went wrong</h2>

            <div className="text-center mb-6 text-gray-600">
              <p>We encountered an error while processing your request.</p>
              <p className="mt-2 text-sm text-gray-500">{error.message}</p>
            </div>

            <div className="w-full flex flex-col space-y-3">
              <Button onClick={reset} className="bg-[#b82429] hover:bg-[#a01f24] text-white w-full">
                Try again
              </Button>

              <Button
                onClick={() => (window.location.href = "/")}
                variant="outline"
                className="border-[#b82429] text-[#b82429] hover:bg-[#b82429]/10 w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
