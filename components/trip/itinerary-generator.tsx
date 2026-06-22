'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface ItineraryGeneratorProps {
  tripId: string
  destination: string
  startDate: string | null
  endDate: string | null
  budget: number | null
  description: string | null
  onUpdate?: () => void
}

export default function ItineraryGenerator({
  tripId,
  destination,
  startDate,
  endDate,
  budget,
  description,
  onUpdate,
}: ItineraryGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [interests, setInterests] = useState(description || '')
  const [error, setError] = useState('')

  const calculateDays = () => {
    if (!startDate || !endDate) return 1
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    return Number.isFinite(days) && days > 0 ? days : 1
  }

  const handleGenerate = async () => {
    if (!interests.trim()) {
      setError('Tell us your interests so Gemini can personalize the itinerary.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId,
          destination,
          startDate,
          endDate,
          budget: budget || 0,
          interests,
          numDays: calculateDays(),
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || 'We could not generate your itinerary right now. Please try again.')
      }

      setInterests('')
      onUpdate?.()
    } catch (err) {
      console.error('Error generating itinerary:', err)
      setError(err instanceof Error ? err.message : 'We could not generate your itinerary right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const numDays = calculateDays()

  return (
    <div className="p-6 rounded-xl border border-border bg-card sticky top-4">
      <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
        AI Itinerary Generator
      </h2>

      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-secondary/20 border border-secondary/30 space-y-2">
          <div className="text-sm">
            <span className="text-muted-foreground">Duration:</span>
            <span className="ml-2 font-medium text-foreground">{numDays} days</span>
          </div>
          {budget && (
            <div className="text-sm">
              <span className="text-muted-foreground">Budget:</span>
              <span className="ml-2 font-medium text-foreground">${budget.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="interests" className="block mb-2">
            Interests
          </Label>
          <Textarea
            id="interests"
            placeholder="Describe the food, activities, pace, neighborhoods, and travel style you want."
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            disabled={loading}
            rows={4}
          />
          <p className="text-xs text-muted-foreground mt-2">
            The more specific you are, the better Gemini can personalize the itinerary.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={loading || !interests.trim()}
          className="w-full"
          size="lg"
        >
          {loading ? 'Generating...' : 'Generate Itinerary'}
        </Button>

        <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground space-y-1">
          <p>Gemini will create a detailed day-by-day plan.</p>
          <p>Activities, meals, and accommodations are saved to this trip.</p>
        </div>
      </div>
    </div>
  )
}
