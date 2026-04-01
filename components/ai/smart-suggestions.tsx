"use client"

import { useEffect, useState } from "react"
import { Lightbulb, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function SmartSuggestions() {
  const [tips, setTips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSuggestions = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/ai/suggestions")
      const data = await res.json()
      if (data && data.tips) {
        setTips(data.tips)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuggestions()
  }, [])

  if (loading) {
    return (
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 animate-pulse border-amber-100">
        <CardContent className="p-4 flex items-center gap-3">
          <Lightbulb className="text-amber-300 h-6 w-6" />
          <div className="h-4 bg-amber-200/50 rounded w-2/3"></div>
        </CardContent>
      </Card>
    )
  }

  if (tips.length === 0) return null

  // Ensure tips is not empty before indexing
  const randomTip = tips[Math.floor(Math.random() * tips.length)]

  return (
    <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100 mt-4 overflow-hidden relative group">
      <CardContent className="p-4 flex items-start sm:items-center gap-3 flex-col sm:flex-row">
        <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
          <Lightbulb className="text-amber-500 h-5 w-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-amber-900">{randomTip?.title || "AI Insight"}</h4>
          <p className="text-sm text-amber-800/80 mt-1">{randomTip?.description || "Tracking often leads to better habits."}</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={fetchSuggestions}
          className="text-amber-600 hover:text-amber-700 hover:bg-amber-200/50 sm:self-center self-end sm:mt-0 -mt-8"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
