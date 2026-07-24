import {
  getWebsiteTemplateCategory,
  type TemplateDefinition,
  type WebsiteTemplateCategory,
} from "@/lib/templates";

export type WebsiteContentBlock = {
  id: string;
  heading: string;
  body: string;
};

export type WebsiteProjectState = {
  selectedTemplateId: string | null;
  searchQuery: string;
  selectedCategory: "All" | WebsiteTemplateCategory;
  contentBlocks: WebsiteContentBlock[];
};

const createDefaultBlocks = (template?: TemplateDefinition): WebsiteContentBlock[] => {
  const templateName = template?.name ?? "Website";
  const idPrefix = template?.id ?? "custom";
  return [
    {
      id: `${idPrefix}-hero`,
      heading: `${templateName} Hero`,
      body: "Write a clear value proposition that explains what this page offers.",
    },
    {
      id: `${idPrefix}-features`,
      heading: "Key Features",
      body: "List core features or services and keep each point concise.",
    },
    {
      id: `${idPrefix}-cta`,
      heading: "Call To Action",
      body: "Add a conversion-focused CTA with one clear next step.",
    },
  ];
};

const sanitizeContentBlocks = (
  value: unknown,
  fallbackTemplate?: TemplateDefinition
): WebsiteContentBlock[] => {
  if (!Array.isArray(value)) {
    return createDefaultBlocks(fallbackTemplate);
  }

  const normalized = value
    .map((block, index) => {
      if (!block || typeof block !== "object") {
        return null;
      }
      const candidate = block as Partial<WebsiteContentBlock>;
      const id = typeof candidate.id === "string" && candidate.id.length > 0 ? candidate.id : null;
      const heading =
        typeof candidate.heading === "string" && candidate.heading.length > 0
          ? candidate.heading
          : null;
      const body = typeof candidate.body === "string" ? candidate.body : "";
      if (!id || !heading) {
        return null;
      }
      return { id, heading, body, sortIndex: index };
    })
    .filter((block): block is WebsiteContentBlock & { sortIndex: number } => Boolean(block))
    .sort((a, b) => a.sortIndex - b.sortIndex)
    .map(({ id, heading, body }) => ({ id, heading, body }));

  return normalized.length > 0 ? normalized : createDefaultBlocks(fallbackTemplate);
};

export const createPersistedWebsiteProjectState = (state: WebsiteProjectState) => ({
  selectedTemplateId: state.selectedTemplateId,
  searchQuery: state.searchQuery,
  selectedCategory: state.selectedCategory,
  contentBlocks: state.contentBlocks,
});

export const loadWebsiteProjectState = (
  rawData: string | undefined,
  templates: TemplateDefinition[]
): WebsiteProjectState => {
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
  const selectedTemplateIdCandidate = objectData.selectedTemplateId;
  const selectedTemplateId =
    typeof selectedTemplateIdCandidate === "string" &&
    templates.some((template) => template.id === selectedTemplateIdCandidate)
      ? selectedTemplateIdCandidate
      : null;
  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId);

  const searchQuery = typeof objectData.searchQuery === "string" ? objectData.searchQuery : "";
  const selectedCategoryCandidate = objectData.selectedCategory;
  const availableCategories = new Set<WebsiteTemplateCategory>(
    templates.map((template) => getWebsiteTemplateCategory(template))
  );
  const selectedCategory =
    selectedCategoryCandidate === "All" ||
    (typeof selectedCategoryCandidate === "string" &&
      availableCategories.has(selectedCategoryCandidate as WebsiteTemplateCategory))
      ? (selectedCategoryCandidate as "All" | WebsiteTemplateCategory)
      : "All";

  return {
    selectedTemplateId,
    searchQuery,
    selectedCategory,
    contentBlocks: sanitizeContentBlocks(objectData.contentBlocks, selectedTemplate),
  };
};

export const createTemplateBackedBlocks = (
  selectedTemplateId: string | null,
  templates: TemplateDefinition[]
): WebsiteContentBlock[] => {
  const template = templates.find((item) => item.id === selectedTemplateId);
  return createDefaultBlocks(template);
};
