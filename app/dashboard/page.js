'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

async function fetchMovies() {
  const res = await fetch("/api/movies");
  if (!res.ok) throw new Error("Failed to fetch movies");
  return res.json();
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: movies, isLoading, error } = useQuery({
    queryKey: ["movies"],
    queryFn: fetchMovies,
  });

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-zinc-400 hover:text-white text-sm">
              ← Home
            </Link>
            <h1 className="text-xl font-semibold tracking-tight">Movie Seat Booking</h1>
            <span className="w-12" />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-2xl font-bold mb-8">Now Showing</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[2/3] rounded-xl bg-zinc-800 animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-zinc-400 hover:text-white text-sm">
            ← Home
          </Link>
          <h1 className="text-xl font-semibold tracking-tight">Movie Seat Booking</h1>
          <span className="w-12" />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-bold mb-8">Now Showing</h2>
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[2/3] rounded-xl bg-zinc-800 animate-pulse" />
            ))}
          </div>
        )}
        {error && (
          <p className="text-red-400">Failed to load movies. Please try again.</p>
        )}
        {movies && (
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <li key={movie.id}>
                <Link
                  href={`/dashboard/movie/${movie.slug}`}
                  className="block group"
                >
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800 ring-1 ring-zinc-700 group-hover:ring-amber-500/60 transition-all duration-200">
                    <Image
                      src={movie.poster}
                      alt={movie.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <span className="text-sm font-medium text-amber-400">Book seats →</span>
                    </div>
                  </div>
                  <h3 className="mt-2 font-semibold text-zinc-100 group-hover:text-amber-400 transition-colors line-clamp-2">
                    {movie.title}
                  </h3>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
