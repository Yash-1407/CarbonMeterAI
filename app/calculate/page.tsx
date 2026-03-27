import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { CarbonCalculator } from "@/components/carbon-calculator"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Cpu } from "lucide-react"

export default async function CalculatePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Track Your Carbon Footprint</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Log your daily activities to understand and reduce your environmental impact. Every small action counts
            towards a more sustainable future.
          </p>
          <Link href="/iot">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-semibold">
              <Cpu className="w-5 h-5" />
              ADD IOT
            </Button>
          </Link>
        </div>

        <CarbonCalculator />
      </div>
    </div>
  )
}
