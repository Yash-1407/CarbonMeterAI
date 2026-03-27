"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts"

interface IoTData {
  id: string
  module: string
  transport_type: string | null
  energy_type: string | null
  value: number
  unit: string | null
  created_at: string
}

interface IoTChartsProps {
  data: IoTData[]
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

export function IoTCharts({ data }: IoTChartsProps) {
  // Aggregate data for visualization
  const aggregatedData = useMemo(() => {
    let pt = 0;
    let pe = 0;

    const moduleDistribution = { transport: 0, energy: 0 }
    const subTypeDistribution: Record<string, number> = {}

    data.forEach((item) => {
      // Total entries per module (for pie chart counts)
      if (item.module === 'transport') {
        moduleDistribution.transport += 1
        pt += item.value
        
        const type = item.transport_type || 'Unknown Transport'
        subTypeDistribution[type] = (subTypeDistribution[type] || 0) + item.value
      } else if (item.module === 'energy') {
        moduleDistribution.energy += 1
        pe += item.value
        
        const type = item.energy_type || 'Unknown Energy'
        subTypeDistribution[type] = (subTypeDistribution[type] || 0) + item.value
      }
    })

    const pieData = [
      { name: 'Transport', value: moduleDistribution.transport },
      { name: 'Energy', value: moduleDistribution.energy },
    ].filter(d => d.value > 0)

    const barData = Object.entries(subTypeDistribution).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100
    }))

    return { pieData, barData }
  }, [data])

  if (data.length === 0) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="h-64 flex items-center justify-center text-muted-foreground">
          No data available for charts
        </Card>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-4 mb-8">
      {/* Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Module Distribution</CardTitle>
          <CardDescription>Number of records by category</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={aggregatedData.pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {aggregatedData.pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip formatter={(value) => [`${value} Records`, 'Count']} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Consumption Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Total Consumption by Type</CardTitle>
          <CardDescription>Aggregated values based on input units</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={aggregatedData.barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} tickMargin={10} />
              <YAxis tick={{ fontSize: 12 }} />
              <RechartsTooltip 
                cursor={{ fill: 'var(--muted)', opacity: 0.1 }} 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {aggregatedData.barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
