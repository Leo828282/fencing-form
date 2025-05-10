// This would be your API route handler for submitting to GoHighLevel
// Create this file in your Next.js API routes directory

import type { NextApiRequest, NextApiResponse } from "next"

// GoHighLevel API configuration
const GHL_API_KEY = process.env.GHL_API_KEY
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID
const GHL_API_URL = `https://rest.gohighlevel.com/v1/contacts/`

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const { contactData, tags } = req.body

    // Format the contact name properly
    contactData.name = `${contactData.firstName} ${contactData.lastName}`

    // Remove firstName and lastName as they're not direct fields in GoHighLevel
    delete contactData.firstName
    delete contactData.lastName

    // Create contact in GoHighLevel
    const contactResponse = await fetch(GHL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GHL_API_KEY}`,
        Location: GHL_LOCATION_ID,
      },
      body: JSON.stringify(contactData),
    })

    if (!contactResponse.ok) {
      const errorData = await contactResponse.json()
      throw new Error(`Failed to create contact: ${JSON.stringify(errorData)}`)
    }

    const contact = await contactResponse.json()

    // Add tags to the contact if there are any
    if (tags && tags.length > 0) {
      const tagResponse = await fetch(`${GHL_API_URL}${contact.id}/tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GHL_API_KEY}`,
          Location: GHL_LOCATION_ID,
        },
        body: JSON.stringify({ tags }),
      })

      if (!tagResponse.ok) {
        console.error("Failed to add tags to contact")
      }
    }

    return res.status(200).json({
      success: true,
      message: "Contact created successfully",
      contactId: contact.id,
    })
  } catch (error) {
    console.error("Error submitting to GoHighLevel:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to submit to GoHighLevel",
      error: error.message,
    })
  }
}
