import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { formatItineraryNotes, generateItineraryWithGemini } from '@/lib/gemini-itinerary'

function calculateDays(startDate?: string | null, endDate?: string | null, fallbackDays?: number) {
  if (fallbackDays && Number.isFinite(fallbackDays) && fallbackDays > 0) return Math.min(Math.floor(fallbackDays), 30)
  if (!startDate || !endDate) return 1

  const start = new Date(startDate)
  const end = new Date(endDate)
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

  return Number.isFinite(days) && days > 0 ? Math.min(days, 30) : 1
}

export async function POST(req: Request) {
  try {
    const { tripId, destination, startDate, endDate, budget, interests, numDays } = await req.json()

    if (!tripId || !destination) {
      return NextResponse.json({ error: 'Trip and destination are required.' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Please sign in to generate an itinerary.' }, { status: 401 })
    }

    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id')
      .eq('id', tripId)
      .eq('user_id', user.id)
      .single()

    if (tripError || !trip) {
      return NextResponse.json({ error: 'We could not find that trip.' }, { status: 404 })
    }

    const itinerary = await generateItineraryWithGemini({
      destination,
      startDate,
      endDate,
      budget: budget ? Number(budget) : null,
      interests,
      numDays: calculateDays(startDate, endDate, numDays),
    })

    await supabase.from('itineraries').delete().eq('trip_id', tripId)

    const rows = itinerary.days.map((day) => ({
      trip_id: tripId,
      day_number: day.day,
      activities: day.activities,
      notes: formatItineraryNotes(day),
    }))

    const { data: savedItineraries, error: insertError } = await supabase
      .from('itineraries')
      .insert(rows)
      .select('*')
      .order('day_number', { ascending: true })

    if (insertError) throw insertError

    return NextResponse.json({ itinerary: savedItineraries || [], summary: itinerary.summary || null })
  } catch (error) {
    console.error('Error generating itinerary:', error)
    return NextResponse.json(
      { error: 'We could not generate your itinerary right now. Please check your Gemini API key and try again.' },
      { status: 502 },
    )
  }
}
