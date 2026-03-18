import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_45%),linear-gradient(180deg,#07111f_0%,#020617_55%,#01030a_100%)] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-12 px-6 py-16 lg:flex-row lg:items-center lg:gap-16">
        <section className="max-w-2xl space-y-8">
          <span className="inline-flex rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm font-medium text-sky-200">
            End-to-end flight booking experience
          </span>
          <div className="space-y-5">
            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
              Plan, compare, and reserve flights with live seat selection.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-slate-300">
              Explore curated routes, inspect aircraft details, choose your cabin seats, and confirm your itinerary in one clean flow powered by TanStack Query.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/dashboard" className="rounded-2xl bg-sky-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-sky-300">
              Browse flights
            </Link>
            <a href="#features" className="rounded-2xl border border-white/15 px-6 py-3 font-semibold text-white transition hover:border-sky-300 hover:text-sky-200">
              See features
            </a>
          </div>
        </section>

        <section className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-sky-950/20 backdrop-blur md:grid-cols-2 lg:w-[440px]">
          {[
            ["4 routes", "Sample inventory with airline, pricing, and airport metadata"],
            ["36 seats", "Interactive cabin map with business and economy sections"],
            ["Query caching", "Optimistic-feeling refetch after each booking"],
            ["Passenger forms", "Validated traveler details and booking summary"],
          ].map(([title, description]) => (
            <div key={title} className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
              <p className="text-2xl font-semibold text-sky-300">{title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
            </div>
          ))}
        </section>
      </div>

      <section id="features" className="border-t border-white/10 bg-slate-950/60">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-3">
          {[
            ["Searchable cards", "Flight cards show route, aircraft, rating, timing, and baggage allowance."],
            ["Detailed itinerary", "Every flight page includes fare summary, highlights, and travel policies."],
            ["Seat booking flow", "Passengers select seats, enter details, and receive a booking confirmation instantly."],
          ].map(([title, description]) => (
            <article key={title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="mt-3 text-slate-300">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
