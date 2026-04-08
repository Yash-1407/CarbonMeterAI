"use client"

import { useEffect } from "react"

export function CronTrigger() {
  useEffect(() => {
    // Ping the cron endpoint every 1 minute if the user is keeping the app open
    // This allows local simulations to run without external cron services
    const checkCron = async () => {
      try {
        await fetch("/api/run-recurring-activities")
      } catch (err) {
        console.error("Cron check failed:", err)
      }
    }

    // Run once on mount
    checkCron()

    // Run every 60 seconds
    const interval = setInterval(checkCron, 1000 * 60)
    return () => clearInterval(interval)
  }, [])
  
  return null
}
