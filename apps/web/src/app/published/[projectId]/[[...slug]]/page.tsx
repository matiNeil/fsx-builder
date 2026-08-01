import Link from "next/link";
import { notFound } from "next/navigation";
import { loadWebsiteProjectState } from "@/lib/website-project-state";
import { getTemplatesByType } from "@fsx/templates";
import { WebsiteThemeProvider } from "@/components/website-studio/theme-provider";
import { SectionRenderer } from "@/components/website-studio/sections/registry";
import { HostingSuspended } from "@/components/hosting-suspended";

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
    isHostingActive: boolean;
  };

  if (payload.type !== "website") {
    notFound();
  }

  if (!payload.isHostingActive) {
    return <HostingSuspended siteName={payload.name} />;
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

  return (
    <>
      {state.pages.length > 1 ? (
        <nav className="flex flex-wrap gap-2 border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
          {state.pages.map((page) => {
            const slugPath = slugToPath(page.slug);
            const href = slugPath ? `/published/${projectId}/${slugPath}` : `/published/${projectId}`;
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
      ) : null}

      <WebsiteThemeProvider presetId={state.theme.presetId} overrides={state.theme.overrides}>
        {activePage.sections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </WebsiteThemeProvider>

      <a
        href="/"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/90 px-3 py-1.5 text-xs text-zinc-600 shadow-lg backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-xl dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-300"
      >
        Powered by <span className="font-semibold text-zinc-900 dark:text-white">FSX Studio</span>
      </a>
    </>
  );
}
