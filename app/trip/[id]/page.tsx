'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ItineraryGenerator from '@/components/trip/itinerary-generator'
import ItineraryDisplay from '@/components/trip/itinerary-display'
import { formatDate } from '@/lib/utils'

interface Trip {
  id: string
  title: string
  destination: string
  description?: string | null
  start_date?: string | null
  end_date?: string | null
  budget?: number | null
  created_at: string
}

interface Itinerary {
  id: string
  trip_id: string
  day_number: number
  activities: any | null
  notes: string | null
}

export default function TripPage() {
  const params = useParams() as { id: string }
  const tripId = params?.id

  const [trip, setTrip] = useState<Trip | null>(null)
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadTrip = useCallback(async () => {
    if (!tripId) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/trips/${tripId}`)
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || 'We could not load this trip right now.')
      }

      setTrip(data.trip)
      setItineraries(data.itinerary || [])
    } catch (err) {
      console.error('Error loading trip:', err)
      setError(err instanceof Error ? err.message : 'We could not load this trip right now.')
      setTrip(null)
      setItineraries([])
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    loadTrip()
  }, [loadTrip])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading trip...</p>
        </div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <p className="text-muted-foreground mb-4">{error || 'Trip not found'}</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/dashboard" className="text-primary hover:text-primary/80 font-medium flex items-center gap-2">
              Back to Trips
            </Link>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                Print
              </Button>
              <Link href={`/trip/${tripId}/edit`}>
                <Button variant="outline" size="sm">Edit</Button>
              </Link>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <h1 className="text-4xl font-bold text-foreground">{trip.title}</h1>
            <p className="text-xl text-primary font-medium">{trip.destination}</p>
            {trip.description && (
              <p className="text-muted-foreground">{trip.description}</p>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {trip.start_date && (
              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="text-sm text-muted-foreground font-medium mb-1">Duration</div>
                <div className="text-foreground">
                  {formatDate(trip.start_date)}
                  {trip.end_date && ` - ${formatDate(trip.end_date)}`}
                </div>
              </div>
            )}
            {trip.budget && (
              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="text-sm text-muted-foreground font-medium mb-1">Budget</div>
                <div className="text-foreground font-semibold">${trip.budget.toLocaleString()}</div>
              </div>
            )}
            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="text-sm text-muted-foreground font-medium mb-1">Itinerary</div>
              <div className="text-foreground font-semibold">{itineraries.length} days</div>
            </div>
          </div>
        </header>

        <main className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {itineraries.length > 0 ? (
              <div className="space-y-6">
                {itineraries.map((itinerary) => (
                  <ItineraryDisplay key={itinerary.id} itinerary={itinerary} tripId={tripId} onDeleted={loadTrip} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-lg border border-dashed border-border">
                <p className="text-muted-foreground mb-4">No itinerary yet. Use the AI generator to create one.</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <ItineraryGenerator
              tripId={tripId}
              destination={trip.destination}
              startDate={trip.start_date || null}
              endDate={trip.end_date || null}
              budget={trip.budget || null}
              description={trip.description || null}
              onUpdate={loadTrip}
            />
          </div>
        </main>
      </div>
    </div>
  )
}


