"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { getTemplatesByType, websiteThemePresets, type WebsiteThemeColors } from "@fsx/templates";
import {
  createPersistedWebsiteProjectState,
  createTemplateBackedPages,
  loadWebsiteProjectState,
  type WebsiteBreakpoint,
  type WebsitePage,
  type WebsiteProjectState,
  type WebsiteSectionInstance,
  type WebsiteThemeSelection,
} from "@/lib/website-project-state";
import { ProjectSaveStatus } from "@/components/project-save-status";
import { CreditsIndicator } from "@/components/credits-indicator";
import { WebsiteThemeProvider } from "@/components/website-studio/theme-provider";
import { DomainPicker } from "@/components/website-studio/domain-picker";
import {
  SECTION_TYPE_LABELS,
  SectionEditor,
  SectionRenderer,
  createDefaultSectionInstance,
} from "@/components/website-studio/sections/registry";
import { fetchBalance, fetchCreditCosts, type CreditCosts } from "@/lib/credits";
import type { WebsiteSectionType } from "@fsx/templates";

type WebsiteProject = {
  id: string;
  name: string;
  type: string;
  data?: string;
  hostingStatus?: string;
  hostingExpiresAt?: string | null;
  domainType?: string | null;
  domain?: string | null;
  domainStatus?: string | null;
  domainError?: string | null;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

const breakpoints: WebsiteBreakpoint[] = ["desktop", "tablet", "mobile"];
const breakpointLabels: Record<WebsiteBreakpoint, string> = {
  desktop: "Desktop",
  tablet: "Tablet",
  mobile: "Mobile",
};

const SECTION_TYPE_OPTIONS = Object.entries(SECTION_TYPE_LABELS) as [WebsiteSectionType, string][];

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

export default function WebsiteEditorPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const { data: session } = useSession();
  const apiToken = session?.apiToken;
  const authHeaders = useMemo<Record<string, string>>(() => {
    const headers: Record<string, string> = {};
    if (apiToken) {
      headers.Authorization = `Bearer ${apiToken}`;
    }
    return headers;
  }, [apiToken]);

  const websiteTemplates = getTemplatesByType("website");
  const shortcutModifier =
    typeof navigator !== "undefined" && navigator.platform.toLowerCase().includes("mac") ? "⌘" : "Ctrl";

  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<WebsiteProjectState["selectedCategory"]>("All");
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [theme, setTheme] = useState<WebsiteThemeSelection>({ presetId: "modern-blue" });
  const [activeBreakpoint, setActiveBreakpoint] = useState<WebsiteBreakpoint>("desktop");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newSectionType, setNewSectionType] = useState<WebsiteSectionType>("features");
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [isOpeningPreview, setIsOpeningPreview] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [projectMessage, setProjectMessage] = useState<string | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [hostingStatus, setHostingStatus] = useState<string | null>(null);
  const [hostingExpiresAt, setHostingExpiresAt] = useState<string | null>(null);
  const [isRenewingHosting, setIsRenewingHosting] = useState(false);
  const [hostingError, setHostingError] = useState<string | null>(null);
  const [domainType, setDomainType] = useState<string | null>(null);
  const [domain, setDomain] = useState<string | null>(null);
  const [domainStatus, setDomainStatus] = useState<string | null>(null);
  const [domainError, setDomainError] = useState<string | null>(null);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [creditCosts, setCreditCosts] = useState<CreditCosts>({});
  const autoSaveTimerRef = useRef<number | null>(null);
  const draggingSectionIdRef = useRef<string | null>(null);

  const activePage = useMemo(
    () => pages.find((page) => page.id === activePageId) ?? pages[0] ?? null,
    [pages, activePageId]
  );

  const createProjectStatePayload = useCallback(
    (overridePublishedAt?: string | null): WebsiteProjectState => ({
      schemaVersion: 2,
      selectedTemplateId,
      theme,
      searchQuery,
      selectedCategory,
      pages,
      activePageId: activePage?.id ?? null,
      publishedAt: overridePublishedAt !== undefined ? overridePublishedAt : publishedAt,
    }),
    [selectedTemplateId, theme, searchQuery, selectedCategory, pages, activePage, publishedAt]
  );
  const currentSnapshot = useMemo(
    () =>
      JSON.stringify({
        name: projectName.trim(),
        data: createPersistedWebsiteProjectState(createProjectStatePayload()),
      }),
    [projectName, createProjectStatePayload]
  );
  const hasUnsavedChanges = Boolean(lastSavedSnapshot) && currentSnapshot !== lastSavedSnapshot;

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

  useEffect(() => {
    if (!apiToken || !projectId) {
      return;
    }
    const timer = window.setTimeout(() => {
      setIsLoadingProject(true);
      setLoadError(null);
      fetch(`${API_BASE_URL}/projects/${projectId}`, { headers: authHeaders })
        .then(async (response) => {
          const payload = (await response.json()) as WebsiteProject & { message?: string };
          if (!response.ok) {
            throw new Error(payload.message ?? "Project not found.");
          }
          const state = loadWebsiteProjectState(payload.data, websiteTemplates);
          const normalizedPages =
            state.pages.length > 0 ? state.pages : createTemplateBackedPages(null, websiteTemplates);
          const normalizedActivePageId =
            state.activePageId && normalizedPages.some((page) => page.id === state.activePageId)
              ? state.activePageId
              : (normalizedPages[0]?.id ?? null);

          setProjectName(payload.name);
          setSelectedTemplateId(state.selectedTemplateId);
          setSearchQuery(state.searchQuery);
          setSelectedCategory(state.selectedCategory);
          setPages(normalizedPages);
          setActivePageId(normalizedActivePageId);
          setTheme(state.theme);
          setPublishedAt(state.publishedAt ?? null);
          setHostingStatus(payload.hostingStatus ?? null);
          setHostingExpiresAt(payload.hostingExpiresAt ?? null);
          setDomainType(payload.domainType ?? null);
          setDomain(payload.domain ?? null);
          setDomainStatus(payload.domainStatus ?? null);
          setDomainError(payload.domainError ?? null);
          setPublishedUrl(
            state.publishedAt && typeof window !== "undefined"
              ? `${window.location.origin}/published/${projectId}`
              : null
          );
          setLastSavedSnapshot(
            JSON.stringify({
              name: payload.name,
              data: createPersistedWebsiteProjectState({
                ...state,
                pages: normalizedPages,
                activePageId: normalizedActivePageId,
              }),
            })
          );
          setLastSavedAt(new Date().toISOString());
        })
        .catch((error) => {
          setLoadError(error instanceof Error ? error.message : "Failed to load project.");
        })
        .finally(() => setIsLoadingProject(false));
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiToken, projectId]);

  const persistCurrentState = useCallback(
    async (silent = false, publishedAt?: string | null) => {
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
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify({ name, data: payloadData, chargeAction: !silent }),
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
          const message = !("id" in payload) && payload.message ? payload.message : "Failed to save.";
          throw new Error(message);
        }
        if (typeof payload.creditsRemaining === "number") {
          setCreditsRemaining(payload.creditsRemaining);
        }
        if (typeof payload.hostingStatus === "string") {
          setHostingStatus(payload.hostingStatus);
        }
        if ("hostingExpiresAt" in payload) {
          setHostingExpiresAt(payload.hostingExpiresAt ?? null);
        }
        if ("domainType" in payload) {
          setDomainType(payload.domainType ?? null);
        }
        if ("domain" in payload) {
          setDomain(payload.domain ?? null);
        }
        if ("domainStatus" in payload) {
          setDomainStatus(payload.domainStatus ?? null);
        }
        if ("domainError" in payload) {
          setDomainError(payload.domainError ?? null);
        }
        setLastSavedSnapshot(JSON.stringify({ name, data: payloadData }));
        setLastSavedAt(new Date().toISOString());
        if (!silent) {
          setProjectMessage("Saved.");
        }
        return true;
      } catch (error) {
        setProjectError(error instanceof Error ? error.message : "Failed to save project state.");
        return false;
      } finally {
        if (silent) {
          setIsAutoSaving(false);
        } else {
          setIsSavingProject(false);
        }
      }
    },
    [projectId, projectName, createProjectStatePayload, authHeaders]
  );

  const updateActivePage = useCallback(
    (updater: (page: WebsitePage) => WebsitePage) => {
      if (!activePageId) {
        return;
      }
      setPages((currentPages) => currentPages.map((page) => (page.id === activePageId ? updater(page) : page)));
    },
    [activePageId]
  );

  const onAddPage = useCallback(() => {
    const title = `Page ${pages.length + 1}`;
    const slug = slugify(title);
    const newPage: WebsitePage = {
      id: createId("page"),
      title,
      slug,
      sections: [createDefaultSectionInstance("hero")],
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
    updateActivePage((page) => ({
      ...page,
      sections: [...page.sections, createDefaultSectionInstance(newSectionType)],
    }));
  }, [activePage, updateActivePage, newSectionType]);

  const onRemoveSection = (sectionId: string) => {
    if (!activePage) {
      return;
    }
    updateActivePage((page) => {
      const nextSections = page.sections.filter((section) => section.id !== sectionId);
      return { ...page, sections: nextSections.length > 0 ? nextSections : page.sections };
    });
  };

  const onSectionChange = (nextSection: WebsiteSectionInstance) => {
    updateActivePage((page) => ({
      ...page,
      sections: page.sections.map((item) => (item.id === nextSection.id ? nextSection : item)),
    }));
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
    const publishTimestamp = new Date().toISOString();
    const saved = await persistCurrentState(false, publishTimestamp);
    if (!saved) {
      return;
    }
    setPublishedAt(publishTimestamp);
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/published/${projectId}`;
      setPublishedUrl(url);
      setProjectMessage(`Published live: ${url}`);
    }
  }, [projectId, persistCurrentState]);

  const onPreview = useCallback(async () => {
    if (!projectName.trim()) {
      setProjectError("Project name cannot be empty.");
      return;
    }
    setIsOpeningPreview(true);
    try {
      if (hasUnsavedChanges) {
        const saved = await persistCurrentState(true);
        if (!saved) {
          return;
        }
      }
      if (typeof window !== "undefined") {
        window.open(`/preview/${projectId}?chrome=1`, "_blank", "noopener,noreferrer");
      }
    } finally {
      setIsOpeningPreview(false);
    }
  }, [projectId, projectName, hasUnsavedChanges, persistCurrentState]);

  const onRenewHosting = useCallback(async () => {
    setIsRenewingHosting(true);
    setHostingError(null);
    try {
      const response = await fetch("/api/hosting-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const payload = (await response.json()) as { redirectUrl?: string; error?: string };
      if (!response.ok || !payload.redirectUrl) {
        throw new Error(payload.error ?? "Failed to start checkout.");
      }
      window.location.href = payload.redirectUrl;
    } catch (error) {
      setHostingError(error instanceof Error ? error.message : "Failed to start checkout.");
      setIsRenewingHosting(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!hasUnsavedChanges || isSavingProject || isAutoSaving || isLoadingProject) {
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
  }, [hasUnsavedChanges, isSavingProject, isAutoSaving, isLoadingProject, persistCurrentState]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) {
        return;
      }
      const key = event.key.toLowerCase();
      if (key === "s") {
        event.preventDefault();
        void persistCurrentState(false);
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
  }, [persistCurrentState, onAddSection, onAddPage, onPublish]);

  if (isLoadingProject) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-6 py-10">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading your website...</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center gap-3 px-6 py-10 text-center">
        <p className="text-sm text-red-600 dark:text-red-400">{loadError}</p>
        <Link href="/website-studio" className="text-sm underline">
          Back to your websites
        </Link>
      </main>
    );
  }

  const previewMaxWidth = activePage?.responsive[activeBreakpoint]?.contentWidth ?? 960;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-6 px-6 py-10 sm:px-10">
      <div>
        <Link href="/website-studio" className="text-xs text-zinc-500 hover:underline dark:text-zinc-400">
          ← Your websites
        </Link>
        <input
          type="text"
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
          className="mt-1 block w-full max-w-md rounded-md border border-transparent bg-transparent text-3xl font-semibold focus:border-zinc-300 focus:px-2 focus:py-1 focus:outline-none dark:focus:border-zinc-700"
        />
      </div>

      <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <ProjectSaveStatus
          hasUnsavedChanges={hasUnsavedChanges}
          isAutoSaving={isAutoSaving}
          lastSavedAt={lastSavedAt}
          shortcutHint={`${shortcutModifier}+S save, Shift+${shortcutModifier}+N add page, Shift+${shortcutModifier}+B add section, Shift+${shortcutModifier}+P publish.`}
        />
        <CreditsIndicator
          creditsRemaining={creditsRemaining}
          requiredForAction={creditCosts["website.edit"]}
          actionLabel="save changes"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void persistCurrentState(false)}
            disabled={
              isSavingProject || (creditsRemaining !== null && creditsRemaining < (creditCosts["website.edit"] ?? 0))
            }
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700"
          >
            {isSavingProject
              ? "Saving..."
              : `Save${creditCosts["website.edit"] ? ` (${creditCosts["website.edit"]} credits)` : ""}`}
          </button>
          <button
            type="button"
            onClick={() => void onPublish()}
            disabled={
              isSavingProject || (creditsRemaining !== null && creditsRemaining < (creditCosts["website.edit"] ?? 0))
            }
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Publish Live
          </button>
          <button
            type="button"
            onClick={() => void onPreview()}
            disabled={isOpeningPreview}
            className="rounded-md border border-blue-300 px-4 py-2 text-sm font-medium text-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-blue-800 dark:text-blue-300"
          >
            {isOpeningPreview ? "Opening preview..." : "Preview"}
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
        {projectMessage ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{projectMessage}</p> : null}
        {projectError ? <p className="text-sm text-red-600 dark:text-red-400">{projectError}</p> : null}

        {publishedAt ? (
          <div className="rounded-lg border border-zinc-200 p-3 text-xs dark:border-zinc-800">
            {hostingStatus === "suspended" ? (
              <p className="font-medium text-red-600 dark:text-red-400">
                Hosting suspended — renew to bring your site back online.
              </p>
            ) : hostingExpiresAt ? (
              <p className="text-zinc-600 dark:text-zinc-400">
                Hosting active until {new Date(hostingExpiresAt).toLocaleDateString()}.
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => void onRenewHosting()}
              disabled={isRenewingHosting}
              className="mt-2 rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700"
            >
              {isRenewingHosting ? "Redirecting..." : "Renew hosting ($4/mo)"}
            </button>
            {hostingError ? <p className="mt-2 text-red-600 dark:text-red-400">{hostingError}</p> : null}
          </div>
        ) : null}

        {publishedAt && hostingStatus === "active" && apiToken ? (
          <DomainPicker
            apiToken={apiToken}
            projectId={projectId}
            domainType={domainType}
            domain={domain}
            domainStatus={domainStatus}
            domainError={domainError}
            onChange={(next) => {
              setDomainType(next.domainType);
              setDomain(next.domain);
              setDomainStatus(next.domainStatus);
              setDomainError(next.domainError);
            }}
          />
        ) : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">Pages</h2>
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
                        item.id === page.id ? { ...item, title: event.target.value || "Untitled Page" } : item
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
                      current.map((item) => (item.id === page.id ? { ...item, slug: slugify(event.target.value) } : item))
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

          <div className="space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">Preview</h2>
            <div className="flex flex-wrap gap-1.5">
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
        </aside>

        <div className="space-y-4">
          <section className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <button
              type="button"
              onClick={() => setShowAdvanced((value) => !value)}
              className="flex w-full items-center justify-between p-4 text-left text-sm font-medium"
            >
              Theme &amp; layout
              <span className="text-xs text-zinc-500">{showAdvanced ? "Hide ▲" : "Show ▼"}</span>
            </button>
            {showAdvanced ? (
              <div className="space-y-5 border-t border-zinc-200 p-4 dark:border-zinc-800">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Theme</p>
                  <div className="flex flex-wrap gap-2">
                    {websiteThemePresets.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setTheme({ presetId: preset.id })}
                        className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs ${
                          theme.presetId === preset.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40"
                            : "border-zinc-300 dark:border-zinc-700"
                        }`}
                      >
                        <span className="flex gap-0.5">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: preset.colors.primary }}
                          />
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: preset.colors.secondary }}
                          />
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: preset.colors.accent }}
                          />
                        </span>
                        {preset.name}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {(["primary", "secondary", "accent"] as (keyof WebsiteThemeColors)[]).map((key) => (
                      <label key={key} className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {key}
                        <input
                          type="color"
                          value={
                            theme.overrides?.[key] ??
                            websiteThemePresets.find((p) => p.id === theme.presetId)?.colors[key] ??
                            "#000000"
                          }
                          onChange={(event) =>
                            setTheme((current) => ({
                              ...current,
                              overrides: { ...current.overrides, [key]: event.target.value },
                            }))
                          }
                          className="h-6 w-8 cursor-pointer rounded border border-zinc-300 dark:border-zinc-700"
                        />
                      </label>
                    ))}
                    {theme.overrides ? (
                      <button
                        type="button"
                        onClick={() => setTheme((current) => ({ presetId: current.presetId }))}
                        className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Reset colors
                      </button>
                    ) : null}
                  </div>
                </div>

                {activePage ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Layout ({breakpointLabels[activeBreakpoint]})
                    </p>
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
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>

          <section className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
            <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Sections {activePage ? `• ${activePage.title}` : ""}</h2>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={newSectionType}
                  onChange={(event) => setNewSectionType(event.target.value as WebsiteSectionType)}
                  className="flex-1 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                >
                  {SECTION_TYPE_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={onAddSection}
                  className="shrink-0 rounded-md border border-zinc-300 px-2.5 py-1.5 text-xs dark:border-zinc-700"
                >
                  + Add section
                </button>
              </div>
              {activePage ? (
                <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
                  {activePage.sections.map((section, index) => (
                    <details
                      key={section.id}
                      draggable
                      onDragStart={() => onSectionDragStart(section.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => onSectionDrop(section.id)}
                      className="rounded-md border border-zinc-200 dark:border-zinc-800"
                    >
                      <summary className="flex cursor-pointer items-center justify-between p-3 text-sm font-medium">
                        <span>
                          {index + 1}. {SECTION_TYPE_LABELS[section.type]}
                        </span>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            onRemoveSection(section.id);
                          }}
                          className="rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700"
                        >
                          Remove
                        </button>
                      </summary>
                      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
                        <SectionEditor section={section} onChange={onSectionChange} />
                      </div>
                    </details>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Add a page to start editing.</p>
              )}
            </div>

            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-200 bg-white px-4 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                Live preview — {breakpointLabels[activeBreakpoint]}
              </div>
              <div className="max-h-[75vh] overflow-y-auto p-4">
                <div className="mx-auto" style={{ maxWidth: previewMaxWidth }}>
                  {activePage ? (
                    <WebsiteThemeProvider
                      presetId={theme.presetId}
                      overrides={theme.overrides}
                      className="overflow-hidden rounded-lg shadow-sm"
                    >
                      {activePage.sections.map((section) => (
                        <SectionRenderer key={section.id} section={section} />
                      ))}
                    </WebsiteThemeProvider>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
