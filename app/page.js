import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 font-sans">
      <main className="flex min-h-screen w-full max-w-2xl flex-col items-center justify-center gap-8 px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Movie Seat Booking
        </h1>
        <p className="text-zinc-400 text-lg">
          Pick a movie and book your seats in a few clicks.
        </p>
        <Link
          href="/dashboard"
          className="rounded-lg bg-amber-500 px-8 py-3 font-semibold text-zinc-900 hover:bg-amber-400 transition-colors"
        >
          Browse movies
        </Link>
      </main>
    </div>
  );
} 
