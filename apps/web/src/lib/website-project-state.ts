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
export type WebsiteBreakpoint = "desktop" | "tablet" | "mobile";

export type WebsiteResponsiveConfig = {
  columns: number;
  contentWidth: number;
  sectionGap: number;
  fontScale: number;
};

export type WebsitePage = {
  id: string;
  title: string;
  slug: string;
  sections: WebsiteContentBlock[];
  responsive: Record<WebsiteBreakpoint, WebsiteResponsiveConfig>;
};

export type WebsiteProjectState = {
  selectedTemplateId: string | null;
  searchQuery: string;
  selectedCategory: "All" | WebsiteTemplateCategory;
  pages: WebsitePage[];
  activePageId: string | null;
  publishedAt?: string | null;
};

const createId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
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
const createDefaultResponsive = (): Record<WebsiteBreakpoint, WebsiteResponsiveConfig> => ({
  desktop: { columns: 1, contentWidth: 960, sectionGap: 24, fontScale: 1 },
  tablet: { columns: 1, contentWidth: 760, sectionGap: 20, fontScale: 0.95 },
  mobile: { columns: 1, contentWidth: 420, sectionGap: 16, fontScale: 0.9 },
});

const sanitizeResponsive = (
  value: unknown
): Record<WebsiteBreakpoint, WebsiteResponsiveConfig> => {
  const fallback = createDefaultResponsive();
  if (!value || typeof value !== "object") {
    return fallback;
  }
  const raw = value as Partial<Record<WebsiteBreakpoint, Partial<WebsiteResponsiveConfig>>>;
  const parse = (
    breakpoint: WebsiteBreakpoint,
    key: keyof WebsiteResponsiveConfig,
    fallbackValue: number
  ) =>
    typeof raw[breakpoint]?.[key] === "number"
      ? Number(raw[breakpoint]?.[key])
      : fallbackValue;

  return {
    desktop: {
      columns: Math.max(1, Math.round(parse("desktop", "columns", fallback.desktop.columns))),
      contentWidth: Math.max(320, parse("desktop", "contentWidth", fallback.desktop.contentWidth)),
      sectionGap: Math.max(8, parse("desktop", "sectionGap", fallback.desktop.sectionGap)),
      fontScale: Math.max(0.6, parse("desktop", "fontScale", fallback.desktop.fontScale)),
    },
    tablet: {
      columns: Math.max(1, Math.round(parse("tablet", "columns", fallback.tablet.columns))),
      contentWidth: Math.max(280, parse("tablet", "contentWidth", fallback.tablet.contentWidth)),
      sectionGap: Math.max(8, parse("tablet", "sectionGap", fallback.tablet.sectionGap)),
      fontScale: Math.max(0.6, parse("tablet", "fontScale", fallback.tablet.fontScale)),
    },
    mobile: {
      columns: Math.max(1, Math.round(parse("mobile", "columns", fallback.mobile.columns))),
      contentWidth: Math.max(240, parse("mobile", "contentWidth", fallback.mobile.contentWidth)),
      sectionGap: Math.max(6, parse("mobile", "sectionGap", fallback.mobile.sectionGap)),
      fontScale: Math.max(0.5, parse("mobile", "fontScale", fallback.mobile.fontScale)),
    },
  };
};

const sanitizePages = (value: unknown, fallbackTemplate?: TemplateDefinition): WebsitePage[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  const defaultResponsive = createDefaultResponsive();
  const pages = value
    .map((page, index) => {
      if (!page || typeof page !== "object") {
        return null;
      }
      const candidate = page as Partial<WebsitePage>;
      const title =
        typeof candidate.title === "string" && candidate.title.trim()
          ? candidate.title.trim()
          : `Page ${index + 1}`;
      const slug =
        typeof candidate.slug === "string" && candidate.slug.trim()
          ? candidate.slug.trim()
          : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "page";
      return {
        id:
          typeof candidate.id === "string" && candidate.id.trim()
            ? candidate.id
            : createId("page"),
        title,
        slug,
        sections: sanitizeContentBlocks(candidate.sections, fallbackTemplate),
        responsive: candidate.responsive
          ? sanitizeResponsive(candidate.responsive)
          : defaultResponsive,
      };
    })
    .filter((page): page is WebsitePage => Boolean(page));
  return pages;
};

export const createTemplateBackedPages = (
  selectedTemplateId: string | null,
  templates: TemplateDefinition[]
): WebsitePage[] => {
  const template = templates.find((item) => item.id === selectedTemplateId);
  return [
    {
      id: createId("page"),
      title: "Home",
      slug: "",
      sections: createDefaultBlocks(template),
      responsive: createDefaultResponsive(),
    },
  ];
};

export const createPersistedWebsiteProjectState = (state: WebsiteProjectState) => ({
  selectedTemplateId: state.selectedTemplateId,
  searchQuery: state.searchQuery,
  selectedCategory: state.selectedCategory,
  pages: state.pages,
  activePageId: state.activePageId,
  publishedAt: state.publishedAt ?? null,
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
  const legacyContentBlocks = sanitizeContentBlocks(objectData.contentBlocks, selectedTemplate);
  const pages = sanitizePages(objectData.pages, selectedTemplate);
  const normalizedPages =
    pages.length > 0
      ? pages
      : [
          {
            id: createId("page"),
            title: "Home",
            slug: "",
            sections: legacyContentBlocks,
            responsive: createDefaultResponsive(),
          },
        ];
  const activePageIdCandidate = objectData.activePageId;
  const activePageId =
    typeof activePageIdCandidate === "string" &&
    normalizedPages.some((page) => page.id === activePageIdCandidate)
      ? activePageIdCandidate
      : (normalizedPages[0]?.id ?? null);

  return {
    selectedTemplateId,
    searchQuery,
    selectedCategory,
    pages: normalizedPages,
    activePageId,
    publishedAt: typeof objectData.publishedAt === "string" ? objectData.publishedAt : null,
  };
};

export const createTemplateBackedBlocks = (
  selectedTemplateId: string | null,
  templates: TemplateDefinition[]
): WebsiteContentBlock[] => {
  return createTemplateBackedPages(selectedTemplateId, templates)[0]?.sections ?? [];
};
