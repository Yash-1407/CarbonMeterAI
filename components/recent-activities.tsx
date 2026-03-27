"use client"

import { useEffect, useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import type { CombinedActivity } from "./reports-dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCategoryDisplayName } from "@/lib/carbon-calculations"
import { Car, Zap, UtensilsCrossed, Trash2, ShoppingBag, Calendar } from "lucide-react"

const ACTIVITY_ICONS = {
  transport: Car,
  energy: Zap,
  food: UtensilsCrossed,
  waste: Trash2,
  other: ShoppingBag,
}

interface RecentActivitiesProps {
  data?: CombinedActivity[]
  isLoading?: boolean
  disableFetch?: boolean
}

export function RecentActivities({ data: externalData, isLoading: externalLoading, disableFetch }: RecentActivitiesProps = {}) {
  const [internalActivities, setInternalActivities] = useState<CombinedActivity[]>([])
  const [internalLoading, setInternalLoading] = useState(!disableFetch)
  const supabase = createClient()

  useEffect(() => {
    if (disableFetch) return;

    const fetchActivities = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data, error } = await supabase
          .from("carbon_activities")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5)

        if (error) throw error

        const formattedData: CombinedActivity[] = (data || []).map(item => ({
          ...item,
          source: "Activity",
        }))

        setInternalActivities(formattedData)
      } catch (error) {
        console.error("Error fetching activities:", error)
      } finally {
        setInternalLoading(false)
      }
    }

    fetchActivities()
  }, [supabase, disableFetch])

  const activities = disableFetch ? (externalData || []) : internalActivities
  const isLoading = disableFetch ? externalLoading : internalLoading

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Your latest carbon footprint entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
                <div className="h-6 bg-muted rounded w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Your latest carbon footprint entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No activities logged yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>Your latest carbon footprint entries</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = ACTIVITY_ICONS[activity.activity_type as keyof typeof ACTIVITY_ICONS] || Calendar
            const isNegative = activity.carbon_footprint < 0

            return (
              <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg border border-border">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{getCategoryDisplayName(activity.category)}</span>
                    <Badge variant="outline" className="text-xs">
                      {activity.activity_type}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {activity.source}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {activity.amount} {activity.unit} • {new Date(activity.date).toLocaleDateString()}
                  </div>
                  {(activity as any).notes && <div className="text-sm text-muted-foreground mt-1 italic">{(activity as any).notes}</div>}
                </div>
                <div className="text-right">
                  <div className={`font-bold ${isNegative ? "text-green-600" : "text-primary"}`}>
                    {isNegative ? "-" : ""}
                    {Math.abs(activity.carbon_footprint).toFixed(2)} kg
                  </div>
                  <div className="text-xs text-muted-foreground">CO₂</div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
