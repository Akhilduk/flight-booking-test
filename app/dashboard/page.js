'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
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
  const [search, setSearch] = useState('');
  const { data: flights = [], isLoading, error } = useQuery({
    queryKey: ['flights'],
    queryFn: fetchFlights,
  });

  const filteredFlights = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return flights;

    return flights.filter((flight) =>
      [
        flight.airline,
        flight.flightNumber,
        flight.origin.code,
        flight.origin.city,
        flight.destination.code,
        flight.destination.city,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [flights, search]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-sm text-slate-400 transition hover:text-white">
            ← Home
          </Link>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200">Demo Air</p>
            <h1 className="text-lg font-semibold">Flight list</h1>
          </div>
          <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs text-amber-100">
            Sample
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <section className="mb-8 rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-200">Search flights</p>
          <h2 className="mt-3 text-3xl font-semibold">Pick a route and continue.</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search Delhi, Mumbai, Indigo..."
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-300"
            />
            <p className="text-sm text-slate-400">{filteredFlights.length} flight{filteredFlights.length === 1 ? '' : 's'}</p>
          </div>
        </section>

        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-52 animate-pulse rounded-[2rem] bg-white/5" />
            ))}
          </div>
        )}
        {error && <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">Unable to load flights.</p>}

        <section className="grid gap-4 md:grid-cols-2">
          {filteredFlights.map((flight) => (
            <article key={flight.id} className="rounded-[2rem] border border-white/10 bg-white/5 p-5 transition hover:border-amber-300/40">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-amber-200">{flight.airline}</p>
                  <h3 className="mt-2 text-2xl font-semibold">
                    {flight.origin.code} → {flight.destination.code}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {flight.origin.city} to {flight.destination.city}
                  </p>
                </div>
                <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300">{flight.flightNumber}</span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 rounded-3xl border border-white/10 bg-slate-950/50 p-4 text-sm">
                <div>
                  <p className="text-slate-500">Time</p>
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

              <div className="mt-5 flex items-center justify-between text-sm text-slate-400">
                <span>{flight.tagline}</span>
                <Link
                  href={`/dashboard/flight/${flight.slug}`}
                  className="rounded-2xl bg-amber-300 px-4 py-2 font-semibold text-slate-950 transition hover:bg-amber-200"
                >
                  Select seat
                </Link>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
