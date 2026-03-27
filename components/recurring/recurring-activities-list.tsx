"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, StopCircle, RefreshCw, CalendarClock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface RecurringActivity {
  id: string
  source_table: string
  frequency: string
  next_run_at: string
  is_active: boolean
  reference_payload: any
}

export function RecurringActivitiesList() {
  const [activities, setActivities] = useState<RecurringActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [stoppingId, setStoppingId] = useState<string | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  const fetchActivities = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('recurring_activities')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('next_run_at', { ascending: true })

    if (error) {
      console.error("Failed to fetch recurring activities:", error)
    } else {
      setActivities(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  const handleStop = async (id: string) => {
    setStoppingId(id)
    const { error } = await supabase
      .from('recurring_activities')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to stop recurring activity.",
        variant: "destructive"
      })
    } else {
      setActivities(activities.filter(a => a.id !== id))
      toast({
        title: "Activity Stopped",
        description: "The recurring activity has been cancelled."
      })
    }
    setStoppingId(null)
  }

  const formatPayloadInfo = (payload: any, source: string) => {
    if (source === 'iot_data') {
      return `${payload.module} - ${payload.transport_type || payload.energy_type || 'Unknown'} (${payload.value} ${payload.unit})`
    } else if (source === 'carbon_activities') {
      return `${payload.activity_type} - ${payload.category} (${payload.amount} ${payload.unit})`
    }
    return 'Unknown Activity'
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-primary" />
            Active Recurring Activities
          </CardTitle>
          <CardDescription>Manage your automated background data entries.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={fetchActivities}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground bg-muted/50 rounded-lg">
            No active recurring activities found.
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Next Run</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">
                      {activity.source_table === 'iot_data' ? 'Virtual IoT' : 'Carbon Calculator'}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={formatPayloadInfo(activity.reference_payload, activity.source_table)}>
                      {formatPayloadInfo(activity.reference_payload, activity.source_table)}
                    </TableCell>
                    <TableCell>{activity.frequency}</TableCell>
                    <TableCell>{new Date(activity.next_run_at).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleStop(activity.id)}
                        disabled={stoppingId === activity.id}
                      >
                        {stoppingId === activity.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <StopCircle className="w-4 h-4 mr-2" />
                            Stop
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
