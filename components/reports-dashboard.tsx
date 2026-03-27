"use client"

import { useEffect, useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { CarbonCharts } from "@/components/carbon-charts"
import { CarbonInsights } from "@/components/carbon-insights"
import { RecentActivities } from "@/components/recent-activities"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

export interface CombinedActivity {
  id: string
  source: "IoT" | "Activity"
  activity_type: string
  category: string
  amount: number
  unit: string
  carbon_footprint: number
  date: string
  created_at: string
}

export function ReportsDashboard() {
  const [data, setData] = useState<CombinedActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30") // days
  const [sourceFilter, setSourceFilter] = useState("all") // all, iot, activity
  
  const supabase = createClient()

  useEffect(() => {
    let channel: any = null

    const fetchData = async () => {
      setIsLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const daysAgo = new Date()
        daysAgo.setDate(daysAgo.getDate() - Number.parseInt(timeRange))
        const dateString = daysAgo.toISOString().split("T")[0]
        const dateTimeString = daysAgo.toISOString()

        // Fetch Carbon Activities safely
        const { data: activitiesData, error: activitiesError } = await supabase
          .from("carbon_activities")
          .select("*")
          .eq("user_id", user.id)

        if (activitiesError) {
          console.error("Activities fetch error:", activitiesError)
        }

        // Fetch IoT Data safely
        const { data: iotData, error: iotError } = await supabase
          .from("iot_data")
          .select("*")
          .eq("user_id", user.id)

        if (iotError) {
          console.error("IoT fetch error:", iotError)
        }

        // Merge Data
        const mergedData: CombinedActivity[] = [
          ...(activitiesData || []).map((item) => ({
            id: item.id,
            source: "Activity" as const,
            activity_type: item.activity_type,
            category: item.category,
            amount: item.value ?? item.amount,
            unit: item.unit,
            carbon_footprint: item.total_carbon ?? item.carbon_footprint,
            date: item.date ?? (item.created_at ? item.created_at.split("T")[0] : new Date().toISOString().split("T")[0]),
            created_at: item.created_at,
          })),
          ...(iotData || []).map((item) => ({
            id: item.id,
            source: "IoT" as const,
            activity_type: item.transport_type || item.energy_type || item.module,
            category: item.module,
            amount: item.value,
            unit: item.unit || (item.module === "energy" ? "kWh" : "km"),
            carbon_footprint: item.carbon_emission ?? item.total_carbon ?? (item.module === "energy" ? item.value * 0.85 : item.value * 0.2),
            date: item.created_at.split("T")[0],
            created_at: item.created_at,
          })),
        ]

        // Sort by date ascending
        mergedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        // Filter based on timeRange client-side to guarantee resilience against DB timezone issues
        const filteredByDate = mergedData.filter((item) => {
          const itemDate = new Date(item.date).getTime()
          const cutoffDate = new Date(dateString).getTime()
          return itemDate >= cutoffDate
        })

        setData(filteredByDate)

        // Setup real-time listeners if not already active
        if (!channel) {
          channel = supabase
            .channel('reports-dashboard-changes')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'carbon_activities', filter: `user_id=eq.${user.id}` },
              () => {
                console.log('Realtime change detected in Activity. Refreshing...')
                fetchData()
              }
            )
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'iot_data', filter: `user_id=eq.${user.id}` },
              () => {
                console.log('Realtime change detected in IoT. Refreshing...')
                fetchData()
              }
            )
            .subscribe()
        }

      } catch (error) {
        console.error("Error fetching reports data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [supabase, timeRange])

  const filteredData = useMemo(() => {
    if (sourceFilter === "all") return data
    if (sourceFilter === "iot") return data.filter(d => d.source === "IoT")
    return data.filter(d => d.source === "Activity")
  }, [data, sourceFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Carbon Footprint Reports</h1>
          <p className="text-muted-foreground">
            Analyze your environmental impact across all your connected sources
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="iot">IoT Data</SelectItem>
              <SelectItem value="activity">Manual Activity</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="charts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl">
          <TabsTrigger value="charts">Charts & Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights & Goals</TabsTrigger>
          <TabsTrigger value="history">Activity History</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-6">
          <CarbonCharts data={filteredData} isLoading={isLoading} timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <CarbonInsights data={filteredData} isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="history" className="space-y-6">
          <RecentActivities data={filteredData} isLoading={isLoading} disableFetch={true} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
