import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    console.log("USER ID:", user?.id)
    

    if (!user) {
      return NextResponse.json({ error: 'Please sign in to view this trip.' }, { status: 401 })
    }

    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (tripError || !trip) {
      return NextResponse.json({ error: 'Trip not found.' }, { status: 404 })
    }

    const { data: itinerary, error: itineraryError } = await supabase
      .from('itineraries')
      .select('*')
      .eq('trip_id', id)
      .order('day_number', { ascending: true })

    if (itineraryError) throw itineraryError

    return NextResponse.json({ trip, itinerary: itinerary || [] })
  } catch (error) {
    console.error('Error loading trip:', error)
    return NextResponse.json({ error: 'We could not load this trip right now.' }, { status: 500 })
  }
}
