import Link from "next/link";
import { notFound } from "next/navigation";
import { loadWebsiteProjectState } from "@/lib/website-project-state";
import { getTemplatesByType } from "@fsx/templates";
import { WebsiteThemeProvider } from "@/components/website-studio/theme-provider";
import { SectionRenderer } from "@/components/website-studio/sections/registry";
import { PreviewChromeShell } from "@/components/website-studio/preview-chrome-shell";

type Params = {
  projectId: string;
  slug?: string[];
};

type SearchParams = {
  chrome?: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

const slugToPath = (slug: string) => slug.trim().replace(/^\/+|\/+$/g, "");

export default async function PreviewWebsitePage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { projectId, slug } = await params;
  const { chrome } = await searchParams;
  const pathSlug = slug?.[0] ? slugToPath(slug[0]) : "";

  if (chrome === "1") {
    return <PreviewChromeShell projectId={projectId} slugPath={pathSlug} />;
  }

  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/preview`, {
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
            const href = slugPath ? `/preview/${projectId}/${slugPath}` : `/preview/${projectId}`;
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

      <span className="fixed bottom-4 left-4 z-50 rounded-full border border-amber-300 bg-amber-50/95 px-3 py-1.5 text-xs font-medium text-amber-800 shadow-lg backdrop-blur-sm dark:border-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
        Preview {state.publishedAt ? "· not your live version until you republish" : "· not published yet"}
      </span>
    </>
  );
}
