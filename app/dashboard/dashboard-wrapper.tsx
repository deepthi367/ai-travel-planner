'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import TripList from '@/components/dashboard/trip-list'

interface DashboardWrapperProps {
  user: any
  trips: any[]
}

export default function DashboardWrapper({ user, trips }: DashboardWrapperProps) {
  const router = useRouter()
  const [displayTrips, setDisplayTrips] = useState(trips)

  useEffect(() => {
    setDisplayTrips(trips)

    if (!user) {
      router.push('/auth/login')
    }
  }, [user, trips, router])

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-12">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">T</span>
              </div>
              <span className="text-2xl font-bold text-foreground">TravelAI</span>
            </Link>
            <h1 className="text-4xl font-bold text-foreground">My Trips</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/trips/new">
              <Button size="lg" className="gap-2">
                + New Trip
              </Button>
            </Link>
            <form action="/auth/logout" method="POST">
              <Button variant="outline" type="submit" size="sm">
                Sign Out
              </Button>
            </form>
          </nav>
        </header>

        <main>
          <TripList trips={displayTrips || []} />
        </main>
      </div>
    </div>
  )
}

