"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import {
  calculateCarbonFootprint,
  getActivityCategories,
  getCategoryDisplayName,
  getUnitForCategory,
  type CarbonActivity,
  EMISSION_FACTORS,
} from "@/lib/carbon-calculations"
import { Car, Zap, UtensilsCrossed, Trash2, ShoppingBag, Leaf } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { calculateNextRun } from "@/lib/utils/recurring"

const ACTIVITY_ICONS = {
  transport: Car,
  energy: Zap,
  food: UtensilsCrossed,
  waste: Trash2,
  other: ShoppingBag,
}

export function CarbonCalculator() {
  const [selectedTab, setSelectedTab] = useState<keyof typeof EMISSION_FACTORS>("transport")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [amount, setAmount] = useState("")
  const [notes, setNotes] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [frequency, setFrequency] = useState("None")
  const [isLoading, setIsLoading] = useState(false)
  const [calculatedFootprint, setCalculatedFootprint] = useState<number | null>(null)

  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCalculatedFootprint(null)
  }

  const handleAmountChange = (value: string) => {
    setAmount(value)
    if (value && selectedCategory) {
      try {
        const activity: CarbonActivity = {
          activity_type: selectedTab,
          category: selectedCategory,
          amount: Number.parseFloat(value),
          unit: getUnitForCategory(selectedTab, selectedCategory),
          date,
          notes,
        }
        const footprint = calculateCarbonFootprint(activity)
        setCalculatedFootprint(footprint)
      } catch (error) {
        setCalculatedFootprint(null)
      }
    } else {
      setCalculatedFootprint(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCategory || !amount) return

    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to save your carbon activity.",
          variant: "destructive",
        })
        return
      }

      const activity: CarbonActivity = {
        activity_type: selectedTab,
        category: selectedCategory,
        amount: Number.parseFloat(amount),
        unit: getUnitForCategory(selectedTab, selectedCategory),
        date,
        notes,
      }

      const carbonFootprint = calculateCarbonFootprint(activity)

      // Save normal entry
      const { data: insertedData, error } = await supabase.from("carbon_activities").insert({
        user_id: user.id,
        activity_type: activity.activity_type,
        category: activity.category,
        amount: activity.amount,
        unit: activity.unit,
        carbon_footprint: carbonFootprint,
        date: activity.date,
        notes: activity.notes,
      }).select().single()

      if (error) throw error

      // Save recurring job if requested
      if (frequency !== "None" && frequency) {
        const nextRun = calculateNextRun(frequency, new Date(activity.date));
        const { error: recurError } = await supabase.from("recurring_activities").insert({
          user_id: user.id,
          source_table: "carbon_activities",
          reference_payload: {
            activity_type: activity.activity_type,
            category: activity.category,
            amount: activity.amount,
            unit: activity.unit,
            carbon_footprint: carbonFootprint,
            notes: activity.notes,
          },
          frequency: frequency,
          next_run_at: nextRun.toISOString(),
          is_active: true
        });

        if (recurError) {
          console.error("Failed to save recurring activity:", recurError);
          toast({
            title: "Warning",
            description: "Activity saved, but failed to create the recurring schedule.",
            variant: "destructive",
          })
        }
      }

      // Reset form
      setSelectedCategory("")
      setAmount("")
      setNotes("")
      setCalculatedFootprint(null)

      // Show success message
      toast({
        title: "Activity Saved Successfully",
        description: "Your carbon activity has been logged.",
      })
      router.refresh() // Silently invalidates Next.js App Router cache
    } catch (error) {
      console.error("Error saving activity:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const categories = getActivityCategories(selectedTab)
  const unit = selectedCategory ? getUnitForCategory(selectedTab, selectedCategory) : ""

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-primary" />
          Carbon Footprint Calculator
        </CardTitle>
        <CardDescription>Track your daily activities and calculate their environmental impact</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Activity Type Tabs */}
          <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as keyof typeof EMISSION_FACTORS)}>
            <TabsList className="grid w-full grid-cols-5">
              {Object.keys(EMISSION_FACTORS).map((type) => {
                const Icon = ACTIVITY_ICONS[type as keyof typeof ACTIVITY_ICONS]
                return (
                  <TabsTrigger key={type} value={type} className="flex items-center gap-1">
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {Object.keys(EMISSION_FACTORS).map((type) => (
              <TabsContent key={type} value={type} className="space-y-4">
                <div className="grid gap-4">
                  {/* Category Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${type} category`} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {getCategoryDisplayName(category)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Amount Input */}
                  {selectedCategory && (
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount ({unit})</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={`Enter amount in ${unit}`}
                        value={amount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {/* Date Input */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select value={frequency} onValueChange={setFrequency}>
                        <SelectTrigger id="frequency">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="None">One-time only</SelectItem>
                          <SelectItem value="Per Day">Daily</SelectItem>
                          <SelectItem value="Per Week">Weekly</SelectItem>
                          <SelectItem value="Per Month">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any additional details..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Carbon Footprint Display */}
          {calculatedFootprint !== null && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estimated Carbon Footprint:</span>
                <span className="text-lg font-bold text-primary">{calculatedFootprint.toFixed(2)} kg CO₂</span>
              </div>
              {calculatedFootprint < 0 && (
                <p className="text-sm text-green-600 mt-1">Great! This activity saves carbon emissions.</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={!selectedCategory || !amount || isLoading}>
            {isLoading ? "Saving..." : "Save Activity"}
          </Button>
          {frequency !== "None" && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              This activity will automatically repeat {frequency.toLowerCase().replace('per ', '')}.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
