import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { RecentActivities } from "@/components/recent-activities"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Calculator, Leaf, Target, TrendingDown, Users } from "lucide-react"
import Link from "next/link"
import AvatarWidget from "@/components/AvatarWidget"
import { CarbonPrediction } from "@/components/CarbonPrediction"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get user's carbon activities for stats
  const { data: activities } = await supabase
    .from("carbon_activities")
    .select("carbon_footprint, date")
    .eq("user_id", user.id)
    .order("date", { ascending: false })

  // Calculate stats
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const thisWeekActivities = activities?.filter((a) => new Date(a.date) >= weekAgo) || []
  const thisMonthActivities = activities?.filter((a) => new Date(a.date) >= monthAgo) || []

  const weeklyFootprint = thisWeekActivities.reduce((sum, a) => sum + a.carbon_footprint, 0)
  const monthlyFootprint = thisMonthActivities.reduce((sum, a) => sum + a.carbon_footprint, 0)

  // Calculate streak (consecutive days with activities)
  const streak = calculateStreak(activities || [])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {profile?.full_name || profile?.username || "there"}!
            </h1>
            <p className="text-muted-foreground">Here's your carbon footprint overview</p>
          </div>
          <div className="w-full md:w-80 shrink-0">
            <AvatarWidget />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{weeklyFootprint.toFixed(1)} kg</div>
              <p className="text-xs text-muted-foreground">CO₂ equivalent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{monthlyFootprint.toFixed(1)} kg</div>
              <p className="text-xs text-muted-foreground">CO₂ equivalent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activities</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{activities?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Total logged</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <Leaf className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{streak} days</div>
              <p className="text-xs text-muted-foreground">Keep it up!</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                Track New Activity
              </CardTitle>
              <CardDescription>Log your daily carbon-producing activities</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/calculate">Add Activity</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-accent" />
                View Reports
              </CardTitle>
              <CardDescription>Analyze your carbon footprint trends</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/reports">View Reports</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Community
              </CardTitle>
              <CardDescription>Connect with other climate champions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/community">Join Discussion</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <RecentActivities />
        
        {/* Carbon Prediction */}
        <CarbonPrediction />
      </div>
    </div>
  )
}

function calculateStreak(activities: { date: string }[]): number {
  if (!activities.length) return 0

  const dates = [...new Set(activities.map((a) => a.date))].sort().reverse()
  let streak = 0
  const today = new Date().toISOString().split("T")[0]

  for (let i = 0; i < dates.length; i++) {
    const expectedDate = new Date()
    expectedDate.setDate(expectedDate.getDate() - i)
    const expectedDateStr = expectedDate.toISOString().split("T")[0]

    if (dates[i] === expectedDateStr) {
      streak++
    } else {
      break
    }
  }

  return streak
}
