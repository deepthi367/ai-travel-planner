'use client'

import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface Trip {
  id: string
  title: string
  destination: string
  description: string | null
  start_date: string | null
  end_date: string | null
  budget: number | null
  created_at: string
}

export default function TripList({ trips }: { trips: Trip[] }) {
  if (trips.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-muted-foreground mb-4">No trips yet. Create your first trip to get started!</p>
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <span>👉</span>
          <span>Use the button above to create a new trip</span>
        </div>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {trips.map((trip) => (
        <Link key={trip.id} href={`/trip/${trip.id}`}>
          <div className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition cursor-pointer h-full flex flex-col">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-foreground mb-2">{trip.title}</h3>
              <p className="text-primary font-medium">{trip.destination}</p>
            </div>

            {trip.description && (
              <p className="text-muted-foreground text-sm mb-4 flex-1">{trip.description}</p>
            )}

            <div className="space-y-2 text-sm">
              {trip.start_date && (
                <div className="text-muted-foreground">
                  <span className="font-medium">📅 </span>
                  {formatDate(trip.start_date)}
                  {trip.end_date && ` - ${formatDate(trip.end_date)}`}
                </div>
              )}
              {trip.budget && (
                <div className="text-muted-foreground">
                  <span className="font-medium">💰 </span>
                  Budget: ${trip.budget.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
