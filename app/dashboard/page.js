'use client';

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, formatDuration } from "@/lib/flights";

async function fetchFlights() {
  const response = await fetch('/api/flights');
  if (!response.ok) throw new Error('Failed to fetch flights');
  return response.json();
}

function formatTime(dateString) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateString));
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
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
      <header className="border-b border-white/10 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-sm text-slate-400 transition hover:text-white">← Home</Link>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-sky-300">SkyBooker</p>
            <h1 className="text-lg font-semibold">Flight Booking Dashboard</h1>
          </div>
          <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs text-sky-200">TanStack Query</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <section className="mb-8 grid gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-sky-950/10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Available routes</p>
            <h2 className="mt-3 text-3xl font-semibold">Book your next flight with seat-by-seat control.</h2>
            <p className="mt-3 max-w-2xl text-slate-300">
              Keep the same streamlined structure as the original project, now redesigned for flight discovery, itinerary review, and cabin seat booking.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
            <label className="text-sm font-medium text-slate-300">Search by city, airport, airline, or flight number</label>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Try JFK, Aurora, Miami..."
              className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-sky-400"
            />
            <p className="mt-3 text-sm text-slate-400">{filteredFlights.length} itinerary{filteredFlights.length === 1 ? '' : 'ies'} available.</p>
          </div>
        </section>

        {isLoading && <div className="grid gap-5 md:grid-cols-2">{Array.from({ length: 4 }).map((_, idx) => <div key={idx} className="h-72 animate-pulse rounded-[2rem] bg-white/5" />)}</div>}
        {error && <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">Unable to load flights right now.</p>}

        <section className="grid gap-5 md:grid-cols-2">
          {filteredFlights.map((flight) => (
            <article key={flight.id} className="group rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 transition hover:border-sky-400/40 hover:shadow-xl hover:shadow-sky-950/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-sky-300">{flight.airline}</p>
                  <h3 className="mt-2 text-2xl font-semibold">{flight.origin.code} → {flight.destination.code}</h3>
                  <p className="mt-1 text-slate-400">{flight.origin.city} to {flight.destination.city}</p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300">★ {flight.rating}</span>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4 rounded-3xl border border-white/10 bg-slate-950/40 p-4 text-sm">
                <div>
                  <p className="text-slate-500">Departure</p>
                  <p className="mt-1 text-lg font-semibold">{formatTime(flight.departureTime)}</p>
                  <p className="text-slate-400">{formatDate(flight.departureTime)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Duration</p>
                  <p className="mt-1 text-lg font-semibold">{formatDuration(flight.durationMinutes)}</p>
                  <p className="text-slate-400">{flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop`}</p>
                </div>
                <div>
                  <p className="text-slate-500">From</p>
                  <p className="mt-1 text-lg font-semibold">{formatCurrency(flight.basePrice)}</p>
                  <p className="text-slate-400">per traveler</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {flight.highlights.map((item) => (
                  <span key={item} className="rounded-full bg-sky-400/10 px-3 py-1 text-xs text-sky-200">{item}</span>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-slate-400">
                  <p>{flight.flightNumber} · {flight.aircraft}</p>
                  <p>{flight.baggage}</p>
                </div>
                <Link href={`/dashboard/flight/${flight.slug}`} className="rounded-2xl bg-sky-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-300">
                  View seats
                </Link>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
