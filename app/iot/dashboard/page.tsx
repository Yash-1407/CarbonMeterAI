"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { getIoTData } from "@/lib/supabase/iot-service"
import { IoTCharts } from "@/components/iot/iot-charts"
import { IoTTable } from "@/components/iot/iot-table"
import { RecurringActivitiesList } from "@/components/recurring/recurring-activities-list"
import { Activity, Car, Zap, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface IoTData {
  id: string
  module: string
  transport_type: string | null
  frequency: string | null
  energy_type: string | null
  value: number
  unit: string | null
  created_at: string
}

export default function IoTDashboardPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [data, setData] = useState<IoTData[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchDashboardData = async (userId: string) => {
    try {
      const records = await getIoTData(userId)
      setData(records)
    } catch (err) {
      console.error("Failed to fetch IoT data for dashboard", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        await fetchDashboardData(user.id)
      } else {
        setLoading(false)
      }
    }
    init()
  }, [supabase.auth])

  // Real-Time Subscription
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('custom-iot-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'iot_data', filter: `user_id=eq.${user.id}` },
        () => {
          console.log('Realtime change detected. Refreshing IoT data...')
          fetchDashboardData(user.id)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, user])

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your IoT Dashboard...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-4">IoT Dashboard</h1>
        <p className="text-muted-foreground">Please sign in to view your IoT data.</p>
      </div>
    )
  }

  // Summary Metrics
  const transportCount = data.filter(d => d.module === 'transport').length
  const energyCount = data.filter(d => d.module === 'energy').length
  const recentEntry = data.length > 0 ? new Date(Math.max(...data.map(d => new Date(d.created_at).getTime()))) : null

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">IoT Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time overview of your carbon tracking data.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {recentEntry ? `Last updated ${recentEntry.toLocaleDateString()}` : "No entries yet"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transport Data</CardTitle>
            <Car className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transportCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Virtual logs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energy Data</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{energyCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Virtual logs</p>
          </CardContent>
        </Card>
      </div>

      <IoTCharts data={data} />
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 tracking-tight">Recent Activity</h2>
        <IoTTable data={data} onDataChange={() => fetchDashboardData(user.id)} />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 tracking-tight">Scheduled Jobs</h2>
        <RecurringActivitiesList />
      </div>

    </div>
  )
}
