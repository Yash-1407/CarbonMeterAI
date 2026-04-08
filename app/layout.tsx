import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "next-themes"
import { CarbonCoachChat } from "@/components/ai/carbon-coach-chat"
import { CronTrigger } from "@/components/recurring/cron-trigger"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "CarbonMeter",
  description: "Track your carbon footprint and reduce your impact",
  generator: "CarbonMeter",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Suspense fallback={null}>
            {children}
            <CarbonCoachChat />
            <CronTrigger />
          </Suspense>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
