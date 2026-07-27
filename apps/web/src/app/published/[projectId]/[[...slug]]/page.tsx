import Link from "next/link";
import { notFound } from "next/navigation";
import { loadWebsiteProjectState } from "@/lib/website-project-state";
import { getTemplatesByType } from "@/lib/templates";

type Params = {
  projectId: string;
  slug?: string[];
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

const slugToPath = (slug: string) => slug.trim().replace(/^\/+|\/+$/g, "");

export default async function PublishedWebsitePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { projectId, slug } = await params;
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/published`, {
    cache: "no-store",
  });

  if (!response.ok) {
    notFound();
  }

  const payload = (await response.json()) as {
    id: string;
    name: string;
    type: string;
    data?: string;
  };

  if (payload.type !== "website") {
    notFound();
  }

  const templates = getTemplatesByType("website");
  const state = loadWebsiteProjectState(payload.data, templates);
  if (!state.publishedAt) {
    notFound();
  }

  const pathSlug = slug?.[0] ? slugToPath(slug[0]) : "";
  const activePage =
    state.pages.find((page) => slugToPath(page.slug) === pathSlug) ??
    state.pages.find((page) => slugToPath(page.slug) === "") ??
    state.pages[0];

  if (!activePage) {
    notFound();
  }

  const responsive = activePage.responsive.desktop;

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10 sm:px-10">
      <header className="mb-8 space-y-3 border-b border-zinc-200 pb-5 dark:border-zinc-800">
        <h1 className="text-3xl font-semibold">{payload.name}</h1>
        <nav className="flex flex-wrap gap-2">
          {state.pages.map((page) => {
            const slugPath = slugToPath(page.slug);
            const href = slugPath
              ? `/published/${projectId}/${slugPath}`
              : `/published/${projectId}`;
            const isActive = page.id === activePage.id;
            return (
              <Link
                key={page.id}
                href={href}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  isActive
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                    : "border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                }`}
              >
                {page.title}
              </Link>
            );
          })}
        </nav>
      </header>

      <section
        className="mx-auto"
        style={{
          maxWidth: `${responsive.contentWidth}px`,
          fontSize: `${responsive.fontScale}rem`,
        }}
      >
        <div
          className="grid"
          style={{
            gap: `${responsive.sectionGap}px`,
            gridTemplateColumns: `repeat(${Math.max(1, responsive.columns)}, minmax(0, 1fr))`,
          }}
        >
          {activePage.sections.map((section) => (
            <article
              key={section.id}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <h2 className="text-xl font-semibold">{section.heading}</h2>
              <p className="mt-2 whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">
                {section.body}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
