const WebsiteIllustration = () => (
  <svg viewBox="0 0 320 200" className="h-full w-full" role="presentation">
    <defs>
      <linearGradient id="site-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
    </defs>
    <rect width="320" height="200" rx="14" fill="url(#site-bg)" />
    <rect x="16" y="16" width="288" height="26" rx="6" fill="white" fillOpacity="0.14" />
    <circle cx="30" cy="29" r="4" fill="white" fillOpacity="0.7" />
    <circle cx="44" cy="29" r="4" fill="white" fillOpacity="0.5" />
    <circle cx="58" cy="29" r="4" fill="white" fillOpacity="0.35" />
    <rect x="16" y="56" width="150" height="18" rx="4" fill="white" fillOpacity="0.9" />
    <rect x="16" y="82" width="200" height="10" rx="3" fill="white" fillOpacity="0.55" />
    <rect x="16" y="98" width="170" height="10" rx="3" fill="white" fillOpacity="0.4" />
    <rect x="16" y="124" width="88" height="60" rx="8" fill="white" fillOpacity="0.16" />
    <rect x="116" y="124" width="88" height="60" rx="8" fill="white" fillOpacity="0.22" />
    <rect x="216" y="124" width="88" height="60" rx="8" fill="white" fillOpacity="0.16" />
  </svg>
);

const PosterIllustration = () => (
  <svg viewBox="0 0 320 200" className="h-full w-full" role="presentation">
    <defs>
      <linearGradient id="poster-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>
    <rect width="320" height="200" rx="14" fill="url(#poster-bg)" />
    <rect x="110" y="24" width="100" height="130" rx="8" fill="white" fillOpacity="0.92" />
    <rect x="122" y="38" width="76" height="46" rx="4" fill="#ec4899" fillOpacity="0.35" />
    <rect x="122" y="92" width="76" height="9" rx="3" fill="#3f3f46" fillOpacity="0.7" />
    <rect x="122" y="106" width="56" height="7" rx="3" fill="#71717a" fillOpacity="0.5" />
    <rect x="122" y="132" width="44" height="12" rx="6" fill="#f97316" />
    <circle cx="46" cy="50" r="18" fill="white" fillOpacity="0.18" />
    <circle cx="268" cy="150" r="26" fill="white" fillOpacity="0.14" />
    <path d="M40 160 L64 176 L40 192 Z" fill="white" fillOpacity="0.25" />
  </svg>
);

const ImageIllustration = () => (
  <svg viewBox="0 0 320 200" className="h-full w-full" role="presentation">
    <defs>
      <linearGradient id="image-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#0ea5e9" />
      </linearGradient>
    </defs>
    <rect width="320" height="200" rx="14" fill="url(#image-bg)" />
    <rect x="56" y="70" width="120" height="90" rx="8" fill="white" fillOpacity="0.14" />
    <rect x="72" y="54" width="120" height="90" rx="8" fill="white" fillOpacity="0.2" />
    <rect x="88" y="38" width="120" height="90" rx="8" fill="white" fillOpacity="0.92" />
    <circle cx="112" cy="62" r="10" fill="#0ea5e9" fillOpacity="0.6" />
    <path d="M88 108 L124 78 L152 100 L208 60 L208 128 L88 128 Z" fill="#10b981" fillOpacity="0.45" />
    <g transform="translate(224,132)">
      <path
        d="M14 0 L17.5 10.5 L28 14 L17.5 17.5 L14 28 L10.5 17.5 L0 14 L10.5 10.5 Z"
        fill="white"
        fillOpacity="0.85"
      />
    </g>
  </svg>
);

const tools = [
  {
    href: "/website-builder",
    title: "Website Builder",
    description: "Create responsive pages and publish them live in seconds.",
    illustration: WebsiteIllustration,
  },
  {
    href: "/poster-generator",
    title: "Poster Generator",
    description: "Design posters from templates and export as PNG.",
    illustration: PosterIllustration,
  },
  {
    href: "/image-creator",
    title: "Image Creator",
    description: "Edit layers, apply effects, and generate images with AI.",
    illustration: ImageIllustration,
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-6 py-16 sm:px-10">
      <section className="grid items-center gap-10 sm:grid-cols-2">
        <div className="space-y-5">
          <span className="inline-flex items-center rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
            One workspace, three tools
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">FSX Builder</h1>
          <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
            Build websites, posters, and custom images from one visual workspace — no code
            required.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="/website-builder"
              className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Start building
            </a>
            <a
              href="/image-creator"
              className="rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Try Image Creator
            </a>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
          <WebsiteIllustration />
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-3">
        {tools.map(({ href, title, description, illustration: Illustration }) => (
          <a
            key={href}
            href={href}
            className="group overflow-hidden rounded-xl border border-zinc-200 transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800"
          >
            <div className="aspect-[16/10]">
              <Illustration />
            </div>
            <div className="p-5">
              <h2 className="text-lg font-medium group-hover:underline">{title}</h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
            </div>
          </a>
        ))}
      </section>
    </main>
  );
}
