"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, MessageCircle, Share2, Plus, Filter, TrendingUp, HelpCircle, Lightbulb, Sparkles } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Post {
  id: string
  title: string
  content: string
  post_type: string
  likes_count: number
  comments_count: number
  created_at: string
  updated_at: string
  user_id: string
  profiles: {
    username: string
    full_name: string
    avatar_url?: string
  }
  user_liked?: boolean
}

interface NewPost {
  title: string
  content: string
  post_type: string
}

const POST_TYPES = {
  general: { label: "General", icon: MessageCircle, color: "bg-blue-100 text-blue-800" },
  tip: { label: "Eco Tip", icon: Lightbulb, color: "bg-green-100 text-green-800" },
  achievement: { label: "Achievement", icon: TrendingUp, color: "bg-purple-100 text-purple-800" },
  question: { label: "Question", icon: HelpCircle, color: "bg-orange-100 text-orange-800" },
}

export function CommunityFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewPost, setShowNewPost] = useState(false)
  const [newPost, setNewPost] = useState<NewPost>({ title: "", content: "", post_type: "general" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filter, setFilter] = useState("all")
  const [currentUser, setCurrentUser] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      console.log("[v0] Current user:", user?.id)
      setCurrentUser(user)

      if (user) {
        await ensureUserProfile(user)
      }
    }

    getUser()
    fetchPosts()
  }, [supabase, filter])

  const ensureUserProfile = async (user: any) => {
    try {
      const { data: existingProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (!existingProfile) {
        console.log("[v0] Creating user profile for:", user.id)
        const { error } = await supabase.from("profiles").insert({
          id: user.id,
          username: user.email?.split("@")[0] || "user",
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Anonymous User",
          avatar_url: user.user_metadata?.avatar_url || null,
        })

        if (error) {
          console.error("[v0] Error creating profile:", error)
        } else {
          console.log("[v0] Profile created successfully")
        }
      }
    } catch (error) {
      console.error("[v0] Error checking/creating profile:", error)
    }
  }

  const fetchPosts = async () => {
    try {
      console.log("[v0] Fetching posts with filter:", filter)
      let query = supabase.from("community_posts").select("*").order("created_at", { ascending: false })

      if (filter !== "all") {
        query = query.eq("post_type", filter)
      }

      const { data: postsData, error: postsError } = await query

      if (postsError) {
        console.error("[v0] Error fetching posts:", postsError)
        throw postsError
      }

      console.log("[v0] Fetched posts:", postsData?.length || 0, postsData)

      let postsWithProfiles = []
      if (postsData && postsData.length > 0) {
        const userIds = [...new Set(postsData.map((post) => post.user_id))]

        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .in("id", userIds)

        if (profilesError) {
          console.error("[v0] Error fetching profiles:", profilesError)
        }

        const profilesMap = new Map()
        profilesData?.forEach((profile) => {
          profilesMap.set(profile.id, profile)
        })

        postsWithProfiles = postsData.map((post) => ({
          ...post,
          profiles: profilesMap.get(post.user_id) || {
            username: "Unknown User",
            full_name: "Unknown User",
            avatar_url: null,
          },
        }))
      }

      if (currentUser && postsWithProfiles.length) {
        const postIds = postsWithProfiles.map((post) => post.id)
        const { data: likes } = await supabase
          .from("community_likes")
          .select("post_id")
          .eq("user_id", currentUser.id)
          .in("post_id", postIds)

        const likedPostIds = new Set(likes?.map((like) => like.post_id))

        const postsWithLikes = postsWithProfiles.map((post) => ({
          ...post,
          user_liked: likedPostIds.has(post.id),
        }))

        setPosts(postsWithLikes)
      } else {
        setPosts(postsWithProfiles || [])
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || !newPost.title.trim() || !newPost.content.trim()) {
      console.log("[v0] Cannot submit post - missing data:", {
        hasUser: !!currentUser,
        hasTitle: !!newPost.title.trim(),
        hasContent: !!newPost.content.trim(),
      })
      alert("Please fill in all fields and make sure you're logged in.")
      return
    }

    setIsSubmitting(true)

    try {
      console.log("[v0] Creating post:", newPost, "User ID:", currentUser.id)

      await ensureUserProfile(currentUser)

      const postData = {
        user_id: currentUser.id,
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        post_type: newPost.post_type,
        likes_count: 0,
        comments_count: 0,
      }

      console.log("[v0] Inserting post data:", postData)

      const { data, error } = await supabase.from("community_posts").insert(postData).select("*")

      if (error) {
        console.error("[v0] Detailed error creating post:", {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        })
        throw error
      }

      console.log("[v0] Post created successfully:", data)

      setNewPost({ title: "", content: "", post_type: "general" })
      setShowNewPost(false)

      if (data && data[0]) {
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("username, full_name, avatar_url")
          .eq("id", currentUser.id)
          .single()

        const newPostWithProfile = {
          ...data[0],
          profiles: userProfile || {
            username: currentUser.email?.split("@")[0] || "user",
            full_name: currentUser.email?.split("@")[0] || "Anonymous User",
            avatar_url: null,
          },
          user_liked: false,
        }
        setPosts((prevPosts) => [newPostWithProfile, ...prevPosts])
      }

      alert("Post created successfully!")
    } catch (error: any) {
      console.error("[v0] Error creating post:", error)

      let errorMessage = "Failed to create post. "
      if (error.code === "42501") {
        errorMessage += "Permission denied. Please make sure you're logged in."
      } else if (error.code === "23503") {
        errorMessage += "User profile not found. Please try logging out and back in."
      } else if (error.message) {
        errorMessage += error.message
      } else {
        errorMessage += "Please try again."
      }

      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!currentUser) return

    try {
      if (isLiked) {
        await supabase.from("community_likes").delete().eq("post_id", postId).eq("user_id", currentUser.id)
      } else {
        await supabase.from("community_likes").insert({
          post_id: postId,
          user_id: currentUser.id,
        })
      }

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1,
                user_liked: !isLiked,
              }
            : post,
        ),
      )
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-1/6 animate-pulse" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {process.env.NODE_ENV === "development" && (
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          Debug: User ID: {currentUser?.id || "Not logged in"} | Posts: {posts.length}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative">
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse-glow"></div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Community Hub
          </h2>
          <p className="text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-secondary" />
            Connect with fellow climate champions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40 border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <Filter className="w-4 h-4 mr-2 text-primary" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Posts</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="tip">Eco Tips</SelectItem>
              <SelectItem value="achievement">Achievements</SelectItem>
              <SelectItem value="question">Questions</SelectItem>
            </SelectContent>
          </Select>
          {currentUser && (
            <Button
              onClick={() => setShowNewPost(!showNewPost)}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              New Post
            </Button>
          )}
        </div>
      </div>

      {showNewPost && currentUser && (
        <Card className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Create New Post
            </CardTitle>
            <CardDescription>Share your thoughts, tips, or achievements with the community</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmitPost} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Post title..."
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                    required
                  />
                </div>
                <Select
                  value={newPost.post_type}
                  onValueChange={(value) => setNewPost({ ...newPost, post_type: value })}
                >
                  <SelectTrigger className="w-40 border-2 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(POST_TYPES).map(([key, type]) => (
                      <SelectItem key={key} value={key}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                placeholder="What's on your mind? Share your eco-friendly tips, achievements, or ask questions..."
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                rows={4}
                className="border-2 border-border focus:border-primary transition-all duration-200"
                required
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowNewPost(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !newPost.title.trim() || !newPost.content.trim()}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                >
                  {isSubmitting ? "Posting..." : "Post"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {posts.length === 0 && !isLoading ? (
        <Card className="border-2 border-dashed border-primary/30">
          <CardContent className="text-center py-12">
            <div className="animate-float">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-primary/50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground mb-4">Be the first to share something with the community!</p>
            {currentUser ? (
              <Button
                onClick={() => setShowNewPost(true)}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              >
                Create First Post
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">Please log in to create posts</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => {
            const postType = POST_TYPES[post.post_type as keyof typeof POST_TYPES] || POST_TYPES.general
            const PostIcon = postType.icon

            return (
              <Card
                key={post.id}
                className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/30 hover:border-l-primary"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="ring-2 ring-primary/20">
                        <AvatarImage src={post.profiles?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white">
                          {(post.profiles?.full_name || post.profiles?.username || "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">
                            {post.profiles?.full_name || post.profiles?.username || "Anonymous User"}
                          </p>
                          <Badge className={`${postType.color} border-0`}>
                            <PostIcon className="w-3 h-3 mr-1" />
                            {postType.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap mb-4">{post.content}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id, post.user_liked || false)}
                        className={`flex items-center gap-2 hover:bg-red-50 transition-colors ${
                          post.user_liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                        }`}
                        disabled={!currentUser}
                      >
                        <Heart className={`w-4 h-4 ${post.user_liked ? "fill-current" : ""}`} />
                        {post.likes_count || 0}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {post.comments_count || 0}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 text-muted-foreground hover:text-secondary"
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
