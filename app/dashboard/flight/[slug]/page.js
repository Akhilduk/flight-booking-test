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
  passengerName: z.string().min(2, 'Enter passenger name'),
  email: z.email('Enter valid email'),
  phone: z.string().min(10, 'Enter valid phone number'),
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
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
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
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async (values) => {
      const response = await fetch(`/api/flights/${flight.id}/seats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, tripType: 'One Way', seats: selectedSeats }),
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

  function toggleSeat(seatId, booked) {
    if (booked) return;
    setSelectedSeats((current) =>
      current.includes(seatId) ? current.filter((item) => item !== seatId) : [...current, seatId]
    );
  }

  function onSubmit(values) {
    if (selectedSeats.length === 0) {
      form.setError('root', { message: 'Please select at least one seat.' });
      return;
    }

    bookingMutation.mutate(values);
  }

  if (isFlightLoading) {
    return <div className="min-h-screen bg-slate-950 p-8 text-slate-300">Loading flight...</div>;
  }

  if (flightError || !flight) {
    return <div className="min-h-screen bg-slate-950 p-8 text-rose-300">Unable to load flight.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="text-sm text-slate-400 transition hover:text-white">
            ← Flights
          </Link>
          <h1 className="text-lg font-semibold">Book Flight</h1>
          <span className="text-sm text-amber-200">{flight.flightNumber}</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <h2 className="text-3xl font-semibold">{flight.origin.code} → {flight.destination.code}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-sm text-slate-500">Airline</p>
              <p className="mt-1 font-semibold">{flight.airline}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-sm text-slate-500">Departure</p>
              <p className="mt-1 font-semibold">{formatDateTime(flight.departureTime)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-sm text-slate-500">Duration</p>
              <p className="mt-1 font-semibold">{formatDuration(flight.durationMinutes)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-sm text-slate-500">Fare</p>
              <p className="mt-1 font-semibold">{formatCurrency(flight.basePrice)}</p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold">Seats</h3>
              <p className="text-sm text-slate-400">{seatData?.availableSeats ?? '—'} left</p>
            </div>

            {isSeatLoading ? (
              <div className="mt-6 h-72 animate-pulse rounded-[2rem] bg-slate-900/60" />
            ) : (
              <div className="mt-6 space-y-4">
                {seatData?.seatMap?.map((row) => (
                  <div key={row.row} className="grid grid-cols-[auto_1fr] items-center gap-4">
                    <div className="w-10 rounded-2xl bg-slate-900/70 py-3 text-center text-sm font-semibold text-slate-300">
                      {row.row}
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
                                  ? 'border-amber-200 bg-amber-300 text-slate-950'
                                  : 'border-white/10 bg-white/5 text-white hover:border-amber-300/40 hover:bg-amber-300/10'
                            } ${index === 2 ? 'mr-4' : ''}`}
                          >
                            {seat.id}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <h3 className="text-2xl font-semibold">Passenger</h3>
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-4">
                <input
                  {...form.register('passengerName')}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none focus:border-amber-300"
                  placeholder="Passenger name"
                />
                {form.formState.errors.passengerName && (
                  <p className="text-sm text-rose-300">{form.formState.errors.passengerName.message}</p>
                )}

                <input
                  {...form.register('email')}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none focus:border-amber-300"
                  placeholder="Email"
                />
                {form.formState.errors.email && <p className="text-sm text-rose-300">{form.formState.errors.email.message}</p>}

                <input
                  {...form.register('phone')}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none focus:border-amber-300"
                  placeholder="Phone"
                />
                {form.formState.errors.phone && <p className="text-sm text-rose-300">{form.formState.errors.phone.message}</p>}

                {(form.formState.errors.root || bookingMutation.isError) && (
                  <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                    {form.formState.errors.root?.message || bookingMutation.error?.message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={bookingMutation.isPending}
                  className="w-full rounded-2xl bg-amber-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {bookingMutation.isPending ? 'Booking...' : 'Confirm Booking'}
                </button>
              </form>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
              <h3 className="text-2xl font-semibold">Summary</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <p className="flex items-center justify-between"><span className="text-slate-500">Route</span><span>{flight.origin.code} → {flight.destination.code}</span></p>
                <p className="flex items-center justify-between"><span className="text-slate-500">Seats</span><span>{selectedSeats.length ? selectedSeats.join(', ') : 'None'}</span></p>
                <p className="flex items-center justify-between"><span className="text-slate-500">Total</span><span>{formatCurrency(totalPrice)}</span></p>
              </div>
              {bookingMutation.isSuccess && (
                <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                  <p className="font-semibold">{bookingMutation.data.message}</p>
                </div>
              )}
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
