import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import IframeHandler from "@/components/iframe-handler"
import { Titillium_Web, Open_Sans } from "next/font/google"

const titilliumWeb = Titillium_Web({
  subsets: ["latin"],
  weight: ["200", "300", "400", "600", "700", "900"],
  variable: "--font-titillium-web",
})

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-open-sans",
})

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
      <body className={`${titilliumWeb.variable} ${openSans.variable} font-sans`}>
        <IframeHandler />
        {children}
      </body>
    </html>
  )
}
