import { type TemplateDefinition } from "@fsx/templates";

export type PosterContentBlock = {
  id: string;
  text: string;
};

export type PosterProjectState = {
  selectedTemplateId: string | null;
  title: string;
  subtitle: string;
  cta: string;
  backgroundColor: string;
  textColor: string;
  backgroundImageUrl: string | null;
  blocks: PosterContentBlock[];
};

const createDefaultPosterState = (template?: TemplateDefinition): PosterProjectState => ({
  selectedTemplateId: template?.id ?? null,
  title: template ? `${template.name}` : "Your Poster Title",
  subtitle: "Make your message clear, bold, and immediate.",
  cta: "Register now",
  backgroundColor: "#111827",
  textColor: "#f8fafc",
  backgroundImageUrl: null,
  blocks: [
    { id: "line-1", text: "Date: 25 Aug 2026" },
    { id: "line-2", text: "Location: Main Hall" },
    { id: "line-3", text: "Time: 18:00" },
  ],
});

const sanitizeBlocks = (value: unknown): PosterContentBlock[] => {
  if (!Array.isArray(value)) {
    return createDefaultPosterState().blocks;
  }

  const blocks = value
    .map((item, index) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const candidate = item as Partial<PosterContentBlock>;
      const text = typeof candidate.text === "string" ? candidate.text : "";
      if (!text) {
        return null;
      }
      const id =
        typeof candidate.id === "string" && candidate.id.length > 0
          ? candidate.id
          : `line-${index + 1}`;
      return { id, text, sortIndex: index };
    })
    .filter((item): item is PosterContentBlock & { sortIndex: number } => Boolean(item))
    .sort((a, b) => a.sortIndex - b.sortIndex)
    .map(({ id, text }) => ({ id, text }));

  return blocks.length > 0 ? blocks : createDefaultPosterState().blocks;
};

export const loadPosterProjectState = (
  rawData: string | undefined,
  templates: TemplateDefinition[]
): PosterProjectState => {
  let parsedData: unknown = {};
  if (rawData) {
    try {
      parsedData = JSON.parse(rawData) as unknown;
    } catch {
      parsedData = {};
    }
  }

  const objectData =
    parsedData && typeof parsedData === "object"
      ? (parsedData as Record<string, unknown>)
      : ({} as Record<string, unknown>);
  const templateId =
    typeof objectData.selectedTemplateId === "string" &&
    templates.some((template) => template.id === objectData.selectedTemplateId)
      ? objectData.selectedTemplateId
      : null;
  const selectedTemplate = templates.find((template) => template.id === templateId);
  const fallback = createDefaultPosterState(selectedTemplate);

  return {
    selectedTemplateId: templateId,
    title: typeof objectData.title === "string" ? objectData.title : fallback.title,
    subtitle: typeof objectData.subtitle === "string" ? objectData.subtitle : fallback.subtitle,
    cta: typeof objectData.cta === "string" ? objectData.cta : fallback.cta,
    backgroundColor:
      typeof objectData.backgroundColor === "string"
        ? objectData.backgroundColor
        : fallback.backgroundColor,
    textColor: typeof objectData.textColor === "string" ? objectData.textColor : fallback.textColor,
    backgroundImageUrl:
      typeof objectData.backgroundImageUrl === "string" ? objectData.backgroundImageUrl : null,
    blocks: sanitizeBlocks(objectData.blocks),
  };
};

export const createPosterProjectState = (state: PosterProjectState) => ({
  selectedTemplateId: state.selectedTemplateId,
  title: state.title,
  subtitle: state.subtitle,
  cta: state.cta,
  backgroundColor: state.backgroundColor,
  textColor: state.textColor,
  backgroundImageUrl: state.backgroundImageUrl,
  blocks: state.blocks,
});

export const createPosterStateFromTemplate = (
  templateId: string | null,
  templates: TemplateDefinition[]
): PosterProjectState => {
  const template = templates.find((item) => item.id === templateId);
  return createDefaultPosterState(template);
};
