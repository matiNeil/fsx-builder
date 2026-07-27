import { formatRelativeTime } from "@/lib/format";

export type DashboardProject = {
  id: string;
  name: string;
  type: string;
  updatedAt: string;
};

const TYPE_STYLES: Record<string, { label: string; gradient: string }> = {
  website: { label: "Website", gradient: "from-indigo-500 to-blue-500" },
  poster: { label: "Poster", gradient: "from-orange-500 to-pink-500" },
  image: { label: "Image", gradient: "from-emerald-500 to-sky-500" },
};

export function RecentProjects({ projects }: { projects: DashboardProject[] }) {
  const recent = projects.slice(0, 8);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Recent Projects
        </h2>
      </div>
      {recent.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          No projects yet — create your first one above.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recent.map((project) => {
            const style = TYPE_STYLES[project.type] ?? {
              label: project.type,
              gradient: "from-zinc-500 to-zinc-700",
            };
            return (
              <div
                key={project.id}
                className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800"
              >
                <div className={`h-20 bg-gradient-to-br ${style.gradient}`} />
                <div className="p-3">
                  <p className="truncate text-sm font-medium">{project.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {style.label} · Updated {formatRelativeTime(project.updatedAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
