'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { calculateSeatPrice, formatCurrency, formatDuration } from '@/lib/flights';

const bookingSchema = z.object({
  passengerName: z.string().min(2, 'Passenger name is required'),
  email: z.email('Enter a valid email address'),
  phone: z.string().min(8, 'Phone number is required'),
  tripType: z.enum(['One Way', 'Round Trip', 'Business']),
  cabinClass: z.enum(['Economy', 'Business']),
  specialRequest: z.string().max(140).optional(),
});

async function fetchFlightBySlug(slug) {
  const response = await fetch(`/api/flights/by-slug/${slug}`);
  if (!response.ok) throw new Error('Flight not found');
  return response.json();
}

async function fetchSeatMap(flightId) {
  const response = await fetch(`/api/flights/${flightId}/seats`);
  if (!response.ok) throw new Error('Failed to load seat map');
  return response.json();
}

function formatDateTime(dateString) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateString));
}

export default function FlightBookingPage() {
  const params = useParams();
  const slug = params?.slug;
  const queryClient = useQueryClient();
  const [selectedSeats, setSelectedSeats] = useState([]);

  const { data: flight, isLoading: isFlightLoading, error: flightError } = useQuery({
    queryKey: ['flight', slug],
    queryFn: () => fetchFlightBySlug(slug),
    enabled: Boolean(slug),
  });

  const { data: seatData, isLoading: isSeatLoading } = useQuery({
    queryKey: ['seat-map', flight?.id],
    queryFn: () => fetchSeatMap(flight.id),
    enabled: Boolean(flight?.id),
  });

  const form = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      passengerName: '',
      email: '',
      phone: '',
      tripType: 'One Way',
      cabinClass: 'Economy',
      specialRequest: '',
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async (values) => {
      const response = await fetch(`/api/flights/${flight.id}/seats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, seats: selectedSeats }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Booking failed');
      return data;
    },
    onSuccess: async () => {
      setSelectedSeats([]);
      form.reset();
      await queryClient.invalidateQueries({ queryKey: ['seat-map', flight.id] });
    },
  });

  const totalPrice = useMemo(() => {
    if (!flight) return 0;
    return selectedSeats.reduce((sum, seatId) => sum + calculateSeatPrice(flight.basePrice, seatId), 0);
  }, [flight, selectedSeats]);

  const selectedSeatDetails = useMemo(() => {
    if (!seatData?.seatMap) return [];
    return seatData.seatMap
      .flatMap((row) => row.seats.map((seat) => ({ ...seat, row: row.row, cabin: row.cabin })))
      .filter((seat) => selectedSeats.includes(seat.id));
  }, [seatData, selectedSeats]);

  function toggleSeat(seatId, booked) {
    if (booked) return;
    setSelectedSeats((current) =>
      current.includes(seatId) ? current.filter((item) => item !== seatId) : [...current, seatId]
    );
  }

  function onSubmit(values) {
    if (selectedSeats.length === 0) {
      form.setError('root', { message: 'Select at least one seat before confirming the booking.' });
      return;
    }

    bookingMutation.mutate(values);
  }

  if (isFlightLoading) {
    return <div className="min-h-screen bg-slate-950 p-8 text-slate-300">Loading flight details...</div>;
  }

  if (flightError || !flight) {
    return <div className="min-h-screen bg-slate-950 p-8 text-rose-300">Unable to load flight details.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="text-sm text-slate-400 transition hover:text-white">← Back to flights</Link>
          <h1 className="text-lg font-semibold">Reserve your flight</h1>
          <span className="text-sm text-sky-300">{flight.flightNumber}</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="grid gap-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-300">{flight.airline}</p>
            <h2 className="mt-3 text-4xl font-semibold">{flight.origin.city} → {flight.destination.city}</h2>
            <p className="mt-3 max-w-3xl text-slate-300">{flight.description}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ['Departure', formatDateTime(flight.departureTime)],
                ['Arrival', formatDateTime(flight.arrivalTime)],
                ['Duration', formatDuration(flight.durationMinutes)],
                ['Price', formatCurrency(flight.basePrice)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-sm text-slate-400">{label}</p>
                  <p className="mt-2 text-lg font-semibold">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {flight.highlights.map((item) => <span key={item} className="rounded-full bg-sky-400/10 px-4 py-2 text-sm text-sky-200">{item}</span>)}
            </div>
          </div>
          <aside className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-5">
            <h3 className="text-xl font-semibold">Flight details</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p><span className="text-slate-500">Aircraft:</span> {flight.aircraft}</p>
              <p><span className="text-slate-500">Origin:</span> {flight.origin.airport} ({flight.origin.code})</p>
              <p><span className="text-slate-500">Destination:</span> {flight.destination.airport} ({flight.destination.code})</p>
              <p><span className="text-slate-500">Terminal / Gate:</span> {flight.terminal} · {flight.gate}</p>
              <p><span className="text-slate-500">Baggage:</span> {flight.baggage}</p>
              <p><span className="text-slate-500">Seats left:</span> {seatData?.availableSeats ?? '—'}</p>
            </div>
          </aside>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold">Choose your seats</h3>
                <p className="mt-2 text-slate-400">Business cabin is in rows A-B. Economy cabin is in rows C-F.</p>
              </div>
              <div className="text-right text-sm text-slate-400">
                <p>Base fare: {formatCurrency(flight.basePrice)}</p>
                <p>Selected seats: {selectedSeats.length}</p>
              </div>
            </div>

            {isSeatLoading ? (
              <div className="mt-6 h-72 animate-pulse rounded-[2rem] bg-slate-900/60" />
            ) : (
              <>
                <div className="mt-8 rounded-full border border-sky-400/20 bg-sky-400/10 px-6 py-3 text-center text-sm text-sky-200">Cockpit / Front of aircraft</div>
                <div className="mt-6 space-y-4">
                  {seatData?.seatMap?.map((row) => (
                    <div key={row.row} className="grid grid-cols-[auto_1fr] items-center gap-4">
                      <div className="w-10 rounded-2xl bg-slate-900/70 py-3 text-center text-sm font-semibold text-slate-300">{row.row}</div>
                      <div>
                        <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500">
                          <span>{row.cabin}</span>
                          <span>2 · 2 aisle · 2</span>
                        </div>
                        <div className="grid grid-cols-6 gap-2">
                          {row.seats.map((seat, index) => {
                            const selected = selectedSeats.includes(seat.id);
                            return (
                              <button
                                key={seat.id}
                                type="button"
                                disabled={seat.booked}
                                onClick={() => toggleSeat(seat.id, seat.booked)}
                                className={`rounded-2xl border px-2 py-3 text-sm font-medium transition ${
                                  seat.booked
                                    ? 'cursor-not-allowed border-white/5 bg-slate-900 text-slate-600'
                                    : selected
                                      ? 'border-sky-300 bg-sky-400 text-slate-950'
                                      : 'border-white/10 bg-white/5 text-white hover:border-sky-400/40 hover:bg-sky-400/10'
                                } ${index === 2 ? 'mr-4' : ''}`}
                              >
                                {seat.id}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-300">
                  <span className="flex items-center gap-2"><span className="h-4 w-4 rounded bg-white/10" /> Available</span>
                  <span className="flex items-center gap-2"><span className="h-4 w-4 rounded bg-sky-400" /> Selected</span>
                  <span className="flex items-center gap-2"><span className="h-4 w-4 rounded bg-slate-900" /> Booked</span>
                </div>
              </>
            )}
          </div>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <h3 className="text-2xl font-semibold">Passenger details</h3>
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Passenger name</label>
                  <input {...form.register('passengerName')} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none focus:border-sky-400" placeholder="Alex Morgan" />
                  {form.formState.errors.passengerName && <p className="mt-1 text-sm text-rose-300">{form.formState.errors.passengerName.message}</p>}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Email</label>
                    <input {...form.register('email')} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none focus:border-sky-400" placeholder="alex@example.com" />
                    {form.formState.errors.email && <p className="mt-1 text-sm text-rose-300">{form.formState.errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Phone</label>
                    <input {...form.register('phone')} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none focus:border-sky-400" placeholder="+1 555 201 4410" />
                    {form.formState.errors.phone && <p className="mt-1 text-sm text-rose-300">{form.formState.errors.phone.message}</p>}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Trip type</label>
                    <select {...form.register('tripType')} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none focus:border-sky-400">
                      <option>One Way</option>
                      <option>Round Trip</option>
                      <option>Business</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Cabin preference</label>
                    <select {...form.register('cabinClass')} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none focus:border-sky-400">
                      <option>Economy</option>
                      <option>Business</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Special request</label>
                  <textarea {...form.register('specialRequest')} rows={3} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none focus:border-sky-400" placeholder="Window seat, vegetarian meal, etc." />
                </div>
                {(form.formState.errors.root || bookingMutation.isError) && (
                  <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                    {form.formState.errors.root?.message || bookingMutation.error?.message}
                  </p>
                )}
                <button type="submit" disabled={bookingMutation.isPending} className="w-full rounded-2xl bg-sky-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60">
                  {bookingMutation.isPending ? 'Confirming booking...' : 'Confirm booking'}
                </button>
              </form>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
              <h3 className="text-2xl font-semibold">Booking summary</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <p className="flex items-center justify-between"><span className="text-slate-500">Route</span><span>{flight.origin.code} → {flight.destination.code}</span></p>
                <p className="flex items-center justify-between"><span className="text-slate-500">Departure</span><span>{formatDateTime(flight.departureTime)}</span></p>
                <p className="flex items-center justify-between"><span className="text-slate-500">Selected seats</span><span>{selectedSeats.length ? selectedSeats.join(', ') : 'None yet'}</span></p>
              </div>
              <div className="mt-5 space-y-2 border-t border-white/10 pt-5 text-sm">
                {selectedSeatDetails.map((seat) => (
                  <div key={seat.id} className="flex items-center justify-between text-slate-300">
                    <span>{seat.id} · {seat.cabin} · {seat.kind}</span>
                    <span>{formatCurrency(calculateSeatPrice(flight.basePrice, seat.id))}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5 text-lg font-semibold">
                <span>Total</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              {bookingMutation.isSuccess && (
                <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                  <p className="font-semibold">{bookingMutation.data.message}</p>
                  <p className="mt-1">Seats booked: {bookingMutation.data.bookedSeats.join(', ')} · Total paid: {formatCurrency(bookingMutation.data.total)}</p>
                </div>
              )}
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
