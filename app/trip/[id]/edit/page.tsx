import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import EditTripForm from '@/components/trip/edit-trip-form'

export default async function EditTripPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (tripError || !trip) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <header className="mb-8">
          <Link href={`/trip/${params.id}`} className="text-primary hover:text-primary/80 font-medium flex items-center gap-2 mb-6">
            ← Back to Trip
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Edit Trip</h1>
        </header>

        {/* Edit Form */}
        <EditTripForm trip={trip} />
      </div>
    </div>
  )
}
