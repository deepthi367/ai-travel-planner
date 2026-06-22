'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Trip {
  id: string
  title: string
  destination: string
  description: string | null
  start_date: string | null
  end_date: string | null
  budget: number | null
}

export default function EditTripForm({ trip }: { trip: Trip }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    title: trip.title,
    destination: trip.destination,
    description: trip.description || '',
    start_date: trip.start_date || '',
    end_date: trip.end_date || '',
    budget: trip.budget ? trip.budget.toString() : '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('trips')
        .update({
          title: formData.title,
          destination: formData.destination,
          description: formData.description || null,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          budget: formData.budget ? parseFloat(formData.budget) : null,
        })
        .eq('id', trip.id)

      if (error) throw error

      router.push(`/trip/${trip.id}`)
    } catch (error) {
      console.error('Error updating trip:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this trip? This action cannot be undone.')) return

    setDeleting(true)
    try {
      const supabase = createClient()
      await supabase.from('trips').delete().eq('id', trip.id)
      router.push('/dashboard')
    } catch (error) {
      console.error('Error deleting trip:', error)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="grid gap-6">
          <div>
            <Label htmlFor="title" className="block mb-2">
              Trip Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="destination" className="block mb-2">
              Destination
            </Label>
            <Input
              id="destination"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="description" className="block mb-2">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date" className="block mb-2">
                Start Date
              </Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="end_date" className="block mb-2">
                End Date
              </Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="budget" className="block mb-2">
              Budget (USD)
            </Label>
            <Input
              id="budget"
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={deleting || loading}
          className="flex-1"
        >
          {deleting ? 'Deleting...' : 'Delete Trip'}
        </Button>
      </div>
    </form>
  )
}
