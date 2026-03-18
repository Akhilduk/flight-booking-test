# SkyBooker Flight Booking Demo

This project has been converted from a movie booking demo into a flight booking application built with Next.js App Router, Tailwind CSS, React Hook Form, Zod, and TanStack Query.

## Features

- Flight discovery dashboard with searchable routes.
- Flight detail pages with itinerary information and cabin highlights.
- Interactive seat map with business/economy pricing.
- Passenger booking form with validation.
- File-backed sample API routes for flights and reservations.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## API endpoints

- `GET /api/flights`
- `GET /api/flights/[id]`
- `GET /api/flights/by-slug/[slug]`
- `GET /api/flights/[id]/seats`
- `POST /api/flights/[id]/seats`

Bookings are persisted to `data/bookings.json` for demo purposes.
