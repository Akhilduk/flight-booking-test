import Link from 'next/link';

const quickPoints = [
  "Simple sample UI",
  "Indian city routes",
  "Seat selection + booking",
];

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#07111f_0%,#0b1220_55%,#020617_100%)] px-6 text-white">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
        <h1 className="text-4xl font-semibold tracking-tight">Flight Booking</h1>
        <div className="mt-8 flex justify-center">
          <Link
            href="/dashboard"
            className="rounded-2xl bg-amber-300 px-6 py-3 font-semibold text-slate-950 transition hover:bg-amber-200"
          >
            View Flights
          </Link>
        </div>
      </div>
    </main>
  );
}
