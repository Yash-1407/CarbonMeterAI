"use client"

import type React from "react"

import type { CombinedActivity } from "./reports-dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Lightbulb, Target, TrendingDown, Award } from "lucide-react"

interface Activity {
  id: string
  activity_type: string
  category: string
  amount: number
  carbon_footprint: number
  date: string
}

interface Insight {
  type: "tip" | "achievement" | "goal" | "trend"
  title: string
  description: string
  icon: React.ReactNode
  priority: "high" | "medium" | "low"
}

interface CarbonInsightsProps {
  data: CombinedActivity[]
  isLoading: boolean
}

export function CarbonInsights({ data: activities, isLoading }: CarbonInsightsProps) {
  const insights = generateInsights(activities)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/2 animate-pulse" />
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  const totalFootprint = activities.reduce((sum, activity) => sum + activity.carbon_footprint, 0)
  const avgDaily = activities.length > 0 ? totalFootprint / 30 : 0

  // Global average is about 16 tons per year, or ~44 kg per day
  const globalAvgDaily = 44
  const comparisonPercentage = avgDaily > 0 ? ((avgDaily / globalAvgDaily) * 100).toFixed(0) : "0"

  return (
    <div className="space-y-6">
      {/* Carbon Footprint Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Your Impact vs Global Average
          </CardTitle>
          <CardDescription>How your carbon footprint compares to the global average</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Your daily average</span>
            <span className="text-lg font-bold text-primary">{avgDaily.toFixed(1)} kg CO₂</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Global average</span>
            <span className="text-lg font-bold text-muted-foreground">{globalAvgDaily} kg CO₂</span>
          </div>
          <Progress value={Math.min(Number.parseFloat(comparisonPercentage), 100)} className="h-3" />
          <div className="text-center">
            <Badge variant={Number.parseFloat(comparisonPercentage) < 100 ? "default" : "destructive"}>
              {comparisonPercentage}% of global average
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Insights & Recommendations</h3>
        {insights.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground">
                Track more activities to get personalized insights and recommendations!
              </p>
            </CardContent>
          </Card>
        ) : (
          insights.map((insight, index) => (
            <Card key={index} className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  {insight.icon}
                  {insight.title}
                  <Badge variant={insight.priority === "high" ? "destructive" : "secondary"} className="ml-auto">
                    {insight.priority}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Monthly Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-accent" />
            Monthly Goal Progress
          </CardTitle>
          <CardDescription>Track your progress towards reducing your carbon footprint</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Current month</span>
            <span className="text-lg font-bold text-accent">{totalFootprint.toFixed(1)} kg CO₂</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Target (20% reduction)</span>
            <span className="text-lg font-bold text-muted-foreground">
              {(globalAvgDaily * 30 * 0.8).toFixed(1)} kg CO₂
            </span>
          </div>
          <Progress value={Math.min((totalFootprint / (globalAvgDaily * 30 * 0.8)) * 100, 100)} className="h-3" />
          <div className="text-center">
            <Badge variant={totalFootprint < globalAvgDaily * 30 * 0.8 ? "default" : "secondary"}>
              {totalFootprint < globalAvgDaily * 30 * 0.8 ? "Goal achieved!" : "Keep going!"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function generateInsights(activities: CombinedActivity[]): Insight[] {
  const insights: Insight[] = []

  if (activities.length === 0) return insights

  // Analyze activity patterns
  const activityTypes = activities.reduce(
    (acc, activity) => {
      acc[activity.activity_type] = (acc[activity.activity_type] || 0) + activity.carbon_footprint
      return acc
    },
    {} as Record<string, number>,
  )

  const categories = activities.reduce(
    (acc, activity) => {
      acc[activity.category] = (acc[activity.category] || 0) + activity.carbon_footprint
      return acc
    },
    {} as Record<string, number>,
  )

  // Find highest impact category
  const highestCategory = Object.entries(categories).sort(([, a], [, b]) => b - a)[0]
  if (highestCategory && highestCategory[1] > 0) {
    insights.push({
      type: "tip",
      title: "Reduce Your Biggest Impact",
      description: `Your highest carbon footprint comes from ${highestCategory[0]} (${highestCategory[1].toFixed(1)} kg CO₂). Consider alternatives like public transport, energy-efficient appliances, or plant-based meals.`,
      icon: <Lightbulb className="w-4 h-4 text-yellow-500" />,
      priority: "high",
    })
  }

  // Check for transport activities
  if (activityTypes.transport > 0) {
    const transportPercentage =
      (activityTypes.transport / activities.reduce((sum, a) => sum + a.carbon_footprint, 0)) * 100
    if (transportPercentage > 50) {
      insights.push({
        type: "tip",
        title: "Transportation Focus",
        description: `Transportation accounts for ${transportPercentage.toFixed(0)}% of your carbon footprint. Try carpooling, public transport, or cycling for short trips.`,
        icon: <TrendingDown className="w-4 h-4 text-blue-500" />,
        priority: "high",
      })
    }
  }

  // Check for consistent tracking
  const uniqueDays = new Set(activities.map((a) => a.date)).size
  if (uniqueDays >= 7) {
    insights.push({
      type: "achievement",
      title: "Consistent Tracker",
      description: `Great job! You've been tracking your carbon footprint for ${uniqueDays} days. Consistency is key to understanding and reducing your impact.`,
      icon: <Award className="w-4 h-4 text-green-500" />,
      priority: "medium",
    })
  }

  // Check for low-carbon activities
  const lowCarbonActivities = activities.filter((a) => a.carbon_footprint < 1).length
  if (lowCarbonActivities > activities.length * 0.3) {
    insights.push({
      type: "achievement",
      title: "Eco-Friendly Choices",
      description: `${((lowCarbonActivities / activities.length) * 100).toFixed(0)}% of your activities have low carbon impact. Keep making sustainable choices!`,
      icon: <Award className="w-4 h-4 text-green-500" />,
      priority: "low",
    })
  }

  return insights.slice(0, 5) // Limit to 5 insights
}
