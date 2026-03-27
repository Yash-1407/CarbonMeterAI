"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, TrendingUp } from "lucide-react"

interface CommunityStats {
  totalPosts: number
  totalUsers: number
  totalLikes: number
  totalComments: number
}

interface TopContributor {
  user_id: string
  post_count: number
  profiles: {
    username: string
    full_name: string
    avatar_url?: string
  }
}

export function CommunityStats() {
  const [stats, setStats] = useState<CommunityStats>({
    totalPosts: 0,
    totalUsers: 0,
    totalLikes: 0,
    totalComments: 0,
  })
  const [topContributors, setTopContributors] = useState<TopContributor[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total posts
        const { count: postsCount } = await supabase.from("community_posts").select("*", { count: "exact", head: true })

        // Get total users (profiles)
        const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })

        // Get total likes
        const { count: likesCount } = await supabase.from("community_likes").select("*", { count: "exact", head: true })

        // Get total comments
        const { count: commentsCount } = await supabase
          .from("community_comments")
          .select("*", { count: "exact", head: true })

        // Get top contributors
        const { data: contributors } = await supabase
          .from("community_posts")
          .select(
            `
            user_id,
            profiles:user_id (username, full_name, avatar_url)
          `,
          )
          .order("created_at", { ascending: false })

        // Count posts per user
        const contributorMap = new Map<string, { count: number; profile: any }>()
        contributors?.forEach((post) => {
          const userId = post.user_id
          const current = contributorMap.get(userId) || { count: 0, profile: post.profiles }
          contributorMap.set(userId, { count: current.count + 1, profile: post.profiles })
        })

        const topContributorsList = Array.from(contributorMap.entries())
          .map(([user_id, data]) => ({
            user_id,
            post_count: data.count,
            profiles: data.profile,
          }))
          .sort((a, b) => b.post_count - a.post_count)
          .slice(0, 5)

        setStats({
          totalPosts: postsCount || 0,
          totalUsers: usersCount || 0,
          totalLikes: likesCount || 0,
          totalComments: commentsCount || 0,
        })
        setTopContributors(topContributorsList)
      } catch (error) {
        console.error("Error fetching community stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-8 bg-muted rounded w-16 mx-auto mb-2 animate-pulse" />
                  <div className="h-4 bg-muted rounded w-20 mx-auto animate-pulse" />
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
      {/* Community Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Community Overview
          </CardTitle>
          <CardDescription>See how our climate community is growing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalUsers}</div>
              <div className="text-sm text-muted-foreground">Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{stats.totalPosts}</div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{stats.totalLikes}</div>
              <div className="text-sm text-muted-foreground">Likes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{stats.totalComments}</div>
              <div className="text-sm text-muted-foreground">Comments</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Contributors */}
      {topContributors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Top Contributors
            </CardTitle>
            <CardDescription>Community members making the biggest impact</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topContributors.map((contributor, index) => (
                <div key={contributor.user_id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <Avatar>
                      <AvatarImage src={contributor.profiles?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>
                        {(contributor.profiles?.full_name || contributor.profiles?.username || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">
                        {contributor.profiles?.full_name || contributor.profiles?.username}
                      </p>
                      <p className="text-sm text-muted-foreground">{contributor.post_count} posts</p>
                    </div>
                  </div>
                  <Badge variant={index === 0 ? "default" : "secondary"}>
                    {index === 0 ? "🏆 Top" : `#${index + 1}`}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Community Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Community Guidelines</CardTitle>
          <CardDescription>Help us maintain a positive and supportive environment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <p>
                <strong>Be respectful:</strong> Treat all community members with kindness and respect, regardless of
                their current environmental impact level.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <p>
                <strong>Share constructively:</strong> Offer helpful tips, celebrate achievements, and ask thoughtful
                questions.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <p>
                <strong>Stay on topic:</strong> Keep discussions focused on sustainability, climate action, and
                environmental topics.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <p>
                <strong>No spam or self-promotion:</strong> Avoid excessive promotional content or repetitive posts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
