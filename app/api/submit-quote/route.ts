import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const data = await request.json()

    // Log the received data for debugging
    console.log("Quote form submission received:", JSON.stringify(data, null, 2))

    // Here you would typically send the data to your backend service or CRM
    // For now, we'll simulate a successful submission

    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email || !data.phone) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 })
    }

    // Validate phone format (basic check)
    const phoneRegex = /^[0-9\s+\-$$$$]{8,15}$/
    if (!phoneRegex.test(data.phone)) {
      return NextResponse.json({ success: false, error: "Invalid phone number format" }, { status: 400 })
    }

    // Validate quote details
    if (!data.quoteDetails) {
      return NextResponse.json({ success: false, error: "Missing quote details" }, { status: 400 })
    }

    // Add a slight delay to simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real application, you would send this data to your CRM or email service
    // For example:
    // await sendToCRM(data);
    // or
    // await sendConfirmationEmail(data.email, data);

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Quote request received successfully!",
      reference: `QUOTE-${Date.now().toString().substring(5)}`,
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
