# AI Travel Planner

A modern full-stack web application that helps users plan trips with AI-powered itinerary generation.

## Features

- **User Authentication**: Secure email/password authentication with Supabase
- **Trip Management**: Create, edit, and delete travel plans
- **AI Itineraries**: Generate detailed day-by-day itineraries powered by Google Gemini
- **Budget Tracking**: Track estimated costs for activities and travel
- **Activity Organization**: Display activities, meals, and accommodation recommendations

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: Google Gemini API
- **UI Components**: shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Supabase account and project
- Google Gemini API key

### Environment Setup

1. Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up the database by running migrations in Supabase dashboard.

4. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```text
app/                 # App routes and API routes
components/          # UI, dashboard, and trip components
lib/                 # Supabase and Gemini helpers
middleware.ts        # Next.js middleware for auth
```

## Key Features Implementation

### Authentication Flow
- Users sign up/login via `/auth/sign-up` and `/auth/login`
- Session managed by Supabase
- Middleware protects authenticated routes

### Trip Management
- Create trips with destination, dates, interests, and budget
- Edit and delete trips from the detail page
- All trips isolated per user via RLS

### AI Itinerary Generation
- `/api/trips` creates a trip and saves a Gemini-generated itinerary with it
- `/api/generate-itinerary` regenerates Gemini itineraries and saves them to the trip
- Displays structured itineraries with activities, meals, and accommodations

### Database Schema
- `profiles`: User metadata
- `trips`: Trip information with budget and dates
- `itineraries`: Day-by-day activity plans
- `saved_items`: Bookmarked attractions/restaurants

## Security

- Row Level Security (RLS) enforces user data isolation
- API routes verify user ownership
- `GEMINI_API_KEY` stays server-side

## Deployment

Deploy to Vercel:

```bash
vercel deploy
```

Set environment variables in Vercel dashboard.

## Future Enhancements

- Real-time collaboration on trips
- Social sharing of itineraries
- Integration with booking services
- Mobile app
- Advanced filters and search
- Trip cost analytics

## License

MIT
