import { Reveal } from "./reveal";

const FEATURES: {
  title: string;
  subtitle: string;
  color: string;
  iconPath: string;
  comingSoon?: boolean;
}[] = [
  {
    title: "AI Generation",
    subtitle: "Smart AI builds for you",
    color: "bg-blue-500/15 text-blue-500",
    iconPath: "M11 3 4 12h5l-1 5 7-9h-5l1-5z",
  },
  {
    title: "One-click Hosting",
    subtitle: "Go live instantly",
    color: "bg-emerald-500/15 text-emerald-500",
    iconPath: "M10 3v10M6 8l4-4 4 4M4 15h12",
    comingSoon: true,
  },
  {
    title: "Custom Domains",
    subtitle: "Connect your domain",
    color: "bg-orange-500/15 text-orange-500",
    iconPath: "M10 3a7 7 0 100 14 7 7 0 000-14zM3 10h14M10 3c1.8 2 1.8 12 0 14M10 3c-1.8 2-1.8 12 0 14",
    comingSoon: true,
  },
  {
    title: "Responsive Design",
    subtitle: "Perfect on any device",
    color: "bg-purple-500/15 text-purple-500",
    iconPath: "M4 4h9v9H4zM15 8h2v8h-2zM6 15h5",
  },
  {
    title: "Export Code",
    subtitle: "Get clean code",
    color: "bg-sky-500/15 text-sky-500",
    iconPath: "M7 6 3 10l4 4M13 6l4 4-4 4M11 4 9 16",
    comingSoon: true,
  },
  {
    title: "Secure & Fast",
    subtitle: "Built for performance",
    color: "bg-teal-500/15 text-teal-500",
    iconPath: "M10 3l6 2v5c0 4-2.7 6.5-6 7-3.3-.5-6-3-6-7V5z",
  },
];

export function FeatureList() {
  return (
    <section id="features" className="scroll-mt-24 space-y-8">
      <Reveal>
        <h2 className="text-center text-3xl font-semibold tracking-tight">Why FSX Builder</h2>
      </Reveal>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {FEATURES.map((feature, index) => (
          <Reveal key={feature.title} delayMs={index * 60}>
            <div className="relative flex h-full flex-col items-center gap-2 rounded-xl border border-zinc-200 bg-white/60 px-4 py-5 text-center backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
              {feature.comingSoon ? (
                <span className="absolute right-2 top-2 rounded-full bg-zinc-900/80 px-1.5 py-0.5 text-[9px] font-medium text-white dark:bg-white/80 dark:text-zinc-900">
                  Coming soon
                </span>
              ) : null}
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${feature.color}`}>
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d={feature.iconPath} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <p className="text-sm font-medium">{feature.title}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{feature.subtitle}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
