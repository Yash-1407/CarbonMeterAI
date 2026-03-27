"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ACHIEVEMENTS, checkAchievements, calculateUserLevel, type Achievement } from "@/lib/achievements"
import { Trophy, Star, Target, Users, Calendar, Award } from "lucide-react"

interface UserAchievement {
  id: string
  achievement_type: string
  achievement_name: string
  description: string
  points: number
  earned_at: string
}

const CATEGORY_ICONS = {
  tracking: Calendar,
  reduction: Target,
  community: Users,
  streak: Star,
  milestone: Trophy,
}

export function AchievementsDisplay() {
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])
  const [userStats, setUserStats] = useState({
    activityCount: 0,
    carbonSaved: 0,
    streakDays: 0,
    postsCreated: 0,
    goalsAchieved: 0,
    totalPoints: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([])

  const supabase = createClient()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        // Get user achievements
        const { data: achievements, error: achievementsError } = await supabase
          .from("game_achievements")
          .select("*")
          .eq("user_id", user.id)
          .order("earned_at", { ascending: false })

        if (achievementsError) {
          console.error("Missing game_achievements table or error:", achievementsError);
          // Don't attempt to process or award anything if the table doesn't exist
          setIsLoading(false);
          return;
        }

        // Get user activities for stats
        const { data: activities } = await supabase
          .from("carbon_activities")
          .select("carbon_footprint, date")
          .eq("user_id", user.id)
          .order("date", { ascending: false })

        // Get user posts
        const { data: posts } = await supabase.from("community_posts").select("id").eq("user_id", user.id)

        // Get user goals
        const { data: goals } = await supabase
          .from("carbon_goals")
          .select("status")
          .eq("user_id", user.id)
          .eq("status", "completed")

        // Calculate stats
        const activityCount = activities?.length || 0
        const carbonSaved = Math.max(0, -(activities?.reduce((sum, a) => sum + a.carbon_footprint, 0) || 0)) // Negative footprint = saved
        const postsCreated = posts?.length || 0
        const goalsAchieved = goals?.length || 0

        // Calculate streak
        const streakDays = calculateStreak(activities || [])

        // Calculate total points
        const totalPoints = achievements?.reduce((sum, a) => sum + a.points, 0) || 0

        const stats = {
          activityCount,
          carbonSaved,
          streakDays,
          postsCreated,
          goalsAchieved,
          totalPoints,
        }

        setUserAchievements(achievements || [])
        setUserStats(stats)

        // Check for new achievements
        const existingAchievementIds = achievements?.map((a) => a.achievement_type) || []
        const newAchievements = checkAchievements(stats, existingAchievementIds)

        if (newAchievements.length > 0) {
          setNewAchievements(newAchievements)
          // Award new achievements
          await awardAchievements(user.id, newAchievements)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [supabase])

  const awardAchievements = async (userId: string, achievements: Achievement[]) => {
    try {
      const achievementRecords = achievements.map((achievement) => ({
        user_id: userId,
        achievement_type: achievement.id,
        achievement_name: achievement.name,
        description: achievement.description,
        points: achievement.points,
      }))

      const { error: insertError } = await supabase.from("game_achievements").insert(achievementRecords)
      if (insertError) throw new Error("Failed to insert achievements: " + insertError.message)

      // Update leaderboard
      const newTotalPoints = userStats.totalPoints + achievements.reduce((sum, a) => sum + a.points, 0)
      const { error: lbError } = await supabase
        .from("leaderboard")
        .upsert({
          user_id: userId,
          total_points: newTotalPoints,
          carbon_saved: userStats.carbonSaved,
          streak_days: userStats.streakDays,
        })
        .eq("user_id", userId)

      if (lbError) throw new Error("Failed to update leaderboard: " + lbError.message)

      // Refresh data
      window.location.reload()
    } catch (error) {
      console.error("Error awarding achievements:", error)
    }
  }

  const userLevel = calculateUserLevel(userStats.totalPoints)
  const progressToNext = userLevel.pointsToNext > 0 ? ((userStats.totalPoints % 100) / 100) * 100 : 100

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
              <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* New Achievements Notification */}
      {newAchievements.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Award className="w-5 h-5" />
              New Achievement{newAchievements.length > 1 ? "s" : ""} Unlocked!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {newAchievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-2 bg-white rounded-md">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <p className="font-semibold text-yellow-800">{achievement.name}</p>
                    <p className="text-sm text-yellow-600">{achievement.description}</p>
                  </div>
                  <Badge className="ml-auto bg-yellow-200 text-yellow-800">+{achievement.points} pts</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Level and Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Level {userLevel.level} - {userLevel.levelName}
          </CardTitle>
          <CardDescription>
            {userStats.totalPoints} total points
            {userLevel.pointsToNext > 0 && ` • ${userLevel.pointsToNext} points to next level`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressToNext} className="h-3" />
        </CardContent>
      </Card>

      {/* Achievement Categories */}
      <div className="grid md:grid-cols-2 gap-6">
        {Object.entries(CATEGORY_ICONS).map(([category, Icon]) => {
          const categoryAchievements = ACHIEVEMENTS.filter((a) => a.category === category)
          const earnedInCategory = userAchievements.filter((ua) =>
            categoryAchievements.some((ca) => ca.id === ua.achievement_type),
          )

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  <Icon className="w-5 h-5 text-primary" />
                  {category} Achievements
                </CardTitle>
                <CardDescription>
                  {earnedInCategory.length} of {categoryAchievements.length} earned
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryAchievements.map((achievement) => {
                    const isEarned = userAchievements.some((ua) => ua.achievement_type === achievement.id)
                    const earnedAchievement = userAchievements.find((ua) => ua.achievement_type === achievement.id)

                    return (
                      <div
                        key={achievement.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          isEarned ? "bg-green-50 border-green-200" : "bg-muted/30 border-border"
                        }`}
                      >
                        <span className={`text-2xl ${isEarned ? "" : "grayscale opacity-50"}`}>{achievement.icon}</span>
                        <div className="flex-1">
                          <p className={`font-medium ${isEarned ? "text-green-800" : "text-muted-foreground"}`}>
                            {achievement.name}
                          </p>
                          <p className={`text-sm ${isEarned ? "text-green-600" : "text-muted-foreground"}`}>
                            {achievement.description}
                          </p>
                          {earnedAchievement && (
                            <p className="text-xs text-green-500 mt-1">
                              Earned {new Date(earnedAchievement.earned_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Badge variant={isEarned ? "default" : "secondary"}>{achievement.points} pts</Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
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
