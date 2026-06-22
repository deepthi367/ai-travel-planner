import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">T</span>
            </div>
            <span className="text-2xl font-bold text-foreground">TravelAI</span>
          </div>
          <nav className="flex items-center gap-6">
            {user ? (
              <>
                <Link href="/dashboard" className="text-foreground hover:text-primary transition">
                  Dashboard
                </Link>
                <form action="/auth/logout" method="POST">
                  <Button variant="outline" type="submit" size="sm">
                    Sign Out
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-foreground hover:text-primary transition">
                  Sign In
                </Link>
                <Link href="/auth/sign-up">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </nav>
        </header>

        <main className="max-w-4xl mx-auto text-center mb-20">
          <div className="mb-8 space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
              Plan Your Perfect Trip with AI
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create personalized itineraries, manage budgets, and discover hidden gems with Gemini-powered planning.
            </p>
          </div>

          <div className="flex gap-4 justify-center mb-16 flex-wrap">
            {user ? (
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  Open Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/sign-up">
                  <Button size="lg">Start Planning</Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition">
              <div className="text-3xl mb-3 font-semibold text-primary">AI</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">AI Itineraries</h3>
              <p className="text-muted-foreground">
                Get personalized day-by-day plans tailored to your preferences.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition">
              <div className="text-3xl mb-3 font-semibold text-primary">$</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Budget Tracking</h3>
              <p className="text-muted-foreground">
                Stay on budget with smart cost estimation and tracking.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition">
              <div className="text-3xl mb-3 font-semibold text-primary">Map</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Save & Organize</h3>
              <p className="text-muted-foreground">
                Save attractions, restaurants, and hotels for later.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
