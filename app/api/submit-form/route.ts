import { type NextRequest, NextResponse } from "next/server"

// Get the webhook URL from environment variables
const WEBHOOK_URL = process.env.CDV_WEBHOOK_URL

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request body
    const formData = await request.json()

    // Validate required fields
    if (!formData.fullName || !formData.email || !formData.contactNumber || !formData.message) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Validate hire-specific fields if inquiry type is hire
    if (formData.inquiryType === "hire" && (!formData.hireDuration || !formData.meters)) {
      return NextResponse.json({ success: false, error: "Missing hire details" }, { status: 400 })
    }

    // Format the data for the webhook
    const webhookData = {
      firstName: formData.fullName.split(" ")[0],
      lastName: formData.fullName.split(" ").slice(1).join(" ") || "",
      email: formData.email,
      phone: formData.contactNumber,
      companyName: formData.company || "",
      inquiryType: formData.inquiryType,
      hireDuration: formData.hireDuration || "",
      meters: formData.meters || "",
      message: formData.message,
      source: "Website Contact Form",
      tags: [formData.inquiryType === "hire" ? "Hire Enquiry" : "Purchase Enquiry"],
    }

    // Check if webhook URL is configured
    if (!WEBHOOK_URL) {
      console.error("Webhook URL is not configured")
      return NextResponse.json(
        { success: false, error: "Server configuration error: Webhook URL is not configured" },
        { status: 500 },
      )
    }

    // Send the data to the webhook
    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookData),
    })

    // Check if the webhook request was successful
    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text()
      console.error("Webhook error:", webhookResponse.status, errorText)
      return NextResponse.json({ success: false, error: `Webhook error: ${webhookResponse.status}` }, { status: 500 })
    }

    // Return success response
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing form submission:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
