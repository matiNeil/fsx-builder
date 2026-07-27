"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  getTemplatesByType,
  getWebsiteTemplateCategory,
  listWebsiteTemplateCategories,
  searchWebsiteTemplates,
  type WebsiteTemplateCategory,
} from "@/lib/templates";
import {
  createPersistedWebsiteProjectState,
  createTemplateBackedPages,
  loadWebsiteProjectState,
  type WebsiteBreakpoint,
  type WebsitePage,
  type WebsiteProjectState,
} from "@/lib/website-project-state";
import { ProjectSaveStatus } from "@/components/project-save-status";
import { CreditsIndicator } from "@/components/credits-indicator";
import { fetchBalance, fetchCreditCosts, type CreditCosts } from "@/lib/credits";

type WebsiteProject = {
  id: string;
  name: string;
  type: string;
  data?: string;
  createdAt?: string;
  updatedAt?: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

const breakpoints: WebsiteBreakpoint[] = ["desktop", "tablet", "mobile"];
const breakpointLabels: Record<WebsiteBreakpoint, string> = {
  desktop: "Desktop",
  tablet: "Tablet",
  mobile: "Mobile",
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const createId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const isTypingInInput = (eventTarget: EventTarget | null) => {
  const target = eventTarget as HTMLElement | null;
  if (!target) {
    return false;
  }
  const tagName = target.tagName;
  return tagName === "INPUT" || tagName === "TEXTAREA" || target.isContentEditable;
};

export default function WebsiteBuilderPage() {
  const { data: session } = useSession();
  const apiToken = session?.apiToken;
  const authHeaders = useMemo<Record<string, string>>(() => {
    const headers: Record<string, string> = {};
    if (apiToken) {
      headers.Authorization = `Bearer ${apiToken}`;
    }
    return headers;
  }, [apiToken]);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [creditCosts, setCreditCosts] = useState<CreditCosts>({});

  const websiteTemplates = getTemplatesByType("website");
  const categories = useMemo(
    () => ["All", ...listWebsiteTemplateCategories()] as Array<"All" | WebsiteTemplateCategory>,
    []
  );
  const shortcutModifier =
    typeof navigator !== "undefined" && navigator.platform.toLowerCase().includes("mac")
      ? "⌘"
      : "Ctrl";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | WebsiteTemplateCategory>(
    "All"
  );
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState<WebsiteProject[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [pages, setPages] = useState<WebsitePage[]>(() => createTemplateBackedPages(null, websiteTemplates));
  const [activePageId, setActivePageId] = useState<string | null>(pages[0]?.id ?? null);
  const [activeBreakpoint, setActiveBreakpoint] = useState<WebsiteBreakpoint>("desktop");
  const [projectMessage, setProjectMessage] = useState<string | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const autoSaveTimerRef = useRef<number | null>(null);
  const draggingSectionIdRef = useRef<string | null>(null);

  const filteredTemplates = useMemo(
    () => searchWebsiteTemplates(websiteTemplates, searchQuery, selectedCategory),
    [websiteTemplates, searchQuery, selectedCategory]
  );
  const activePage = useMemo(
    () => pages.find((page) => page.id === activePageId) ?? pages[0] ?? null,
    [pages, activePageId]
  );

  const createProjectStatePayload = useCallback(
    (publishedAt?: string | null): WebsiteProjectState =>
      ({
        selectedTemplateId,
        searchQuery,
        selectedCategory,
        pages,
        activePageId: activePage?.id ?? null,
        publishedAt: publishedAt ?? null,
      }) satisfies WebsiteProjectState,
    [selectedTemplateId, searchQuery, selectedCategory, pages, activePage]
  );
  const currentSnapshot = useMemo(
    () =>
      JSON.stringify({
        name: projectName.trim(),
        data: createPersistedWebsiteProjectState(createProjectStatePayload()),
      }),
    [projectName, createProjectStatePayload]
  );
  const hasUnsavedChanges =
    Boolean(activeProjectId && lastSavedSnapshot) && currentSnapshot !== lastSavedSnapshot;

  const fetchProjects = useCallback(async () => {
    if (!apiToken) {
      return;
    }
    setIsLoadingProjects(true);
    setProjectError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, { headers: authHeaders });
      const payload = (await response.json()) as
        | WebsiteProject[]
        | { error?: string; message?: string };
      if (!response.ok || !Array.isArray(payload)) {
        const errorMessage =
          !Array.isArray(payload) && payload.message
            ? payload.message
            : "Unable to load projects.";
        throw new Error(errorMessage);
      }
      setProjects(payload.filter((project) => project.type === "website"));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load website projects.";
      setProjectError(message);
      setProjects([]);
    } finally {
      setIsLoadingProjects(false);
    }
  }, [apiToken, authHeaders]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchProjects();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchProjects]);

  useEffect(() => {
    void fetchCreditCosts()
      .then(setCreditCosts)
      .catch(() => setCreditCosts({}));
  }, []);

  useEffect(() => {
    if (!apiToken) {
      return;
    }
    void fetchBalance(apiToken)
      .then((balance) => setCreditsRemaining(balance.creditsRemaining))
      .catch(() => undefined);
  }, [apiToken]);

  const persistCurrentState = useCallback(
    async (silent = false, publishedAt?: string | null) => {
      if (!activeProjectId) {
        if (!silent) {
          setProjectError("Open a project first to save builder state.");
        }
        return false;
      }

      const name = projectName.trim();
      if (!name) {
        if (!silent) {
          setProjectError("Project name cannot be empty.");
        }
        return false;
      }

      if (silent) {
        setIsAutoSaving(true);
      } else {
        setIsSavingProject(true);
        setProjectMessage(null);
      }
      setProjectError(null);

      try {
        const payloadData = createPersistedWebsiteProjectState(createProjectStatePayload(publishedAt));
        const response = await fetch(`${API_BASE_URL}/projects/${activeProjectId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({
            name,
            data: payloadData,
            chargeAction: !silent,
          }),
        });
        const payload = (await response.json()) as
          | (WebsiteProject & { creditsRemaining?: number })
          | { error?: string; message?: string; required?: number; available?: number };
        if (!response.ok || !("id" in payload)) {
          if (response.status === 402 && "required" in payload) {
            if (typeof payload.available === "number") {
              setCreditsRemaining(payload.available);
            }
            throw new Error(
              `Not enough credits to save (need ${payload.required}, have ${payload.available}).`
            );
          }
          const errorMessage =
            !("id" in payload) && payload.message
              ? payload.message
              : "Failed to save project state.";
          throw new Error(errorMessage);
        }
        if (typeof payload.creditsRemaining === "number") {
          setCreditsRemaining(payload.creditsRemaining);
        }
        setLastSavedSnapshot(
          JSON.stringify({
            name,
            data: payloadData,
          })
        );
        setLastSavedAt(new Date().toISOString());
        if (!silent) {
          setProjectMessage("Project state saved.");
        }
        await fetchProjects();
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to save project state.";
        setProjectError(message);
        return false;
      } finally {
        if (silent) {
          setIsAutoSaving(false);
        } else {
          setIsSavingProject(false);
        }
      }
    },
    [activeProjectId, projectName, createProjectStatePayload, fetchProjects, authHeaders]
  );

  const onCreateProject = useCallback(async () => {
    const name = projectName.trim();
    if (!name) {
      setProjectError("Enter a project name.");
      return;
    }

    setIsSavingProject(true);
    setProjectError(null);
    setProjectMessage(null);
    try {
      const payloadData = createPersistedWebsiteProjectState(createProjectStatePayload());
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          name,
          type: "website",
          data: payloadData,
        }),
      });
      const payload = (await response.json()) as
        | (WebsiteProject & { creditsRemaining?: number })
        | { error?: string; message?: string; required?: number; available?: number };
      if (!response.ok || !("id" in payload)) {
        if (response.status === 402 && "required" in payload) {
          if (typeof payload.available === "number") {
            setCreditsRemaining(payload.available);
          }
          throw new Error(
            `Not enough credits to create a website (need ${payload.required}, have ${payload.available}).`
          );
        }
        const errorMessage =
          !("id" in payload) && payload.message
            ? payload.message
            : "Failed to save project.";
        throw new Error(errorMessage);
      }

      if (typeof payload.creditsRemaining === "number") {
        setCreditsRemaining(payload.creditsRemaining);
      }
      setActiveProjectId(payload.id);
      setLastSavedSnapshot(
        JSON.stringify({
          name,
          data: payloadData,
        })
      );
      setLastSavedAt(new Date().toISOString());
      setProjectMessage("Project saved.");
      await fetchProjects();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save website project.";
      setProjectError(message);
    } finally {
      setIsSavingProject(false);
    }
  }, [projectName, createProjectStatePayload, fetchProjects, authHeaders]);

  const onOpenProject = (project: WebsiteProject) => {
    const projectState = loadWebsiteProjectState(project.data, websiteTemplates);
    const normalizedPages =
      projectState.pages.length > 0 ? projectState.pages : createTemplateBackedPages(null, websiteTemplates);
    const normalizedActivePageId =
      projectState.activePageId && normalizedPages.some((page) => page.id === projectState.activePageId)
        ? projectState.activePageId
        : (normalizedPages[0]?.id ?? null);
    const payload = createPersistedWebsiteProjectState({
      ...projectState,
      pages: normalizedPages,
      activePageId: normalizedActivePageId,
    });

    setActiveProjectId(project.id);
    setProjectName(project.name);
    setSelectedTemplateId(projectState.selectedTemplateId);
    setSearchQuery(projectState.searchQuery);
    setSelectedCategory(projectState.selectedCategory);
    setPages(normalizedPages);
    setActivePageId(normalizedActivePageId);
    setPublishedUrl(
      projectState.publishedAt && typeof window !== "undefined"
        ? `${window.location.origin}/published/${project.id}`
        : null
    );
    setLastSavedSnapshot(
      JSON.stringify({
        name: project.name,
        data: payload,
      })
    );
    setLastSavedAt(new Date().toISOString());
    setProjectMessage(`Opened project "${project.name}".`);
    setProjectError(null);
  };

  const onSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const templatePages = createTemplateBackedPages(templateId, websiteTemplates);
    setPages(templatePages);
    setActivePageId(templatePages[0]?.id ?? null);
  };

  const updateActivePage = useCallback((updater: (page: WebsitePage) => WebsitePage) => {
    if (!activePageId) {
      return;
    }
    setPages((currentPages) =>
      currentPages.map((page) => (page.id === activePageId ? updater(page) : page))
    );
  }, [activePageId]);

  const onAddPage = useCallback(() => {
    const title = `Page ${pages.length + 1}`;
    const slug = slugify(title);
    const newPage: WebsitePage = {
      id: createId("page"),
      title,
      slug,
      sections: [
        {
          id: createId("section"),
          heading: `${title} Hero`,
          body: "Describe this page content.",
        },
      ],
      responsive: activePage?.responsive ?? {
        desktop: { columns: 1, contentWidth: 960, sectionGap: 24, fontScale: 1 },
        tablet: { columns: 1, contentWidth: 760, sectionGap: 20, fontScale: 0.95 },
        mobile: { columns: 1, contentWidth: 420, sectionGap: 16, fontScale: 0.9 },
      },
    };
    setPages((current) => [...current, newPage]);
    setActivePageId(newPage.id);
  }, [pages.length, activePage]);

  const onRemovePage = (pageId: string) => {
    setPages((currentPages) => {
      if (currentPages.length <= 1) {
        return currentPages;
      }
      const nextPages = currentPages.filter((page) => page.id !== pageId);
      if (activePageId === pageId) {
        setActivePageId(nextPages[0]?.id ?? null);
      }
      return nextPages;
    });
  };

  const onAddSection = useCallback(() => {
    if (!activePage) {
      return;
    }
    const nextIndex = activePage.sections.length + 1;
    updateActivePage((page) => ({
      ...page,
      sections: [
        ...page.sections,
        {
          id: createId("section"),
          heading: `Section ${nextIndex}`,
          body: "",
        },
      ],
    }));
  }, [activePage, updateActivePage]);

  const onRemoveSection = (sectionId: string) => {
    if (!activePage) {
      return;
    }
    updateActivePage((page) => {
      const nextSections = page.sections.filter((section) => section.id !== sectionId);
      return {
        ...page,
        sections: nextSections.length > 0 ? nextSections : page.sections,
      };
    });
  };

  const onSectionDragStart = (sectionId: string) => {
    draggingSectionIdRef.current = sectionId;
  };
  const onSectionDrop = (targetSectionId: string) => {
    if (!activePage || !draggingSectionIdRef.current) {
      return;
    }
    const sourceId = draggingSectionIdRef.current;
    if (sourceId === targetSectionId) {
      return;
    }
    updateActivePage((page) => {
      const sections = [...page.sections];
      const sourceIndex = sections.findIndex((section) => section.id === sourceId);
      const targetIndex = sections.findIndex((section) => section.id === targetSectionId);
      if (sourceIndex < 0 || targetIndex < 0) {
        return page;
      }
      const [moved] = sections.splice(sourceIndex, 1);
      sections.splice(targetIndex, 0, moved);
      return { ...page, sections };
    });
    draggingSectionIdRef.current = null;
  };

  const onPublish = useCallback(async () => {
    if (!activeProjectId) {
      setProjectError("Create or open a project first to publish.");
      return;
    }
    const publishedAt = new Date().toISOString();
    const saved = await persistCurrentState(false, publishedAt);
    if (!saved) {
      return;
    }
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/published/${activeProjectId}`;
      setPublishedUrl(url);
      setProjectMessage(`Published live: ${url}`);
    }
  }, [activeProjectId, persistCurrentState]);

  useEffect(() => {
    if (!activeProjectId || !hasUnsavedChanges || isSavingProject || isAutoSaving) {
      return;
    }
    if (autoSaveTimerRef.current) {
      window.clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = window.setTimeout(() => {
      void persistCurrentState(true);
    }, 1400);
    return () => {
      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [activeProjectId, hasUnsavedChanges, isSavingProject, isAutoSaving, persistCurrentState]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) {
        return;
      }
      const key = event.key.toLowerCase();
      if (key === "s") {
        event.preventDefault();
        if (activeProjectId) {
          void persistCurrentState(false);
        } else if (projectName.trim()) {
          void onCreateProject();
        }
      }
      if (!event.shiftKey || isTypingInInput(event.target)) {
        return;
      }
      if (key === "b") {
        event.preventDefault();
        onAddSection();
      }
      if (key === "n") {
        event.preventDefault();
        onAddPage();
      }
      if (key === "p") {
        event.preventDefault();
        void onPublish();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeProjectId, projectName, onCreateProject, persistCurrentState, onAddSection, onAddPage, onPublish]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-6 py-10 sm:px-10">
      <h1 className="text-3xl font-semibold">Website Builder</h1>
      <p className="max-w-3xl text-zinc-600 dark:text-zinc-400">
        Build and publish multi-page websites with drag-drop sections and responsive controls.
      </p>

      <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-lg font-medium">Project</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Active project: {activeProjectId ?? "none"}
        </p>
        <ProjectSaveStatus
          hasUnsavedChanges={hasUnsavedChanges}
          isAutoSaving={isAutoSaving}
          lastSavedAt={lastSavedAt}
          shortcutHint={`${shortcutModifier}+S save, Shift+${shortcutModifier}+N add page, Shift+${shortcutModifier}+B add section, Shift+${shortcutModifier}+P publish.`}
        />
        <CreditsIndicator
          creditsRemaining={creditsRemaining}
          requiredForAction={activeProjectId ? creditCosts["website.edit"] : creditCosts["website.create"]}
          actionLabel={activeProjectId ? "save changes" : "create a website"}
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            placeholder="Project name"
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          />
          <button
            type="button"
            onClick={() => void onCreateProject()}
            disabled={
              isSavingProject ||
              (creditsRemaining !== null && creditsRemaining < (creditCosts["website.create"] ?? 0))
            }
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingProject
              ? "Saving..."
              : `Save Project${creditCosts["website.create"] ? ` (${creditCosts["website.create"]} credits)` : ""}`}
          </button>
          <button
            type="button"
            onClick={() => void persistCurrentState(false)}
            disabled={
              isSavingProject ||
              !activeProjectId ||
              (creditsRemaining !== null && creditsRemaining < (creditCosts["website.edit"] ?? 0))
            }
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700"
          >
            {`Save Builder State${creditCosts["website.edit"] ? ` (${creditCosts["website.edit"]} credits)` : ""}`}
          </button>
          <button
            type="button"
            onClick={() => void onPublish()}
            disabled={
              isSavingProject ||
              !activeProjectId ||
              (creditsRemaining !== null && creditsRemaining < (creditCosts["website.edit"] ?? 0))
            }
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Publish Live
          </button>
        </div>
        {publishedUrl ? (
          <p className="text-xs text-emerald-600 dark:text-emerald-400">
            Live URL:{" "}
            <a className="underline" href={publishedUrl} target="_blank" rel="noreferrer">
              {publishedUrl}
            </a>
          </p>
        ) : null}
        {projectMessage ? (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">{projectMessage}</p>
        ) : null}
        {projectError ? (
          <p className="text-sm text-red-600 dark:text-red-400">{projectError}</p>
        ) : null}

        <div className="space-y-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Saved website projects</h3>
            <button
              type="button"
              onClick={() => void fetchProjects()}
              className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs dark:border-zinc-700"
            >
              Refresh
            </button>
          </div>
          {isLoadingProjects ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No website projects saved yet.</p>
          ) : (
            <ul className="space-y-2">
              {projects.map((project) => (
                <li
                  key={project.id}
                  className="rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
                >
                  <div className="font-medium">{project.name}</div>
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => onOpenProject(project)}
                      className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs dark:border-zinc-700"
                    >
                      {activeProjectId === project.id ? "Opened" : "Open"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <label className="block text-sm font-medium" htmlFor="template-search">
          Search templates
        </label>
        <input
          id="template-search"
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by name, use case, or size"
          className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        />
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isActive = category === selectedCategory;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  isActive
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                    : "border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
              Pages & navigation
            </h2>
            <button
              type="button"
              onClick={onAddPage}
              className="rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700"
            >
              Add page
            </button>
          </div>
          <div className="space-y-2">
            {pages.map((page) => (
              <article
                key={page.id}
                className={`space-y-2 rounded-md border p-2 ${
                  activePage?.id === page.id
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                    : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActivePageId(page.id)}
                  className="w-full text-left text-sm font-medium"
                >
                  {page.title}
                </button>
                <input
                  type="text"
                  value={page.title}
                  onChange={(event) =>
                    setPages((current) =>
                      current.map((item) =>
                        item.id === page.id
                          ? { ...item, title: event.target.value || "Untitled Page" }
                          : item
                      )
                    )
                  }
                  className="w-full rounded-md border border-zinc-300 bg-transparent px-2 py-1 text-xs dark:border-zinc-700"
                  placeholder="Page title"
                />
                <input
                  type="text"
                  value={page.slug}
                  onChange={(event) =>
                    setPages((current) =>
                      current.map((item) =>
                        item.id === page.id
                          ? { ...item, slug: slugify(event.target.value) }
                          : item
                      )
                    )
                  }
                  className="w-full rounded-md border border-zinc-300 bg-transparent px-2 py-1 text-xs dark:border-zinc-700"
                  placeholder="slug"
                />
                <button
                  type="button"
                  onClick={() => onRemovePage(page.id)}
                  disabled={pages.length <= 1}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:opacity-50 dark:border-zinc-700"
                >
                  Remove page
                </button>
              </article>
            ))}
          </div>
        </aside>

        <div className="space-y-4">
          <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Responsive editor</h2>
              <div className="flex gap-2">
                {breakpoints.map((breakpoint) => (
                  <button
                    key={breakpoint}
                    type="button"
                    onClick={() => setActiveBreakpoint(breakpoint)}
                    className={`rounded-md border px-2.5 py-1 text-xs ${
                      activeBreakpoint === breakpoint
                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                        : "border-zinc-300 dark:border-zinc-700"
                    }`}
                  >
                    {breakpointLabels[breakpoint]}
                  </button>
                ))}
              </div>
            </div>
            {activePage ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs text-zinc-500 dark:text-zinc-400">
                  Content width
                  <input
                    type="number"
                    value={activePage.responsive[activeBreakpoint].contentWidth}
                    onChange={(event) =>
                      updateActivePage((page) => ({
                        ...page,
                        responsive: {
                          ...page.responsive,
                          [activeBreakpoint]: {
                            ...page.responsive[activeBreakpoint],
                            contentWidth: Number(event.target.value) || 320,
                          },
                        },
                      }))
                    }
                    className="mt-1 w-full rounded-md border border-zinc-300 bg-transparent px-2 py-1 text-sm dark:border-zinc-700"
                  />
                </label>
                <label className="text-xs text-zinc-500 dark:text-zinc-400">
                  Section gap
                  <input
                    type="number"
                    value={activePage.responsive[activeBreakpoint].sectionGap}
                    onChange={(event) =>
                      updateActivePage((page) => ({
                        ...page,
                        responsive: {
                          ...page.responsive,
                          [activeBreakpoint]: {
                            ...page.responsive[activeBreakpoint],
                            sectionGap: Number(event.target.value) || 8,
                          },
                        },
                      }))
                    }
                    className="mt-1 w-full rounded-md border border-zinc-300 bg-transparent px-2 py-1 text-sm dark:border-zinc-700"
                  />
                </label>
                <label className="text-xs text-zinc-500 dark:text-zinc-400">
                  Font scale
                  <input
                    type="number"
                    step={0.05}
                    value={activePage.responsive[activeBreakpoint].fontScale}
                    onChange={(event) =>
                      updateActivePage((page) => ({
                        ...page,
                        responsive: {
                          ...page.responsive,
                          [activeBreakpoint]: {
                            ...page.responsive[activeBreakpoint],
                            fontScale: Number(event.target.value) || 1,
                          },
                        },
                      }))
                    }
                    className="mt-1 w-full rounded-md border border-zinc-300 bg-transparent px-2 py-1 text-sm dark:border-zinc-700"
                  />
                </label>
                <label className="text-xs text-zinc-500 dark:text-zinc-400">
                  Columns
                  <input
                    type="number"
                    min={1}
                    max={4}
                    value={activePage.responsive[activeBreakpoint].columns}
                    onChange={(event) =>
                      updateActivePage((page) => ({
                        ...page,
                        responsive: {
                          ...page.responsive,
                          [activeBreakpoint]: {
                            ...page.responsive[activeBreakpoint],
                            columns: Math.max(1, Math.min(4, Number(event.target.value) || 1)),
                          },
                        },
                      }))
                    }
                    className="mt-1 w-full rounded-md border border-zinc-300 bg-transparent px-2 py-1 text-sm dark:border-zinc-700"
                  />
                </label>
              </div>
            ) : null}
          </section>

          <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">
                Page sections {activePage ? `• ${activePage.title}` : ""}
              </h2>
              <button
                type="button"
                onClick={onAddSection}
                className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs dark:border-zinc-700"
              >
                Add section
              </button>
            </div>
            {activePage ? (
              <div
                className="space-y-3"
                style={{
                  gap: `${activePage.responsive[activeBreakpoint].sectionGap}px`,
                }}
              >
                {activePage.sections.map((section, index) => (
                  <article
                    key={section.id}
                    draggable
                    onDragStart={() => onSectionDragStart(section.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => onSectionDrop(section.id)}
                    className="space-y-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-800"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        Section {index + 1} • Drag to reorder
                      </p>
                      <button
                        type="button"
                        onClick={() => onRemoveSection(section.id)}
                        className="rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      value={section.heading}
                      onChange={(event) =>
                        updateActivePage((page) => ({
                          ...page,
                          sections: page.sections.map((item) =>
                            item.id === section.id ? { ...item, heading: event.target.value } : item
                          ),
                        }))
                      }
                      placeholder="Section heading"
                      className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
                    />
                    <textarea
                      value={section.body}
                      onChange={(event) =>
                        updateActivePage((page) => ({
                          ...page,
                          sections: page.sections.map((item) =>
                            item.id === section.id ? { ...item, body: event.target.value } : item
                          ),
                        }))
                      }
                      placeholder="Section body content"
                      className="min-h-24 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
                    />
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Add a page to start editing.</p>
            )}
          </section>
        </div>
      </section>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Showing {filteredTemplates.length} of {websiteTemplates.length} templates
      </p>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelectTemplate(template.id)}
            className={`cursor-pointer rounded-xl border bg-white p-4 text-left transition hover:border-blue-400 dark:bg-zinc-950 ${
              selectedTemplateId === template.id
                ? "border-blue-500 ring-1 ring-blue-500/40"
                : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <h2 className="text-lg font-medium">{template.name}</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{template.description}</p>
            <p className="mt-3 inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              {getWebsiteTemplateCategory(template)}
            </p>
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              {template.width} × {template.height}
            </p>
            <span className="mt-3 inline-block rounded-md border border-zinc-300 px-3 py-1.5 text-xs dark:border-zinc-700">
              {selectedTemplateId === template.id ? "Selected" : "Select template"}
            </span>
          </button>
        ))}
      </section>
      {filteredTemplates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          No templates match your search. Try a different keyword or category.
        </div>
      ) : null}
    </main>
  );
}
