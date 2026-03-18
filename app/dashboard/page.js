'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency, formatDuration } from '@/lib/flights';

async function fetchFlights() {
  const response = await fetch('/api/flights');
  if (!response.ok) throw new Error('Failed to fetch flights');
  return response.json();
}

function formatTime(dateString) {
  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(dateString));
}

export default function DashboardPage() {
  const { data: flights = [], isLoading, error } = useQuery({
    queryKey: ['flights'],
    queryFn: fetchFlights,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-sm text-slate-400 transition hover:text-white">
            ← Home
          </Link>
          <h1 className="text-lg font-semibold">Flights</h1>
          <span className="text-sm text-amber-200">Demo</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-48 animate-pulse rounded-[2rem] bg-white/5" />
            ))}
          </div>
        )}

        {error && <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">Unable to load flights.</p>}

        <section className="grid gap-4 md:grid-cols-2">
          {flights.map((flight) => (
            <article key={flight.id} className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-amber-200">{flight.airline}</p>
                  <h2 className="mt-2 text-2xl font-semibold">{flight.origin.code} → {flight.destination.code}</h2>
                  <p className="mt-1 text-sm text-slate-400">{flight.origin.city} to {flight.destination.city}</p>
                </div>
                <span className="text-sm text-slate-400">{flight.flightNumber}</span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 rounded-3xl border border-white/10 bg-slate-950/50 p-4 text-sm">
                <div>
                  <p className="text-slate-500">Departure</p>
                  <p className="mt-1 font-semibold">{formatTime(flight.departureTime)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Duration</p>
                  <p className="mt-1 font-semibold">{formatDuration(flight.durationMinutes)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Fare</p>
                  <p className="mt-1 font-semibold">{formatCurrency(flight.basePrice)}</p>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <Link
                  href={`/dashboard/flight/${flight.slug}`}
                  className="rounded-2xl bg-amber-300 px-4 py-2 font-semibold text-slate-950 transition hover:bg-amber-200"
                >
                  Book
                </Link>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
