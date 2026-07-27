import { Reveal } from "./reveal";

const WebsiteExample = () => (
  <div className="relative flex h-full w-full flex-col justify-between bg-zinc-100 p-4">
    <div>
      <p className="text-sm font-semibold text-zinc-900">Creative Agency</p>
      <p className="mt-1 text-[10px] text-zinc-500">Modern solutions for your business.</p>
    </div>
    <span className="w-fit rounded-md bg-zinc-900 px-2.5 py-1 text-[10px] font-medium text-white">
      Get Started
    </span>
    <div className="absolute bottom-0 right-0 h-16 w-20 bg-gradient-to-tl from-zinc-900 to-zinc-700" />
  </div>
);

const PosterExample = () => (
  <div className="relative flex h-full w-full flex-col justify-center gap-1 overflow-hidden bg-gradient-to-br from-orange-500 to-pink-500 p-4">
    <span className="w-fit rounded bg-black/20 px-2 py-0.5 text-[9px] font-medium text-white">
      25 JUN
    </span>
    <p className="text-xl font-extrabold leading-none text-white">SUMMER VIBES</p>
    <p className="text-xs font-semibold tracking-wide text-white/90">BEACH PARTY</p>
    <div className="absolute -bottom-6 -right-4 h-20 w-20 rounded-full bg-white/10" />
  </div>
);

const ImageExample = () => (
  <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-800">
    <div className="absolute right-6 top-4 h-10 w-10 rounded-full bg-gradient-to-br from-purple-200 to-indigo-300 opacity-90 blur-[1px]" />
    <div className="absolute bottom-0 left-0 h-10 w-full bg-gradient-to-t from-black/60 to-transparent" />
    <svg viewBox="0 0 100 40" className="absolute bottom-0 h-10 w-full" preserveAspectRatio="none">
      <path d="M0 40 L20 15 L35 28 L55 8 L75 25 L100 12 L100 40 Z" fill="rgba(0,0,0,0.5)" />
    </svg>
  </div>
);

const EXAMPLES = [
  { title: "Websites", description: "A responsive landing page, live in minutes.", Scene: WebsiteExample },
  { title: "Posters", description: "An event poster designed from a template.", Scene: PosterExample },
  { title: "AI Images", description: "A background generated with the Image Creator.", Scene: ImageExample },
];

export function ExamplesSection() {
  return (
    <section className="space-y-8">
      <Reveal className="text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Stunning results in seconds</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-500 dark:text-zinc-400">
          From ideas to visuals — effortlessly. Illustrative previews of what each tool produces.
        </p>
      </Reveal>
      <div className="grid gap-5 sm:grid-cols-3">
        {EXAMPLES.map(({ title, description, Scene }, index) => (
          <Reveal key={title} delayMs={index * 100}>
            <div className="overflow-hidden rounded-2xl border border-zinc-200 shadow-sm transition-transform duration-300 hover:-translate-y-1 dark:border-zinc-800">
              <div className="aspect-[4/3]">
                <Scene />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium">{title}</h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
