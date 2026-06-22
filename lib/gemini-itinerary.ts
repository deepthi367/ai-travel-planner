import { GoogleGenerativeAI } from '@google/generative-ai'

export interface Activity {
  time: string
  activity: string
  description: string
  cost: string
  location: string
}

export interface GeneratedItineraryDay {
  day: number
  title: string
  activities: Activity[]
  meals?: {
    breakfast?: string
    lunch?: string
    dinner?: string
  }
  accommodation?: string
  notes?: string
}

export interface GeneratedItinerary {
  days: GeneratedItineraryDay[]
  summary?: {
    totalEstimatedCost?: string
    bestTimeToVisit?: string
    travelTips?: string[]
    hiddenGems?: string[]
  }
}

interface GenerateItineraryInput {
  destination: string
  startDate?: string | null
  endDate?: string | null
  budget?: number | null
  interests?: string | null
  numDays: number
}

function extractJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const rawJson = fenced?.[1] ?? text
  const match = rawJson.match(/\{[\s\S]*\}/)

  if (!match) {
    throw new Error('Gemini did not return JSON.')
  }

  return match[0]
}

function normalizeDays(itinerary: GeneratedItinerary, expectedDays: number) {
  if (!Array.isArray(itinerary.days) || itinerary.days.length === 0) {
    throw new Error('Gemini response did not include itinerary days.')
  }

  return itinerary.days.slice(0, expectedDays).map((day, index) => ({
    day: Number(day.day) || index + 1,
    title: day.title || `Day ${index + 1}`,
    activities: Array.isArray(day.activities) ? day.activities : [],
    meals: day.meals || {},
    accommodation: day.accommodation || '',
    notes: day.notes || '',
  }))
}

export async function generateItineraryWithGemini({
  destination,
  startDate,
  endDate,
  budget,
  interests,
  numDays,
}: GenerateItineraryInput): Promise<GeneratedItinerary> {
  const apiKey = process.env.GEMINI_API_KEY
  console.log("GEMINI KEY EXISTS:", !!process.env.GEMINI_API_KEY)

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.7,
      responseMimeType: 'application/json',
    },
  })

  const duration = startDate && endDate ? `${startDate} to ${endDate}` : `${numDays} day${numDays === 1 ? '' : 's'}`
  const prompt = `Create a real, practical ${numDays}-day travel itinerary.

Trip details:
- Destination: ${destination}
- Duration: ${duration}
- Budget: ${budget ? `$${budget}` : 'Not specified'}
- Interests: ${interests || 'General travel'}

Return only valid JSON with this exact shape:
{
  "days": [
    {
      "day": 1,
      "title": "Short day theme",
      "activities": [
        {
          "time": "09:00 AM",
          "activity": "Specific activity name",
          "description": "Practical details and why it fits the traveler",
          "cost": "$0",
          "location": "Specific neighborhood, attraction, or venue"
        }
      ],
      "meals": {
        "breakfast": "Specific recommendation",
        "lunch": "Specific recommendation",
        "dinner": "Specific recommendation"
      },
      "accommodation": "Area or hotel style recommendation that fits the budget",
      "notes": "Transit tips, timing notes, reservation advice, or local context"
    }
  ],
  "summary": {
    "totalEstimatedCost": "$0",
    "bestTimeToVisit": "Brief seasonal or timing guidance",
    "travelTips": ["Tip"],
    "hiddenGems": ["Place"]
  }
}

Use current, real places where possible. Keep the plan realistic for the budget and duration.`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  const parsed = JSON.parse(extractJson(text)) as GeneratedItinerary

  return {
    ...parsed,
    days: normalizeDays(parsed, numDays),
  }
}

export function formatItineraryNotes(day: GeneratedItineraryDay) {
  const meals = day.meals || {}
  const lines = [
    day.title,
    '',
    `Meals: Breakfast: ${meals.breakfast || 'Not specified'}`,
    `Lunch: ${meals.lunch || 'Not specified'}`,
    `Dinner: ${meals.dinner || 'Not specified'}`,
    '',
    `Accommodation: ${day.accommodation || 'Not specified'}`,
  ]

  if (day.notes) {
    lines.push('', `Notes: ${day.notes}`)
  }

  return lines.join('\n')
}
