import { Reveal } from "./reveal";

export function CtaBanner() {
  return (
    <Reveal>
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-indigo-950 to-zinc-900 px-6 py-14 text-center sm:px-10">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute left-1/4 top-0 h-40 w-40 rounded-full bg-indigo-500/30 blur-3xl" />
          <div className="absolute right-1/4 bottom-0 h-40 w-40 rounded-full bg-blue-500/30 blur-3xl" />
        </div>
        <div className="relative space-y-4">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Ready to build something amazing?
          </h2>
          <p className="text-sm text-zinc-300">
            Join thousands of creators building faster with AI.
          </p>
          <a
            href="/register"
            className="btn-gradient inline-block rounded-lg px-6 py-3 text-sm font-medium text-white"
          >
            Start Building Now
          </a>
        </div>
      </section>
    </Reveal>
  );
}
