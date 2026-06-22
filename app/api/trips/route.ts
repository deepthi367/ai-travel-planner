import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { formatItineraryNotes, generateItineraryWithGemini } from '@/lib/gemini-itinerary'

function calculateDays(startDate?: string | null, endDate?: string | null) {
  if (!startDate || !endDate) return 1

  const start = new Date(startDate)
  const end = new Date(endDate)
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

  return Number.isFinite(days) && days > 0 ? Math.min(days, 30) : 1
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Please sign in to create a trip.' }, { status: 401 })
    }

    const title = String(body.title || '').trim()
    const destination = String(body.destination || '').trim()

    if (!title || !destination) {
      return NextResponse.json({ error: 'Trip title and destination are required.' }, { status: 400 })
    }

    const tripPayload = {
      user_id: user.id,
      title,
      destination,
      description: body.description ? String(body.description).trim() : null,
      start_date: body.start_date || null,
      end_date: body.end_date || null,
      budget: body.budget ? Number(body.budget) : null,
    }

    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert(tripPayload)
      .select('*')
      .single()

    if (tripError) throw tripError

    try {
      const itinerary = await generateItineraryWithGemini({
        destination: trip.destination,
        startDate: trip.start_date,
        endDate: trip.end_date,
        budget: trip.budget,
        interests: trip.description,
        numDays: calculateDays(trip.start_date, trip.end_date),
      })

      const rows = itinerary.days.map((day) => ({
        trip_id: trip.id,
        day_number: day.day,
        activities: day.activities,
        notes: formatItineraryNotes(day),
      }))

      const { data: savedItinerary, error: itineraryError } = await supabase
        .from('itineraries')
        .insert(rows)
        .select('*')
        .order('day_number', { ascending: true })

      if (itineraryError) throw itineraryError

      return NextResponse.json({ trip, itinerary: savedItinerary || [] }, { status: 201 })
    } catch (itineraryError) {
      console.error('Error creating Gemini itinerary:', itineraryError)
      return NextResponse.json(
        {
          trip,
          itinerary: [],
          error: 'Your trip was saved, but we could not generate the itinerary right now. Please try generating it again from the trip page.',
        },
        { status: 201 },
      )
    }
  } catch (error) {
    console.error('Error creating trip:', error)
    return NextResponse.json({ error: 'We could not create your trip right now. Please try again.' }, { status: 500 })
  }
}
