"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { getCategoryDisplayName } from "@/lib/carbon-calculations"
import { Calendar, TrendingDown, TrendingUp } from "lucide-react"

import type { CombinedActivity } from "./reports-dashboard"

interface ChartData {
  name: string
  value: number
  date?: string
  [key: string]: any
}

const COLORS = ["#0891b2", "#8b5cf6", "#ea580c", "#10b981", "#f59e0b", "#ef4444"]

interface CarbonChartsProps {
  data: CombinedActivity[]
  isLoading: boolean
  timeRange: string
}

export function CarbonCharts({ data: activities, isLoading, timeRange }: CarbonChartsProps) {

  // Prepare data for different chart types
  const dailyData = prepareDailyData(activities)
  const categoryData = prepareCategoryData(activities)
  const activityTypeData = prepareActivityTypeData(activities)
  const trendData = prepareTrendData(activities)

  const totalFootprint = activities.reduce((sum, activity) => sum + activity.carbon_footprint, 0)
  const avgDaily = dailyData.length > 0 ? totalFootprint / Number.parseInt(timeRange) : 0
  const trend = calculateTrend(trendData)

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
              <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carbon Footprint Reports</CardTitle>
          <CardDescription>No data available for the selected time period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No activities found</p>
            <p>Start tracking your carbon footprint to see detailed reports and insights.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">

      {/* Summary Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Footprint</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalFootprint.toFixed(1)} kg</div>
            <p className="text-xs text-muted-foreground">CO₂ equivalent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{avgDaily.toFixed(1)} kg</div>
            <p className="text-xs text-muted-foreground">per day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trend</CardTitle>
            {trend > 0 ? (
              <TrendingUp className="h-4 w-4 text-red-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${trend > 0 ? "text-red-500" : "text-green-500"}`}>
              {trend > 0 ? "+" : ""}
              {trend.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">vs previous period</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Carbon Footprint</CardTitle>
          <CardDescription>Your daily CO₂ emissions over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value: any) => [`${Number(value).toFixed(2)} kg CO₂`, "Carbon Footprint"]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area type="monotone" dataKey="footprint" stroke="#0891b2" fill="#0891b2" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>By Activity Type</CardTitle>
            <CardDescription>Carbon footprint breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={activityTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {activityTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${Number(value).toFixed(2)} kg CO₂`, "Carbon Footprint"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
            <CardDescription>Highest impact activities</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData.slice(0, 8)} layout="horizontal">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip formatter={(value: any) => [`${Number(value).toFixed(2)} kg CO₂`, "Carbon Footprint"]} />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Trend</CardTitle>
          <CardDescription>Carbon footprint by day of the week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={prepareWeeklyData(activities)}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`${Number(value).toFixed(2)} kg CO₂`, "Average Carbon Footprint"]} />
              <Line type="monotone" dataKey="footprint" stroke="#0891b2" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper functions for data preparation
function prepareDailyData(activities: CombinedActivity[]): ChartData[] {
  const dailyMap = new Map<string, number>()

  activities.forEach((activity) => {
    const date = activity.date
    dailyMap.set(date, (dailyMap.get(date) || 0) + activity.carbon_footprint)
  })

  return Array.from(dailyMap.entries())
    .map(([date, footprint]) => ({
      name: date,
      value: footprint,
      date: new Date(date).toLocaleDateString(),
      footprint: footprint,
    }))
    .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())
}

function prepareCategoryData(activities: CombinedActivity[]): ChartData[] {
  const categoryMap = new Map<string, number>()

  activities.forEach((activity) => {
    const category = getCategoryDisplayName(activity.category)
    categoryMap.set(category, (categoryMap.get(category) || 0) + activity.carbon_footprint)
  })

  return Array.from(categoryMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

function prepareActivityTypeData(activities: CombinedActivity[]): ChartData[] {
  const typeMap = new Map<string, number>()

  activities.forEach((activity) => {
    const type = activity.activity_type.charAt(0).toUpperCase() + activity.activity_type.slice(1)
    typeMap.set(type, (typeMap.get(type) || 0) + activity.carbon_footprint)
  })

  return Array.from(typeMap.entries()).map(([name, value]) => ({ name, value }))
}

function prepareWeeklyData(activities: CombinedActivity[]): ChartData[] {
  const weeklyMap = new Map<string, { total: number; count: number }>()
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  activities.forEach((activity) => {
    const dayOfWeek = days[new Date(activity.date).getDay()]
    const current = weeklyMap.get(dayOfWeek) || { total: 0, count: 0 }
    weeklyMap.set(dayOfWeek, {
      total: current.total + activity.carbon_footprint,
      count: current.count + 1,
    })
  })

  return days.map((day) => {
    const data = weeklyMap.get(day) || { total: 0, count: 0 }
    return {
      name: day,
      value: data.count > 0 ? data.total / data.count : 0,
      day: day.slice(0, 3),
      footprint: data.count > 0 ? data.total / data.count : 0,
    }
  })
}

function prepareTrendData(activities: CombinedActivity[]): ChartData[] {
  const sortedActivities = [...activities].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const weeklyData: ChartData[] = []
  let currentWeek: CombinedActivity[] = []
  let currentWeekStart: Date | null = null

  sortedActivities.forEach((activity) => {
    const activityDate = new Date(activity.date)
    const weekStart = new Date(activityDate)
    weekStart.setDate(activityDate.getDate() - activityDate.getDay())

    if (!currentWeekStart || weekStart.getTime() !== currentWeekStart.getTime()) {
      if (currentWeek.length > 0 && currentWeekStart) {
        const weekTotal = currentWeek.reduce((sum, a) => sum + a.carbon_footprint, 0)
        weeklyData.push({
          name: currentWeekStart.toISOString().split("T")[0],
          value: weekTotal,
        })
      }
      currentWeek = [activity]
      currentWeekStart = weekStart
    } else {
      currentWeek.push(activity)
    }
  })

  // Add the last week
  if (currentWeek.length > 0 && currentWeekStart) {
    const weekTotal = currentWeek.reduce((sum, a) => sum + a.carbon_footprint, 0)
    weeklyData.push({
      name: (currentWeekStart as Date).toISOString().split("T")[0],
      value: weekTotal,
    })
  }

  return weeklyData
}

function calculateTrend(trendData: ChartData[]): number {
  if (trendData.length < 2) return 0

  const midpoint = Math.floor(trendData.length / 2)
  const firstHalf = trendData.slice(0, midpoint)
  const secondHalf = trendData.slice(midpoint)

  const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.value, 0) / firstHalf.length
  const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.value, 0) / secondHalf.length

  if (firstHalfAvg === 0) return 0

  return ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100
}
