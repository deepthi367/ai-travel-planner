import { createClient } from '@/lib/supabase/server'
import DashboardWrapper from './dashboard-wrapper'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let trips = []
  if (user) {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error) {
      trips = data || []
    }
  }

  return <DashboardWrapper user={user} trips={trips} />
}
