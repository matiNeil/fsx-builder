const ACTIONS = [
  {
    label: "New Website",
    description: "Build a website",
    href: "/website-studio/new",
    color: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  },
  {
    label: "New Poster",
    description: "Design a poster",
    href: "/poster-generator",
    color: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  },
  {
    label: "New Image",
    description: "Generate an image",
    href: "/image-creator",
    color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  {
    label: "AI Assistant",
    description: "Generate a full site from a description",
    href: "/website-studio/new",
    color: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  },
];

export function QuickActions() {
  return (
    <section className="grid gap-4 sm:grid-cols-4">
      {ACTIONS.map((action) => (
        <a
          key={action.href}
          href={action.href}
          className="rounded-xl border border-zinc-200 bg-white/60 p-4 backdrop-blur-sm transition-transform hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-zinc-900/50"
        >
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-lg font-semibold ${action.color}`}>
            +
          </span>
          <p className="mt-3 text-sm font-medium">{action.label}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{action.description}</p>
        </a>
      ))}
    </section>
  );
}
