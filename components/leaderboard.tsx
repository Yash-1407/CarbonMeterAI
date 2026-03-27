"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, TrendingDown, Calendar, Crown } from "lucide-react"
import { calculateUserLevel } from "@/lib/achievements"

interface LeaderboardEntry {
  user_id: string
  total_points: number
  carbon_saved: number
  streak_days: number
  rank_position?: number
  profiles: {
    username: string
    full_name: string
    avatar_url?: string
  }
}

export function Leaderboard() {
  const [pointsLeaderboard, setPointsLeaderboard] = useState<LeaderboardEntry[]>([])
  const [carbonLeaderboard, setCarbonLeaderboard] = useState<LeaderboardEntry[]>([])
  const [streakLeaderboard, setStreakLeaderboard] = useState<LeaderboardEntry[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userRankings, setUserRankings] = useState({
    points: 0,
    carbon: 0,
    streak: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setCurrentUser(user)

        // Get leaderboard data with profiles
        const { data: leaderboardData } = await supabase
          .from("leaderboard")
          .select(
            `
            *,
            profiles:user_id (username, full_name, avatar_url)
          `,
          )
          .order("total_points", { ascending: false })

        if (!leaderboardData) return

        // Sort by different criteria
        const pointsSorted = [...leaderboardData]
          .sort((a, b) => b.total_points - a.total_points)
          .map((entry, index) => ({ ...entry, rank_position: index + 1 }))

        const carbonSorted = [...leaderboardData]
          .sort((a, b) => b.carbon_saved - a.carbon_saved)
          .map((entry, index) => ({ ...entry, rank_position: index + 1 }))

        const streakSorted = [...leaderboardData]
          .sort((a, b) => b.streak_days - a.streak_days)
          .map((entry, index) => ({ ...entry, rank_position: index + 1 }))

        setPointsLeaderboard(pointsSorted.slice(0, 10))
        setCarbonLeaderboard(carbonSorted.slice(0, 10))
        setStreakLeaderboard(streakSorted.slice(0, 10))

        // Find current user rankings
        if (user) {
          const userPointsRank = pointsSorted.findIndex((entry) => entry.user_id === user.id) + 1
          const userCarbonRank = carbonSorted.findIndex((entry) => entry.user_id === user.id) + 1
          const userStreakRank = streakSorted.findIndex((entry) => entry.user_id === user.id) + 1

          setUserRankings({
            points: userPointsRank,
            carbon: userCarbonRank,
            streak: userStreakRank,
          })
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [supabase])

  const renderLeaderboardEntry = (entry: LeaderboardEntry, index: number, type: "points" | "carbon" | "streak") => {
    const isCurrentUser = currentUser && entry.user_id === currentUser.id
    const userLevel = calculateUserLevel(entry.total_points)

    let primaryValue: string
    let secondaryValue: string

    switch (type) {
      case "points":
        primaryValue = `${entry.total_points} pts`
        secondaryValue = `Level ${userLevel.level}`
        break
      case "carbon":
        primaryValue = `${entry.carbon_saved.toFixed(1)} kg`
        secondaryValue = "CO₂ saved"
        break
      case "streak":
        primaryValue = `${entry.streak_days} days`
        secondaryValue = "streak"
        break
    }

    return (
      <div
        key={entry.user_id}
        className={`flex items-center space-x-4 p-4 rounded-lg ${
          isCurrentUser ? "bg-primary/10 border border-primary/20" : "bg-muted/30"
        }`}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
          {index === 0 ? <Crown className="w-4 h-4" /> : index + 1}
        </div>
        <Avatar>
          <AvatarImage src={entry.profiles?.avatar_url || "/placeholder.svg"} />
          <AvatarFallback>
            {(entry.profiles?.full_name || entry.profiles?.username || "U").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-foreground">{entry.profiles?.full_name || entry.profiles?.username}</p>
            {isCurrentUser && <Badge variant="outline">You</Badge>}
            {index < 3 && (
              <Badge className={index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-orange-600"}>
                {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{secondaryValue}</p>
        </div>
        <div className="text-right">
          <div className="font-bold text-primary">{primaryValue}</div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
                  <div className="w-8 h-8 bg-muted rounded-full" />
                  <div className="w-10 h-10 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                  <div className="h-6 bg-muted rounded w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Rankings Summary */}
      {currentUser && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                Points Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">#{userRankings.points || "N/A"}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-green-500" />
                Carbon Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">#{userRankings.carbon || "N/A"}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                Streak Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">#{userRankings.streak || "N/A"}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leaderboard Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Leaderboard
          </CardTitle>
          <CardDescription>See how you rank against other climate champions</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="points" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="points">Points</TabsTrigger>
              <TabsTrigger value="carbon">Carbon Saved</TabsTrigger>
              <TabsTrigger value="streak">Streak</TabsTrigger>
            </TabsList>

            <TabsContent value="points" className="space-y-4">
              {pointsLeaderboard.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No rankings available yet</p>
                </div>
              ) : (
                pointsLeaderboard.map((entry, index) => renderLeaderboardEntry(entry, index, "points"))
              )}
            </TabsContent>

            <TabsContent value="carbon" className="space-y-4">
              {carbonLeaderboard.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingDown className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No carbon savings data yet</p>
                </div>
              ) : (
                carbonLeaderboard.map((entry, index) => renderLeaderboardEntry(entry, index, "carbon"))
              )}
            </TabsContent>

            <TabsContent value="streak" className="space-y-4">
              {streakLeaderboard.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No streak data yet</p>
                </div>
              ) : (
                streakLeaderboard.map((entry, index) => renderLeaderboardEntry(entry, index, "streak"))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
