"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getTemplatesByType,
  getWebsiteTemplateCategory,
  listWebsiteTemplateCategories,
  searchWebsiteTemplates,
  type WebsiteTemplateCategory,
} from "@/lib/templates";
import {
  createPersistedWebsiteProjectState,
  createTemplateBackedBlocks,
  loadWebsiteProjectState,
  type WebsiteContentBlock,
} from "@/lib/website-project-state";
import { ProjectSaveStatus } from "@/components/project-save-status";

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

const isTypingInInput = (eventTarget: EventTarget | null) => {
  const target = eventTarget as HTMLElement | null;
  if (!target) {
    return false;
  }
  const tagName = target.tagName;
  return tagName === "INPUT" || tagName === "TEXTAREA" || target.isContentEditable;
};

export default function WebsiteBuilderPage() {
  const websiteTemplates = getTemplatesByType("website");
  const categories = useMemo(
    () => ["All", ...listWebsiteTemplateCategories()] as Array<"All" | WebsiteTemplateCategory>,
    []
  );
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
  const [contentBlocks, setContentBlocks] = useState<WebsiteContentBlock[]>(() =>
    createTemplateBackedBlocks(null, websiteTemplates)
  );
  const [projectMessage, setProjectMessage] = useState<string | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const autoSaveTimerRef = useRef<number | null>(null);

  const filteredTemplates = useMemo(
    () => searchWebsiteTemplates(websiteTemplates, searchQuery, selectedCategory),
    [websiteTemplates, searchQuery, selectedCategory]
  );

  const createProjectStatePayload = useCallback(
    () =>
      createPersistedWebsiteProjectState({
        selectedTemplateId,
        searchQuery,
        selectedCategory,
        contentBlocks,
      }),
    [selectedTemplateId, searchQuery, selectedCategory, contentBlocks]
  );

  const currentSnapshot = useMemo(
    () =>
      JSON.stringify({
        name: projectName.trim(),
        data: createProjectStatePayload(),
      }),
    [projectName, createProjectStatePayload]
  );
  const hasUnsavedChanges =
    Boolean(activeProjectId && lastSavedSnapshot) && currentSnapshot !== lastSavedSnapshot;
  const shortcutModifier =
    typeof navigator !== "undefined" && navigator.platform.toLowerCase().includes("mac")
      ? "⌘"
      : "Ctrl";

  const fetchProjects = useCallback(async () => {
    setIsLoadingProjects(true);
    setProjectError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/projects`);
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
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchProjects();
    }, 0);
    return () => {
      window.clearTimeout(timer);
    };
  }, [fetchProjects]);

  const persistCurrentState = useCallback(
    async (silent = false) => {
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
        const payloadData = createProjectStatePayload();
        const response = await fetch(`${API_BASE_URL}/projects/${activeProjectId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            data: payloadData,
          }),
        });

        const payload = (await response.json()) as
          | WebsiteProject
          | { error?: string; message?: string };
        if (!response.ok || !("id" in payload)) {
          const errorMessage =
            !("id" in payload) && payload.message
              ? payload.message
              : "Failed to save project state.";
          throw new Error(errorMessage);
        }

        const nextSnapshot = JSON.stringify({
          name,
          data: payloadData,
        });
        setLastSavedSnapshot(nextSnapshot);
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
    [activeProjectId, projectName, createProjectStatePayload, fetchProjects]
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
      const payloadData = createProjectStatePayload();
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          type: "website",
          data: payloadData,
        }),
      });

      const payload = (await response.json()) as
        | WebsiteProject
        | { error?: string; message?: string };
      if (!response.ok || !("id" in payload)) {
        const errorMessage =
          !("id" in payload) && payload.message
            ? payload.message
            : "Failed to save project.";
        throw new Error(errorMessage);
      }

      const snapshot = JSON.stringify({
        name,
        data: payloadData,
      });
      setActiveProjectId(payload.id);
      setLastSavedSnapshot(snapshot);
      setLastSavedAt(new Date().toISOString());
      setProjectMessage("Project saved with current template and page content blocks.");
      await fetchProjects();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save website project.";
      setProjectError(message);
    } finally {
      setIsSavingProject(false);
    }
  }, [projectName, createProjectStatePayload, fetchProjects]);

  const onOpenProject = (project: WebsiteProject) => {
    const projectState = loadWebsiteProjectState(project.data, websiteTemplates);
    const snapshot = JSON.stringify({
      name: project.name,
      data: createPersistedWebsiteProjectState(projectState),
    });
    setActiveProjectId(project.id);
    setProjectName(project.name);
    setSearchQuery(projectState.searchQuery);
    setSelectedCategory(projectState.selectedCategory);
    setSelectedTemplateId(projectState.selectedTemplateId);
    setContentBlocks(projectState.contentBlocks);
    setLastSavedSnapshot(snapshot);
    setLastSavedAt(new Date().toISOString());
    setProjectMessage(`Opened project "${project.name}".`);
    setProjectError(null);
  };

  const onSaveCurrentState = async () => {
    await persistCurrentState(false);
  };

  const onSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setContentBlocks(createTemplateBackedBlocks(templateId, websiteTemplates));
  };

  const onChangeContentBlock = (
    blockId: string,
    key: "heading" | "body",
    value: string
  ) => {
    setContentBlocks((currentBlocks) =>
      currentBlocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              [key]: value,
            }
          : block
      )
    );
  };

  const onAddContentBlock = useCallback(() => {
    setContentBlocks((currentBlocks) => [
      ...currentBlocks,
      {
        id: `custom-${Date.now()}`,
        heading: `New Section ${currentBlocks.length + 1}`,
        body: "",
      },
    ]);
  }, []);

  const onRemoveContentBlock = (blockId: string) => {
    setContentBlocks((currentBlocks) => {
      const nextBlocks = currentBlocks.filter((block) => block.id !== blockId);
      return nextBlocks.length > 0
        ? nextBlocks
        : createTemplateBackedBlocks(selectedTemplateId, websiteTemplates);
    });
  };

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
      if (key === "b" && event.shiftKey && !isTypingInInput(event.target)) {
        event.preventDefault();
        onAddContentBlock();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeProjectId, projectName, persistCurrentState, onCreateProject, onAddContentBlock]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-6 py-10 sm:px-10">
      <h1 className="text-3xl font-semibold">Website Builder</h1>
      <p className="max-w-3xl text-zinc-600 dark:text-zinc-400">
        Choose from a large template library and start building faster.
      </p>

      <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-lg font-medium">Create project</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Active project: {activeProjectId ?? "none"}
        </p>
        <ProjectSaveStatus
          hasUnsavedChanges={hasUnsavedChanges}
          isAutoSaving={isAutoSaving}
          lastSavedAt={lastSavedAt}
          shortcutHint={`${shortcutModifier}+S save, Shift+${shortcutModifier}+B add block.`}
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
            disabled={isSavingProject}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingProject ? "Saving..." : "Save Project"}
          </button>
          <button
            type="button"
            onClick={onSaveCurrentState}
            disabled={isSavingProject || !activeProjectId}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700"
          >
            Save Builder State
          </button>
        </div>

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
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No website projects saved yet.
            </p>
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
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {project.updatedAt
                      ? `Updated ${new Date(project.updatedAt).toLocaleString()}`
                      : project.createdAt
                        ? `Created ${new Date(project.createdAt).toLocaleString()}`
                        : "Saved"}
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
          placeholder="Search by name, use case, or size (e.g. ecommerce, blog, 1440x2200)"
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

      <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Page content blocks</h2>
          <button
            type="button"
            onClick={onAddContentBlock}
            className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs dark:border-zinc-700"
          >
            Add block
          </button>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          These blocks are saved with each project and restored when you open it.
        </p>
        <div className="space-y-3">
          {contentBlocks.map((block, index) => (
            <article
              key={block.id}
              className="space-y-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Block {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => onRemoveContentBlock(block.id)}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700"
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                value={block.heading}
                onChange={(event) =>
                  onChangeContentBlock(block.id, "heading", event.target.value)
                }
                placeholder="Section heading"
                className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
              />
              <textarea
                value={block.body}
                onChange={(event) => onChangeContentBlock(block.id, "body", event.target.value)}
                placeholder="Section body content"
                className="min-h-24 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
              />
            </article>
          ))}
        </div>
      </section>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Showing {filteredTemplates.length} of {websiteTemplates.length} templates
      </p>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <article
            key={template.id}
            className={`rounded-xl border bg-white p-4 dark:bg-zinc-950 ${
              selectedTemplateId === template.id
                ? "border-blue-500 ring-1 ring-blue-500/40"
                : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <h2 className="text-lg font-medium">{template.name}</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {template.description}
            </p>
            <p className="mt-3 inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              {getWebsiteTemplateCategory(template)}
            </p>
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              {template.width} × {template.height}
            </p>
            <button
              type="button"
              onClick={() => onSelectTemplate(template.id)}
              className="mt-3 rounded-md border border-zinc-300 px-3 py-1.5 text-xs dark:border-zinc-700"
            >
              {selectedTemplateId === template.id ? "Selected" : "Select template"}
            </button>
          </article>
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
