import { InsightsDashboard } from "@/components/ai/insights-dashboard"
import { Navigation } from "@/components/navigation"

export const metadata = {
  title: "AI Insights | CarbonMeter",
  description: "AI-powered personalized sustainability insights and footprint analysis.",
}

export default function InsightsPage() {
  return (
    <>
      <Navigation />
      <div className="container mx-auto py-8 lg:py-12 px-4 max-w-6xl">
        <InsightsDashboard />
      </div>
    </>
  )
}
