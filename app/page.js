import Link from "next/link";

const quickPoints = [
  "Simple sample UI",
  "Indian city routes",
  "Seat selection + booking",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#07111f_0%,#0b1220_55%,#020617_100%)] text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-10 px-6 py-16 lg:flex-row lg:items-center lg:justify-between">
        <section className="max-w-2xl space-y-6">
          <span className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-medium text-amber-100">
            Sample flight booking project
          </span>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Quick flight seat booking, made simple.
            </h1>
            <p className="max-w-xl text-base leading-7 text-slate-300">
              A minimal demo to search flights, open one trip, pick seats, and confirm booking in a clean flow.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/dashboard"
              className="rounded-2xl bg-amber-300 px-6 py-3 font-semibold text-slate-950 transition hover:bg-amber-200"
            >
              Open flights
            </Link>
            <Link
              href="/dashboard"
              className="rounded-2xl border border-white/15 px-6 py-3 font-semibold text-white transition hover:border-amber-200 hover:text-amber-100"
            >
              View sample
            </Link>
          </div>
        </section>

        <section className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-200">Included</p>
          <div className="mt-5 space-y-3">
            {quickPoints.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-4 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-4 text-sm text-emerald-100">
            Built with Next.js, TanStack Query, sample APIs, and local JSON data.
          </div>
        </section>
      </div>
    </main>
  );
}
