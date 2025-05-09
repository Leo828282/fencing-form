import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import IframeHandler from "@/components/iframe-handler"

export const metadata: Metadata = {
  title: "Fencing Calculator",
  description: "Calculate the cost of your fencing project",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="referrer" content="origin" />
      </head>
      <body>
        <IframeHandler />
        {children}
      </body>
    </html>
  )
}
