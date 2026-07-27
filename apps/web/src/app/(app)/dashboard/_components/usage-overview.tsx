type UsageOverviewProps = {
  creditsUsed: number;
  monthlyCredits: number | null;
  breakdown: { website: number; poster: number; image: number };
};

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function UsageOverview({ creditsUsed, monthlyCredits, breakdown }: UsageOverviewProps) {
  const total = monthlyCredits && monthlyCredits > 0 ? monthlyCredits : Math.max(creditsUsed, 1);
  const percentUsed = Math.min(100, Math.round((creditsUsed / total) * 100));
  const offset = CIRCUMFERENCE - (percentUsed / 100) * CIRCUMFERENCE;

  const breakdownTotal = breakdown.website + breakdown.poster + breakdown.image;
  const legend = [
    { label: "Websites", value: breakdown.website, color: "bg-indigo-500" },
    { label: "Posters", value: breakdown.poster, color: "bg-orange-500" },
    { label: "Images", value: breakdown.image, color: "bg-emerald-500" },
  ];

  return (
    <section className="h-fit space-y-4 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
      <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
        Usage Overview
      </h2>
      <div className="flex justify-center">
        <svg viewBox="0 0 100 100" className="h-32 w-32 -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-zinc-100 dark:text-zinc-800"
          />
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke="url(#usage-gradient)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
          <defs>
            <linearGradient id="usage-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <p className="text-center text-2xl font-semibold">
        {percentUsed}%<span className="text-sm font-normal text-zinc-500"> used</span>
      </p>
      <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
        {creditsUsed.toLocaleString()} / {monthlyCredits ? monthlyCredits.toLocaleString() : "∞"}{" "}
        credits
      </p>
      <div className="space-y-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
        {legend.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              <span className={`h-2 w-2 rounded-full ${item.color}`} />
              {item.label}
            </span>
            <span className="font-medium">
              {breakdownTotal > 0 ? Math.round((item.value / breakdownTotal) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
