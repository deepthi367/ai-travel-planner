'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

export default function NewTripPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [savedTripId, setSavedTripId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    description: '',
    start_date: '',
    end_date: '',
    budget: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSavedTripId(null)

    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(data?.error || 'We could not create your trip right now. Please try again.')
      }

      if (data?.trip?.id && data?.error) {
        setSavedTripId(data.trip.id)
        setError(data.error)
        return
      }

      if (data?.trip?.id) {
        router.push(`/trip/${data.trip.id}`)
      } else {
        throw new Error('Trip created, but the response did not include a trip id.')
      }
    } catch (error) {
      console.error('Error creating trip:', error)
      setError(error instanceof Error ? error.message : 'We could not create your trip right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">T</span>
            </div>
            <span className="text-2xl font-bold text-foreground">TravelAI</span>
          </Link>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Plan a New Trip</h1>
              <p className="text-muted-foreground mt-2">
                Add your trip details and Gemini will generate a personalized itinerary.
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </header>

        <main className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Trip Details</CardTitle>
              <CardDescription>
                Destination, duration, budget, and interests shape the AI itinerary.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="title">Trip Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Name this trip"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="destination">Destination *</Label>
                    <Input
                      id="destination"
                      name="destination"
                      placeholder="City, country, or region"
                      value={formData.destination}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Interests</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe what you want to experience, avoid, prioritize, or spend time on."
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      disabled={loading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        name="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date">End Date</Label>
                      <Input
                        id="end_date"
                        name="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="budget">Budget (USD)</Label>
                    <Input
                      id="budget"
                      name="budget"
                      type="number"
                      placeholder="Total trip budget"
                      value={formData.budget}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive space-y-2">
                    <p>{error}</p>
                    {savedTripId && (
                      <Link href={`/trip/${savedTripId}`} className="font-medium underline">
                        Open the saved trip
                      </Link>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-6 border-t">
                  <Link href="/dashboard" className="flex-1">
                    <Button type="button" variant="outline" className="w-full" disabled={loading}>
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Creating itinerary...' : 'Create Trip & Generate Itinerary'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
