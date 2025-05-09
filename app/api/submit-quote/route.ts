import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Filter out delivery-related items from the submission
    if (data.quoteDetails && data.quoteDetails.items) {
      data.quoteDetails.items = data.quoteDetails.items.filter(
        (item) => !item.name.toLowerCase().includes("delivery") && !item.category?.toLowerCase().includes("delivery"),
      )
    }

    // Log the received data for debugging
    console.log("Quote form submission received:", JSON.stringify(data, null, 2))

    // Here you would typically send the data to your backend service or CRM
    // For now, we'll just simulate a successful submission

    // Add a slight delay to simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Quote request received successfully!",
    })
  } catch (error) {
    console.error("Error processing quote submission:", error)

    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}
