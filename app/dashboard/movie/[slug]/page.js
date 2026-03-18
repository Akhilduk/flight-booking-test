'use client';

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useEffect } from "react";

/**
 * Fetch movie by URL slug (e.g. "the-dark-knight").
 * The [slug] dynamic segment in the route makes params.slug available here.
 */
async function fetchMovieBySlug(slug) {
  const res = await fetch(`/api/movies/by-slug/${slug}`);
  if (!res.ok) throw new Error("Movie not found");
  return res.json();
}

/** Seats are stored by movie id in the backend, so we use id for seat APIs. */
async function fetchSeats(movieId) {
  const res = await fetch(`/api/movies/${movieId}/seats`);
  if (!res.ok) throw new Error("Failed to load seats");
  return res.json();
}

const ROWS = ["A", "B", "C", "D", "E", "F"];
const COLS = 8;

export default function MovieBookingPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const slug = params?.slug;
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: movie, isLoading: movieLoading } = useQuery({
    queryKey: ["movie", slug],
    queryFn: () => fetchMovieBySlug(slug),
    enabled: !!slug,
  });

  const movieId = movie?.id;

  const { data: seatData, isLoading: seatsLoading } = useQuery({
    queryKey: ["seats", movieId],
    queryFn: () => fetchSeats(movieId),
    enabled: !!movieId,
  });

  const bookMutation = useMutation({
    mutationFn: async (seats) => {
      const res = await fetch(`/api/movies/${movieId}/seats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seats }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["seats", movieId]);
      setSelectedSeats([]);
    },
  });

  const toggleSeat = useCallback(
    (seatId) => {
      const booked = (seatData?.bookedSeats || []).includes(seatId);
      if (booked) return;
      setSelectedSeats((prev) =>
        prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
      );
    },
    [seatData?.bookedSeats]
  );

  const handleBook = () => {
    if (selectedSeats.length === 0) return;
    bookMutation.mutate(selectedSeats);
  };

  if (!slug) return null;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur">
          <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
            <Link href="/dashboard" className="text-zinc-400 hover:text-white text-sm">
              ← Back to movies
            </Link>
            <h1 className="text-lg font-semibold">Book seats</h1>
            <span className="w-24" />
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8">
          <p className="text-zinc-400">Loading...</p>
        </main>
      </div>
    );
  }

  const seats = seatData?.seats || [];
  const bookedSet = new Set(seatData?.bookedSeats || []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-zinc-400 hover:text-white text-sm">
            ← Back to movies
          </Link>
          <h1 className="text-lg font-semibold">Book seats</h1>
          <span className="w-24" />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        {movieLoading && <p className="text-zinc-400">Loading movie...</p>}
        {movie && (
          <div className="flex flex-col md:flex-row gap-6 mb-10">
            <div className="relative w-full md:w-48 aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800 shrink-0">
              <Image
                src={movie.poster}
                alt={movie.title}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{movie.title}</h2>
              <p className="text-zinc-400 mt-2">{movie.description}</p>
              <p className="text-zinc-500 text-sm mt-2">
                URL slug: <code className="bg-zinc-800 px-1 rounded">{movie.slug}</code>
              </p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Select seats</h3>
          {seatsLoading && (
            <div className="h-64 flex items-center justify-center text-zinc-500">
              Loading seats...
            </div>
          )}
          {!seatsLoading && seats.length > 0 && (
            <>
              <div className="flex justify-center mb-2">
                <div className="inline-block h-8 rounded bg-amber-500/20 px-4 flex items-center text-sm text-amber-400">
                  Screen
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                {ROWS.map((row) => (
                  <div key={row} className="flex gap-1 items-center">
                    <span className="w-6 text-zinc-500 text-sm font-medium">{row}</span>
                    <div className="flex gap-1">
                      {Array.from({ length: COLS }, (_, i) => {
                        const seatId = `${row}${i + 1}`;
                        const seat = seats.find((s) => s.id === seatId);
                        const booked = seat?.booked ?? bookedSet.has(seatId);
                        const selected = selectedSeats.includes(seatId);
                        return (
                          <button
                            key={seatId}
                            type="button"
                            disabled={booked}
                            onClick={() => toggleSeat(seatId)}
                            className={`
                              w-9 h-9 rounded-md text-xs font-medium transition-all
                              ${booked ? "bg-zinc-700 text-zinc-500 cursor-not-allowed" : ""}
                              ${selected ? "bg-amber-500 text-zinc-900 ring-2 ring-amber-400" : ""}
                              ${!booked && !selected ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-200" : ""}
                            `}
                          >
                            {i + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 mt-6 justify-center text-sm text-zinc-400">
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-zinc-600" /> Available
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-amber-500" /> Selected
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-zinc-700 opacity-60" /> Booked
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-zinc-800">
          <p className="text-zinc-400">
            {selectedSeats.length > 0
              ? `Selected: ${[...selectedSeats].sort().join(", ")}`
              : "Select one or more seats above"}
          </p>
          <button
            onClick={handleBook}
            disabled={selectedSeats.length === 0 || bookMutation.isPending}
            className="px-6 py-3 rounded-lg bg-amber-500 text-zinc-900 font-semibold hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {bookMutation.isPending ? "Booking..." : `Book ${selectedSeats.length} seat(s)`}
          </button>
        </div>
        {bookMutation.isSuccess && (
          <p className="mt-4 text-green-400 text-center">{bookMutation.data?.message}</p>
        )}
        {bookMutation.isError && (
          <p className="mt-4 text-red-400 text-center">{bookMutation.error?.message}</p>
        )}
      </main>
    </div>
  );
}
