"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  DEFAULT_WEBSITE_THEME_ID,
  getTemplatesByType,
  getWebsiteTemplateCategory,
  getWebsiteTemplateDefinition,
  listWebsiteTemplateCategories,
  searchWebsiteTemplates,
  websiteTemplateDefinitions,
  type WebsiteSectionContent,
  type WebsiteTemplateCategory,
} from "@fsx/templates";
import {
  createPersistedWebsiteProjectState,
  createTemplateBackedPages,
  instantiateTemplatePages,
  type WebsitePage,
} from "@/lib/website-project-state";
import { CreditsIndicator } from "@/components/credits-indicator";
import { fetchCreditCosts, type CreditCosts } from "@/lib/credits";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

export default function NewWebsitePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const apiToken = session?.apiToken;
  const authHeaders = useMemo<Record<string, string>>(() => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (apiToken) {
      headers.Authorization = `Bearer ${apiToken}`;
    }
    return headers;
  }, [apiToken]);

  const websiteTemplates = useMemo(() => getTemplatesByType("website"), []);
  const flagshipTemplates = useMemo(
    () => websiteTemplates.filter((template) => template.id in websiteTemplateDefinitions),
    [websiteTemplates]
  );
  const otherTemplates = useMemo(
    () => websiteTemplates.filter((template) => !(template.id in websiteTemplateDefinitions)),
    [websiteTemplates]
  );

  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [creditCosts, setCreditCosts] = useState<CreditCosts>({});
  useEffect(() => {
    void fetchCreditCosts()
      .then(setCreditCosts)
      .catch(() => setCreditCosts({}));
  }, []);

  const [businessDescription, setBusinessDescription] = useState("");
  const [isGeneratingAssist, setIsGeneratingAssist] = useState(false);
  const [assistError, setAssistError] = useState<string | null>(null);

  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | WebsiteTemplateCategory>("All");
  const categories = useMemo(
    () => ["All", ...listWebsiteTemplateCategories()] as Array<"All" | WebsiteTemplateCategory>,
    []
  );
  const filteredOtherTemplates = useMemo(
    () => searchWebsiteTemplates(otherTemplates, searchQuery, selectedCategory),
    [otherTemplates, searchQuery, selectedCategory]
  );

  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const createProject = async (
    pages: WebsitePage[],
    name: string,
    templateId: string | null,
    themeId?: string
  ) => {
    setIsCreating(true);
    setCreateError(null);
    try {
      const defaultThemeId =
        themeId ??
        (templateId
          ? (getWebsiteTemplateDefinition(templateId)?.defaultThemeId ?? DEFAULT_WEBSITE_THEME_ID)
          : DEFAULT_WEBSITE_THEME_ID);
      const payloadData = createPersistedWebsiteProjectState({
        schemaVersion: 2,
        selectedTemplateId: templateId,
        theme: { presetId: defaultThemeId },
        searchQuery: "",
        selectedCategory: "All",
        pages,
        activePageId: pages[0]?.id ?? null,
        publishedAt: null,
      });
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ name, type: "website", data: payloadData }),
      });
      const payload = (await response.json()) as
        | { id: string; creditsRemaining?: number }
        | { error?: string; message?: string; required?: number; available?: number };
      if (!response.ok || !("id" in payload)) {
        if (response.status === 402 && "required" in payload) {
          throw new Error(
            `Not enough credits to create a website (need ${payload.required}, have ${payload.available}).`
          );
        }
        const message = !("id" in payload) && payload.message ? payload.message : "Failed to create website.";
        throw new Error(message);
      }
      router.push(`/website-studio/${payload.id}`);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Failed to create website.");
      setIsCreating(false);
    }
  };

  const onSelectTemplate = (templateId: string) => {
    const template = websiteTemplates.find((item) => item.id === templateId);
    const pages = createTemplateBackedPages(templateId, websiteTemplates);
    void createProject(pages, template?.name ?? "My Website", templateId);
  };

  const onStartBlank = () => {
    const pages = createTemplateBackedPages(null, websiteTemplates);
    void createProject(pages, "My Website", null);
  };

  const onGenerateWithAI = async () => {
    const description = businessDescription.trim();
    if (!description) {
      setAssistError("Describe your business first.");
      return;
    }
    setIsGeneratingAssist(true);
    setAssistError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/ai/generate-site`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ description }),
      });
      const payload = (await response.json()) as
        | {
            templateId: string;
            themeId: string;
            pages: { title: string; slug: string; sections: WebsiteSectionContent[] }[];
            creditsRemaining?: number;
          }
        | { error?: string; message?: string; required?: number; available?: number };

      if (!response.ok || !("templateId" in payload)) {
        if (response.status === 402 && "required" in payload) {
          if (typeof payload.available === "number") {
            setCreditsRemaining(payload.available);
          }
          throw new Error(
            `Not enough credits to generate with AI (need ${payload.required}, have ${payload.available}).`
          );
        }
        const message = !("templateId" in payload) && payload.message ? payload.message : "AI generation failed.";
        throw new Error(message);
      }
      if (typeof payload.creditsRemaining === "number") {
        setCreditsRemaining(payload.creditsRemaining);
      }

      const pages = instantiateTemplatePages(payload.pages, payload.templateId);
      await createProject(pages, description.slice(0, 60), payload.templateId, payload.themeId);
    } catch (error) {
      setAssistError(error instanceof Error ? error.message : "AI generation failed.");
    } finally {
      setIsGeneratingAssist(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-10 sm:px-10">
      <div>
        <h1 className="text-3xl font-semibold">Choose a template</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Pick a starting point — every template comes pre-filled with real pages and content you
          can customize.
        </p>
      </div>

      <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-medium">Not sure where to start?</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Describe your business and we&apos;ll pick a template and write your homepage intro for you.
        </p>
        <textarea
          value={businessDescription}
          onChange={(event) => setBusinessDescription(event.target.value)}
          placeholder="e.g. A cozy neighborhood coffee shop that also sells pastries"
          className="min-h-20 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        />
        <CreditsIndicator
          creditsRemaining={creditsRemaining}
          requiredForAction={
            (creditCosts["website.ai-generate-site"] ?? 0) + (creditCosts["website.create"] ?? 0)
          }
          actionLabel="generate with AI"
        />
        <button
          type="button"
          onClick={() => void onGenerateWithAI()}
          disabled={isGeneratingAssist || isCreating}
          className="btn-gradient rounded-lg px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGeneratingAssist ? "Generating..." : "Generate with AI ✨"}
        </button>
        {assistError ? <p className="text-sm text-red-600 dark:text-red-400">{assistError}</p> : null}
      </section>

      {createError ? <p className="text-sm text-red-600 dark:text-red-400">{createError}</p> : null}

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Popular templates</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {flagshipTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelectTemplate(template.id)}
              disabled={isCreating}
              className="rounded-xl border border-zinc-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <p className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                {getWebsiteTemplateCategory(template)}
              </p>
              <h3 className="mt-2 text-base font-medium">{template.name}</h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{template.description}</p>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onStartBlank}
          disabled={isCreating}
          className="text-sm text-zinc-600 underline disabled:opacity-60 dark:text-zinc-400"
        >
          Or start from a blank page
        </button>
      </section>

      <section className="space-y-3">
        <button
          type="button"
          onClick={() => setShowAllTemplates((value) => !value)}
          className="text-sm font-medium text-blue-600 dark:text-blue-400"
        >
          {showAllTemplates ? "Hide all templates" : `Browse all templates (${otherTemplates.length}) →`}
        </button>
        {showAllTemplates ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search templates"
                className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    selectedCategory === category
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                      : "border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredOtherTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => onSelectTemplate(template.id)}
                  disabled={isCreating}
                  className="rounded-xl border border-zinc-200 bg-white p-4 text-left transition hover:border-blue-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <h3 className="text-sm font-medium">{template.name}</h3>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{template.description}</p>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
