import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import IframeHandler from "@/components/iframe-handler"
import { Titillium_Web, Open_Sans } from "next/font/google"
import Script from "next/script"

// Optimize font loading with display: swap
const titilliumWeb = Titillium_Web({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-titillium-web",
})

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
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
        {/* Preload critical assets */}
        <link rel="preconnect" href="https://api.leadconnectorhq.com" />
        <link rel="dns-prefetch" href="https://api.leadconnectorhq.com" />
        {/* Preload fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${titilliumWeb.variable} ${openSans.variable} font-sans bg-white`}>
        <IframeHandler />
        {children}

        {/* Preload the booking script */}
        <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="lazyOnload" id="booking-script" />
      </body>
    </html>
  )
}
