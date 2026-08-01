"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { getTemplatesByType } from "@fsx/templates";
import {
  createPosterProjectState,
  createPosterStateFromTemplate,
  loadPosterProjectState,
  type PosterProjectState,
} from "@/lib/poster-project-state";
import { ProjectSaveStatus } from "@/components/project-save-status";
import { CreditsIndicator } from "@/components/credits-indicator";
import { fetchBalance, fetchCreditCosts, type CreditCosts } from "@/lib/credits";

type PosterProject = {
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

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load poster background image."));
    image.src = src;
  });

const drawCoverImage = (
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number
) => {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const dx = (width - drawWidth) / 2;
  const dy = (height - drawHeight) / 2;
  context.drawImage(image, dx, dy, drawWidth, drawHeight);
};

const exportPosterAsPng = async (
  projectState: PosterProjectState,
  width: number,
  height: number,
  fileName: string
) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  context.fillStyle = projectState.backgroundColor;
  context.fillRect(0, 0, width, height);

  if (projectState.backgroundImageUrl) {
    try {
      const image = await loadImage(projectState.backgroundImageUrl);
      drawCoverImage(context, image, width, height);
      context.fillStyle = "rgba(0, 0, 0, 0.35)";
      context.fillRect(0, 0, width, height);
    } catch {
      // fall back to the flat background color if the image fails to load
    }
  }

  context.fillStyle = projectState.textColor;
  context.textAlign = "left";

  const titleFontSize = Math.max(Math.round(width * 0.08), 48);
  const subtitleFontSize = Math.max(Math.round(width * 0.035), 26);
  const bodyFontSize = Math.max(Math.round(width * 0.028), 22);
  const ctaFontSize = Math.max(Math.round(width * 0.032), 24);

  let y = Math.round(height * 0.18);
  const x = Math.round(width * 0.09);

  context.font = `700 ${titleFontSize}px Inter, Arial, sans-serif`;
  context.fillText(projectState.title, x, y, Math.round(width * 0.82));
  y += titleFontSize + Math.round(height * 0.05);

  context.font = `500 ${subtitleFontSize}px Inter, Arial, sans-serif`;
  context.fillText(projectState.subtitle, x, y, Math.round(width * 0.82));
  y += subtitleFontSize + Math.round(height * 0.05);

  context.font = `400 ${bodyFontSize}px Inter, Arial, sans-serif`;
  projectState.blocks.forEach((block) => {
    context.fillText(block.text, x, y, Math.round(width * 0.82));
    y += bodyFontSize + Math.round(height * 0.02);
  });

  y = Math.min(y + Math.round(height * 0.08), Math.round(height * 0.9));
  context.font = `700 ${ctaFontSize}px Inter, Arial, sans-serif`;
  context.fillText(projectState.cta, x, y, Math.round(width * 0.82));

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `${fileName || "poster"}.png`;
  link.click();
};

export default function PosterGeneratorPage() {
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

  const posterTemplates = getTemplatesByType("poster");
  const defaultState = useMemo(
    () => createPosterStateFromTemplate(posterTemplates[0]?.id ?? null, posterTemplates),
    [posterTemplates]
  );
  const shortcutModifier =
    typeof navigator !== "undefined" && navigator.platform.toLowerCase().includes("mac")
      ? "⌘"
      : "Ctrl";

  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState<PosterProject[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projectMessage, setProjectMessage] = useState<string | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [posterState, setPosterState] = useState<PosterProjectState>(defaultState);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const autoSaveTimerRef = useRef<number | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [aiImageError, setAiImageError] = useState<string | null>(null);

  const selectedTemplate = posterTemplates.find(
    (template) => template.id === posterState.selectedTemplateId
  );
  const previewWidth = 420;
  const previewHeight = selectedTemplate
    ? Math.max(Math.round((previewWidth * selectedTemplate.height) / selectedTemplate.width), 420)
    : 560;

  const currentSnapshot = useMemo(
    () =>
      JSON.stringify({
        name: projectName.trim(),
        data: createPosterProjectState(posterState),
      }),
    [projectName, posterState]
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
        | PosterProject[]
        | { error?: string; message?: string };

      if (!response.ok || !Array.isArray(payload)) {
        const errorMessage =
          !Array.isArray(payload) && payload.message
            ? payload.message
            : "Unable to load projects.";
        throw new Error(errorMessage);
      }
      setProjects(payload.filter((project) => project.type === "poster"));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load poster projects.";
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
    return () => {
      window.clearTimeout(timer);
    };
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

  const onChangePosterState = <T extends keyof PosterProjectState>(
    key: T,
    value: PosterProjectState[T]
  ) => {
    setPosterState((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const onGenerateAiImage = async () => {
    if (!aiPrompt.trim()) {
      setAiImageError("Enter a prompt first.");
      return;
    }

    setIsGeneratingImage(true);
    setAiImageError(null);
    try {
      const isLandscape = selectedTemplate ? selectedTemplate.width > selectedTemplate.height : false;
      const size = isLandscape ? "1536x1024" : "1024x1536";
      const response = await fetch(`${API_BASE_URL}/ai/generate-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          prompt: aiPrompt.trim(),
          size,
          projectId: activeProjectId ?? undefined,
        }),
      });

      const payload = (await response.json()) as {
        imageDataUrl?: string;
        message?: string;
        creditsRemaining?: number;
        required?: number;
        available?: number;
      };
      if (!response.ok || !payload.imageDataUrl) {
        if (response.status === 402 && typeof payload.required === "number") {
          if (typeof payload.available === "number") {
            setCreditsRemaining(payload.available);
          }
          throw new Error(
            `Not enough credits to generate an image (need ${payload.required}, have ${payload.available}).`
          );
        }
        throw new Error(payload.message ?? "Image generation failed.");
      }
      if (typeof payload.creditsRemaining === "number") {
        setCreditsRemaining(payload.creditsRemaining);
      }
      onChangePosterState("backgroundImageUrl", payload.imageDataUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Image generation failed.";
      setAiImageError(message);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const onRemoveAiImage = () => {
    onChangePosterState("backgroundImageUrl", null);
  };

  const onSelectTemplate = (templateId: string) => {
    const stateFromTemplate = createPosterStateFromTemplate(templateId, posterTemplates);
    setPosterState((current) => ({
      ...stateFromTemplate,
      blocks: current.selectedTemplateId === templateId ? current.blocks : stateFromTemplate.blocks,
    }));
  };

  const onAddBlock = useCallback(() => {
    setPosterState((current) => ({
      ...current,
      blocks: [
        ...current.blocks,
        {
          id: `line-${Date.now()}`,
          text: "New poster line",
        },
      ],
    }));
  }, []);

  const onUpdateBlock = (blockId: string, text: string) => {
    setPosterState((current) => ({
      ...current,
      blocks: current.blocks.map((block) => (block.id === blockId ? { ...block, text } : block)),
    }));
  };

  const onRemoveBlock = (blockId: string) => {
    setPosterState((current) => {
      const nextBlocks = current.blocks.filter((block) => block.id !== blockId);
      return {
        ...current,
        blocks: nextBlocks.length > 0 ? nextBlocks : defaultState.blocks,
      };
    });
  };

  const persistProjectState = useCallback(
    async (silent = false) => {
      if (!activeProjectId) {
        if (!silent) {
          setProjectError("Open a poster project first.");
        }
        return false;
      }

      const name = projectName.trim();
      if (!name) {
        if (!silent) {
          setProjectError("Enter a project name.");
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
        const payloadData = createPosterProjectState(posterState);
        const response = await fetch(`${API_BASE_URL}/projects/${activeProjectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify({
            name,
            data: payloadData,
            chargeAction: !silent,
          }),
        });
        const payload = (await response.json()) as
          | (PosterProject & { creditsRemaining?: number })
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
          const message =
            !("id" in payload) && payload.message
              ? payload.message
              : "Failed to save poster project.";
          throw new Error(message);
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
          setProjectMessage("Poster project state saved.");
        }
        await fetchProjects();
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to save poster project.";
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
    [activeProjectId, projectName, posterState, fetchProjects, authHeaders]
  );

  const createProject = useCallback(async () => {
    const name = projectName.trim();
    if (!name) {
      setProjectError("Enter a project name.");
      return;
    }

    setIsSavingProject(true);
    setProjectMessage(null);
    setProjectError(null);

    try {
      const payloadData = createPosterProjectState(posterState);
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          name,
          type: "poster",
          data: payloadData,
        }),
      });

      const payload = (await response.json()) as
        | (PosterProject & { creditsRemaining?: number })
        | { error?: string; message?: string; required?: number; available?: number };
      if (!response.ok || !("id" in payload)) {
        if (response.status === 402 && "required" in payload) {
          if (typeof payload.available === "number") {
            setCreditsRemaining(payload.available);
          }
          throw new Error(
            `Not enough credits to create a poster (need ${payload.required}, have ${payload.available}).`
          );
        }
        const message =
          !("id" in payload) && payload.message
            ? payload.message
            : "Failed to save poster project.";
        throw new Error(message);
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
      setProjectMessage("Poster project created.");
      await fetchProjects();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save poster project.";
      setProjectError(message);
    } finally {
      setIsSavingProject(false);
    }
  }, [projectName, posterState, fetchProjects, authHeaders]);

  const onOpenProject = (project: PosterProject) => {
    const loadedState = loadPosterProjectState(project.data, posterTemplates);
    setActiveProjectId(project.id);
    setProjectName(project.name);
    setPosterState(loadedState);
    setLastSavedSnapshot(
      JSON.stringify({
        name: project.name,
        data: createPosterProjectState(loadedState),
      })
    );
    setLastSavedAt(new Date().toISOString());
    setProjectMessage(`Opened poster project "${project.name}".`);
    setProjectError(null);
  };

  useEffect(() => {
    if (!activeProjectId || !hasUnsavedChanges || isSavingProject || isAutoSaving) {
      return;
    }
    if (autoSaveTimerRef.current) {
      window.clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = window.setTimeout(() => {
      void persistProjectState(true);
    }, 1400);
    return () => {
      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [activeProjectId, hasUnsavedChanges, isSavingProject, isAutoSaving, persistProjectState]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) {
        return;
      }
      const key = event.key.toLowerCase();
      if (key === "s") {
        event.preventDefault();
        if (activeProjectId) {
          void persistProjectState(false);
        } else if (projectName.trim()) {
          void createProject();
        }
      }
      if (key === "l" && event.shiftKey && !isTypingInInput(event.target)) {
        event.preventDefault();
        onAddBlock();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeProjectId, projectName, persistProjectState, createProject, onAddBlock]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-6 py-10 sm:px-10">
      <h1 className="text-3xl font-semibold">Poster Generator</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Build event and campaign posters with templates, editable content, and PNG export.
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
          shortcutHint={`${shortcutModifier}+S save, Shift+${shortcutModifier}+L add line.`}
        />
        <CreditsIndicator
          creditsRemaining={creditsRemaining}
          requiredForAction={activeProjectId ? creditCosts["poster.edit"] : creditCosts["poster.generate"]}
          actionLabel={activeProjectId ? "save changes" : "generate a poster"}
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            placeholder="Poster project name"
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          />
          <button
            type="button"
            onClick={() => void createProject()}
            disabled={
              isSavingProject ||
              (creditsRemaining !== null && creditsRemaining < (creditCosts["poster.generate"] ?? 0))
            }
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingProject
              ? "Saving..."
              : `Create Project${creditCosts["poster.generate"] ? ` (${creditCosts["poster.generate"]} credits)` : ""}`}
          </button>
          <button
            type="button"
            onClick={() => void persistProjectState(false)}
            disabled={
              isSavingProject ||
              !activeProjectId ||
              (creditsRemaining !== null && creditsRemaining < (creditCosts["poster.edit"] ?? 0))
            }
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700"
          >
            {`Save State${creditCosts["poster.edit"] ? ` (${creditCosts["poster.edit"]} credits)` : ""}`}
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
            <h3 className="text-sm font-medium">Saved poster projects</h3>
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
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No poster projects yet.</p>
          ) : (
            <ul className="space-y-2">
              {projects.map((project) => (
                <li
                  key={project.id}
                  className="rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
                >
                  <div className="font-medium">{project.name}</div>
                  <button
                    type="button"
                    onClick={() => onOpenProject(project)}
                    className="mt-2 rounded-md border border-zinc-300 px-2.5 py-1 text-xs dark:border-zinc-700"
                  >
                    {activeProjectId === project.id ? "Opened" : "Open"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_460px]">
        <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-medium">Poster content</h2>
          <div className="grid gap-2">
            <label className="text-xs font-medium text-zinc-500">Title</label>
            <input
              type="text"
              value={posterState.title}
              onChange={(event) => onChangePosterState("title", event.target.value)}
              className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-medium text-zinc-500">Subtitle</label>
            <textarea
              value={posterState.subtitle}
              onChange={(event) => onChangePosterState("subtitle", event.target.value)}
              className="min-h-20 rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-medium text-zinc-500">CTA</label>
            <input
              type="text"
              value={posterState.cta}
              onChange={(event) => onChangePosterState("cta", event.target.value)}
              className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1">
              <label className="text-xs font-medium text-zinc-500">Background</label>
              <input
                type="color"
                value={posterState.backgroundColor}
                onChange={(event) => onChangePosterState("backgroundColor", event.target.value)}
                className="h-10 rounded-md border border-zinc-300 bg-transparent p-1 dark:border-zinc-700"
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-medium text-zinc-500">Text color</label>
              <input
                type="color"
                value={posterState.textColor}
                onChange={(event) => onChangePosterState("textColor", event.target.value)}
                className="h-10 rounded-md border border-zinc-300 bg-transparent p-1 dark:border-zinc-700"
              />
            </div>
          </div>
          <div className="space-y-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
            <h3 className="text-sm font-medium">AI background image</h3>
            <CreditsIndicator
              creditsRemaining={creditsRemaining}
              requiredForAction={creditCosts["image.generate"]}
              actionLabel="generate an AI background"
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={aiPrompt}
                onChange={(event) => setAiPrompt(event.target.value)}
                placeholder="Describe the poster background you want..."
                className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
              />
              <button
                type="button"
                onClick={() => void onGenerateAiImage()}
                disabled={
                  isGeneratingImage ||
                  (creditsRemaining !== null && creditsRemaining < (creditCosts["image.generate"] ?? 0))
                }
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGeneratingImage ? "Generating..." : "Generate"}
              </button>
            </div>
            {posterState.backgroundImageUrl ? (
              <button
                type="button"
                onClick={onRemoveAiImage}
                className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs dark:border-zinc-700"
              >
                Remove background image
              </button>
            ) : null}
            {aiImageError ? (
              <p className="text-sm text-red-600 dark:text-red-400">{aiImageError}</p>
            ) : null}
          </div>
          <div className="space-y-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Detail lines</h3>
              <button
                type="button"
                onClick={onAddBlock}
                className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs dark:border-zinc-700"
              >
                Add line
              </button>
            </div>
            {posterState.blocks.map((block) => (
              <div key={block.id} className="flex gap-2">
                <input
                  type="text"
                  value={block.text}
                  onChange={(event) => onUpdateBlock(block.id, event.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
                />
                <button
                  type="button"
                  onClick={() => onRemoveBlock(block.id)}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Preview</h2>
            <button
              type="button"
              onClick={() =>
                void exportPosterAsPng(
                  posterState,
                  selectedTemplate?.width ?? 1080,
                  selectedTemplate?.height ?? 1350,
                  projectName.trim() || posterState.title
                )
              }
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Export PNG
            </button>
          </div>
          <div className="grid gap-2">
            <p className="text-xs font-medium text-zinc-500">Poster templates</p>
            <div className="grid gap-2">
              {posterTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => onSelectTemplate(template.id)}
                  className={`rounded-md border px-3 py-2 text-left text-sm ${
                    posterState.selectedTemplateId === template.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40"
                      : "border-zinc-300 dark:border-zinc-700"
                  }`}
                >
                  <div className="font-medium">{template.name}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {template.width} × {template.height}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-zinc-300 bg-zinc-100 p-3 dark:border-zinc-700 dark:bg-zinc-900">
            <div
              className="relative mx-auto overflow-hidden rounded-md"
              style={{
                width: previewWidth,
                height: previewHeight,
                backgroundColor: posterState.backgroundColor,
                backgroundImage: posterState.backgroundImageUrl
                  ? `url(${posterState.backgroundImageUrl})`
                  : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                color: posterState.textColor,
              }}
            >
              {posterState.backgroundImageUrl ? (
                <div className="absolute inset-0 bg-black/35" />
              ) : null}
              <div className="relative flex h-full flex-col px-8 py-10">
                <h3 className="text-4xl font-extrabold">{posterState.title}</h3>
                <p className="mt-5 text-lg opacity-90">{posterState.subtitle}</p>
                <div className="mt-8 space-y-2 text-base">
                  {posterState.blocks.map((block) => (
                    <p key={block.id}>{block.text}</p>
                  ))}
                </div>
                <p className="mt-auto text-xl font-bold">{posterState.cta}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
