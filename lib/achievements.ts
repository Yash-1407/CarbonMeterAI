// Achievement system for gamifying carbon tracking
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  points: number
  category: "tracking" | "reduction" | "community" | "streak" | "milestone"
  requirement: {
    type: "activity_count" | "carbon_saved" | "streak_days" | "posts_created" | "goal_achieved"
    value: number
    timeframe?: "daily" | "weekly" | "monthly" | "all_time"
  }
}

export const ACHIEVEMENTS: Achievement[] = [
  // Tracking Achievements
  {
    id: "first_entry",
    name: "Getting Started",
    description: "Log your first carbon footprint activity",
    icon: "🌱",
    points: 10,
    category: "tracking",
    requirement: { type: "activity_count", value: 1 },
  },
  {
    id: "week_tracker",
    name: "Week Warrior",
    description: "Track activities for 7 consecutive days",
    icon: "📅",
    points: 50,
    category: "streak",
    requirement: { type: "streak_days", value: 7 },
  },
  {
    id: "month_tracker",
    name: "Monthly Master",
    description: "Track activities for 30 consecutive days",
    icon: "🗓️",
    points: 200,
    category: "streak",
    requirement: { type: "streak_days", value: 30 },
  },
  {
    id: "hundred_activities",
    name: "Century Club",
    description: "Log 100 carbon footprint activities",
    icon: "💯",
    points: 100,
    category: "milestone",
    requirement: { type: "activity_count", value: 100 },
  },

  // Carbon Reduction Achievements
  {
    id: "first_reduction",
    name: "Carbon Saver",
    description: "Save your first 10kg of CO₂",
    icon: "🌍",
    points: 25,
    category: "reduction",
    requirement: { type: "carbon_saved", value: 10 },
  },
  {
    id: "big_saver",
    name: "Climate Champion",
    description: "Save 100kg of CO₂ equivalent",
    icon: "🏆",
    points: 150,
    category: "reduction",
    requirement: { type: "carbon_saved", value: 100 },
  },
  {
    id: "mega_saver",
    name: "Planet Protector",
    description: "Save 500kg of CO₂ equivalent",
    icon: "🌟",
    points: 500,
    category: "reduction",
    requirement: { type: "carbon_saved", value: 500 },
  },

  // Community Achievements
  {
    id: "first_post",
    name: "Community Voice",
    description: "Create your first community post",
    icon: "💬",
    points: 15,
    category: "community",
    requirement: { type: "posts_created", value: 1 },
  },
  {
    id: "active_member",
    name: "Active Member",
    description: "Create 10 community posts",
    icon: "🗣️",
    points: 75,
    category: "community",
    requirement: { type: "posts_created", value: 10 },
  },

  // Goal Achievements
  {
    id: "goal_achiever",
    name: "Goal Getter",
    description: "Complete your first carbon reduction goal",
    icon: "🎯",
    points: 100,
    category: "milestone",
    requirement: { type: "goal_achieved", value: 1 },
  },
]

export function checkAchievements(
  userStats: {
    activityCount: number
    carbonSaved: number
    streakDays: number
    postsCreated: number
    goalsAchieved: number
  },
  existingAchievements: string[],
): Achievement[] {
  const newAchievements: Achievement[] = []

  for (const achievement of ACHIEVEMENTS) {
    // Skip if user already has this achievement
    if (existingAchievements.includes(achievement.id)) continue

    let earned = false

    switch (achievement.requirement.type) {
      case "activity_count":
        earned = userStats.activityCount >= achievement.requirement.value
        break
      case "carbon_saved":
        earned = userStats.carbonSaved >= achievement.requirement.value
        break
      case "streak_days":
        earned = userStats.streakDays >= achievement.requirement.value
        break
      case "posts_created":
        earned = userStats.postsCreated >= achievement.requirement.value
        break
      case "goal_achieved":
        earned = userStats.goalsAchieved >= achievement.requirement.value
        break
    }

    if (earned) {
      newAchievements.push(achievement)
    }
  }

  return newAchievements
}

export function calculateUserLevel(totalPoints: number): { level: number; pointsToNext: number; levelName: string } {
  const levels = [
    { level: 1, points: 0, name: "Eco Newbie" },
    { level: 2, points: 50, name: "Green Starter" },
    { level: 3, points: 150, name: "Climate Aware" },
    { level: 4, points: 300, name: "Sustainability Seeker" },
    { level: 5, points: 500, name: "Eco Warrior" },
    { level: 6, points: 750, name: "Carbon Crusher" },
    { level: 7, points: 1000, name: "Climate Champion" },
    { level: 8, points: 1500, name: "Planet Protector" },
    { level: 9, points: 2000, name: "Sustainability Master" },
    { level: 10, points: 3000, name: "Eco Legend" },
  ]

  let currentLevel = levels[0]
  let nextLevel = levels[1]

  for (let i = 0; i < levels.length - 1; i++) {
    if (totalPoints >= levels[i].points && totalPoints < levels[i + 1].points) {
      currentLevel = levels[i]
      nextLevel = levels[i + 1]
      break
    } else if (totalPoints >= levels[levels.length - 1].points) {
      currentLevel = levels[levels.length - 1]
      nextLevel = levels[levels.length - 1] // Max level
      break
    }
  }

  const pointsToNext = nextLevel.points - totalPoints

  return {
    level: currentLevel.level,
    pointsToNext: pointsToNext > 0 ? pointsToNext : 0,
    levelName: currentLevel.name,
  }
}
