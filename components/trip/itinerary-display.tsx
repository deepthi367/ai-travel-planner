'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Activity {
  time: string
  activity: string
  description: string
  cost: string
  location: string
}

interface Itinerary {
  id: string
  trip_id: string
  day_number: number
  activities: Activity[] | null
  notes: string | null
}

interface ItineraryDisplayProps {
  itinerary: Itinerary
  tripId: string
  onDeleted?: () => void
}

export default function ItineraryDisplay({ itinerary, tripId, onDeleted }: ItineraryDisplayProps) {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Delete this day from the itinerary?')) return

    setDeleting(true)
    try {
      const supabase = createClient()
      await supabase.from('itineraries').delete().eq('id', itinerary.id).eq('trip_id', tripId)
      onDeleted?.()
    } catch (error) {
      console.error('Error deleting itinerary:', error)
    } finally {
      setDeleting(false)
    }
  }

  const activities = (itinerary.activities as Activity[]) || []
  const dayTitle = itinerary.notes?.split('\n')[0] || `Day ${itinerary.day_number}`
  const mealInfo = itinerary.notes?.split('Meals:')[1]?.split('Accommodation:')[0]?.trim()

  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-2xl font-semibold text-foreground mb-2">
            Day {itinerary.day_number}: {dayTitle}
          </h3>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            {expanded ? 'Hide details' : 'Show details'}
          </button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
          className="text-destructive hover:text-destructive"
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>

      {!expanded && activities.length > 0 && (
        <div className="space-y-2 mt-4">
          {activities.slice(0, 2).map((activity, idx) => (
            <div key={idx} className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{activity.time}</span> - {activity.activity}
            </div>
          ))}
          {activities.length > 2 && (
            <div className="text-sm text-muted-foreground italic">+{activities.length - 2} more activities</div>
          )}
        </div>
      )}

      {expanded && (
        <div className="mt-6 space-y-6">
          {activities.length > 0 && (
            <div>
              <h4 className="font-semibold text-foreground mb-4">Activities & Attractions</h4>
              <div className="space-y-4">
                {activities.map((activity, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                    <div className="flex items-start justify-between mb-2 gap-4">
                      <div>
                        <div className="font-medium text-foreground">{activity.activity}</div>
                        <div className="text-sm text-muted-foreground">{activity.location}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-semibold text-foreground">{activity.time}</div>
                        <div className="text-sm text-primary font-medium">{activity.cost}</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mealInfo && (
            <div>
              <h4 className="font-semibold text-foreground mb-3">Dining</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                {mealInfo.split('\n').map((meal, idx) => (
                  <div key={idx}>{meal}</div>
                ))}
              </div>
            </div>
          )}

          {itinerary.notes && (
            <div>
              <h4 className="font-semibold text-foreground mb-2">Notes</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{itinerary.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
