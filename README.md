# Simple Flight Booking Demo

This is a small sample flight booking project built with Next.js App Router, Tailwind CSS, TanStack Query, React Hook Form, and Zod.

## What it includes

- Minimal flight listing page.
- Indian sample routes and INR pricing.
- Flight detail page with seat selection.
- Simple booking form with validation.
- Local JSON API data for demo bookings.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## API

- `GET /api/flights`
- `GET /api/flights/[id]`
- `GET /api/flights/by-slug/[slug]`
- `GET /api/flights/[id]/seats`
- `POST /api/flights/[id]/seats`
