"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Leaf, Menu, User, X, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export function Navigation() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Carbon Meter</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link href="/dashboard" className="text-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Link href="/calculate" className="text-foreground hover:text-primary transition-colors">
                  Track Carbon
                </Link>
                <Link href="/iot/dashboard" className="text-foreground hover:text-primary transition-colors">
                  IoT Data
                </Link>
                <Link href="/reports" className="text-foreground hover:text-primary transition-colors">
                  Reports
                </Link>
                <Link href="/insights" className="text-foreground hover:text-indigo-600 transition-colors font-medium flex items-center gap-1">
                  <Sparkles className="w-4 h-4" /> AI Insights
                </Link>
                <Link href="/community" className="text-foreground hover:text-primary transition-colors">
                  Community
                </Link>
                <Link href="/game" className="text-foreground hover:text-primary transition-colors">
                  Challenges
                </Link>
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-accent-foreground" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-foreground hover:text-primary transition-colors">
                  Sign In
                </Link>
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link href="/auth/sign-up">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/calculate"
                    className="text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Track Carbon
                  </Link>
                  <Link
                    href="/iot/dashboard"
                    className="text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    IoT Data
                  </Link>
                  <Link
                    href="/reports"
                    className="text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Reports
                  </Link>
                  <Link
                    href="/insights"
                    className="text-foreground hover:text-indigo-600 transition-colors flex items-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Sparkles className="w-4 h-4" /> AI Insights
                  </Link>
                  <Link
                    href="/community"
                    className="text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Community
                  </Link>
                  <Link
                    href="/game"
                    className="text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Challenges
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleSignOut} className="w-fit bg-transparent">
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Button asChild className="bg-primary hover:bg-primary/90 w-fit">
                    <Link href="/auth/sign-up" onClick={() => setIsMenuOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
