import {
  DEFAULT_WEBSITE_THEME_ID,
  WEBSITE_SECTION_TYPES,
  getWebsiteTemplateCategory,
  getWebsiteTemplateDefinition,
  websiteThemePresets,
  type CatalogItem,
  type CatalogSection,
  type ContactSection,
  type FaqSection,
  type FeaturesSection,
  type FeaturesVariant,
  type FooterSection,
  type GallerySection,
  type HeroSection,
  type PricingSection,
  type StatsSection,
  type TeamSection,
  type TemplateDefinition,
  type TestimonialsSection,
  type WebsiteButtonRef,
  type WebsiteSectionContent,
  type WebsiteSectionType,
  type WebsiteTemplateCategory,
  type WebsiteThemeColors,
} from "@fsx/templates";

export const CURRENT_WEBSITE_SCHEMA_VERSION = 2;

export type WebsiteSectionInstance = { id: string } & WebsiteSectionContent;

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
  sections: WebsiteSectionInstance[];
  responsive: Record<WebsiteBreakpoint, WebsiteResponsiveConfig>;
};

export type WebsiteThemeSelection = {
  presetId: string;
  overrides?: Partial<WebsiteThemeColors>;
};

export type WebsiteProjectState = {
  schemaVersion: number;
  selectedTemplateId: string | null;
  theme: WebsiteThemeSelection;
  searchQuery: string;
  selectedCategory: "All" | WebsiteTemplateCategory;
  pages: WebsitePage[];
  activePageId: string | null;
  publishedAt?: string | null;
};

/** @deprecated v1 shape, kept only to type the legacy migration path. */
type LegacyWebsiteContentBlock = {
  id: string;
  heading: string;
  body: string;
  imageUrl?: string | null;
};

const createId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const slugify = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "page";

// ---------------------------------------------------------------------------
// Default / fallback content
// ---------------------------------------------------------------------------

const createDefaultSections = (template?: TemplateDefinition): WebsiteSectionInstance[] => {
  const templateName = template?.name ?? "Website";
  const idPrefix = template?.id ?? "custom";
  return [
    {
      id: `${idPrefix}-hero`,
      type: "hero",
      heading: `${templateName} Hero`,
      body: "Write a clear value proposition that explains what this page offers.",
      layout: "image-right",
    },
    {
      id: `${idPrefix}-features`,
      type: "features",
      heading: "Key Features",
      items: [
        { title: "Feature one", body: "Describe a core benefit." },
        { title: "Feature two", body: "Describe another core benefit." },
        { title: "Feature three", body: "Describe a third core benefit." },
      ],
    },
    {
      id: `${idPrefix}-cta`,
      type: "cta",
      heading: "Call To Action",
      body: "Add a conversion-focused CTA with one clear next step.",
      primaryCta: { label: "Get started", href: "#" },
    },
  ];
};

const createDefaultResponsive = (): Record<WebsiteBreakpoint, WebsiteResponsiveConfig> => ({
  desktop: { columns: 1, contentWidth: 960, sectionGap: 24, fontScale: 1 },
  tablet: { columns: 1, contentWidth: 760, sectionGap: 20, fontScale: 0.95 },
  mobile: { columns: 1, contentWidth: 420, sectionGap: 16, fontScale: 0.9 },
});

// ---------------------------------------------------------------------------
// Generic sanitize helpers
// ---------------------------------------------------------------------------

const str = (v: unknown, fallback: string): string => (typeof v === "string" ? v : fallback);
const strOpt = (v: unknown): string | undefined => (typeof v === "string" ? v : undefined);
const strOrNull = (v: unknown): string | null =>
  typeof v === "string" ? v : v === null ? null : null;

function sanitizeItems<T>(value: unknown, mapper: (raw: Record<string, unknown>) => T | null): T[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => (item && typeof item === "object" ? mapper(item as Record<string, unknown>) : null))
    .filter((item): item is T => item !== null);
}

const sanitizeButtonRef = (v: unknown): WebsiteButtonRef | undefined => {
  if (!v || typeof v !== "object") {
    return undefined;
  }
  const c = v as Record<string, unknown>;
  const label = strOpt(c.label);
  const href = strOpt(c.href);
  return label && href ? { label, href } : undefined;
};

const sanitizeButtonRefRequired = (v: unknown, fallbackLabel: string, fallbackHref = "#"): WebsiteButtonRef =>
  sanitizeButtonRef(v) ?? { label: fallbackLabel, href: fallbackHref };

const sanitizeLinkList = (v: unknown): { label: string; href: string }[] =>
  sanitizeItems(v, (c) => sanitizeButtonRef(c) ?? null);

// ---------------------------------------------------------------------------
// Per-section-type item sanitizers
// ---------------------------------------------------------------------------

const sanitizeFeatureItems = (v: unknown): FeaturesSection["items"] =>
  sanitizeItems(v, (c) => {
    const title = strOpt(c.title);
    const body = strOpt(c.body);
    return title && body ? { icon: strOpt(c.icon), title, body } : null;
  });

const sanitizeCatalogItems = (v: unknown): CatalogItem[] =>
  sanitizeItems(v, (c) => {
    const title = strOpt(c.title);
    const description = strOpt(c.description);
    return title && description
      ? {
          imageUrl: strOrNull(c.imageUrl),
          title,
          description,
          price: strOpt(c.price),
          meta: strOpt(c.meta),
          ctaLabel: strOpt(c.ctaLabel),
        }
      : null;
  });

const sanitizeGalleryImages = (v: unknown): GallerySection["images"] =>
  sanitizeItems(v, (c) => {
    const url = strOpt(c.url);
    return url ? { url, caption: strOpt(c.caption) } : null;
  });

const sanitizeTestimonialItems = (v: unknown): TestimonialsSection["items"] =>
  sanitizeItems(v, (c) => {
    const quote = strOpt(c.quote);
    const author = strOpt(c.author);
    return quote && author
      ? { quote, author, role: strOpt(c.role), avatarUrl: strOrNull(c.avatarUrl) }
      : null;
  });

const sanitizeStatItems = (v: unknown): StatsSection["items"] =>
  sanitizeItems(v, (c) => {
    const value = strOpt(c.value);
    const label = strOpt(c.label);
    return value && label ? { value, label } : null;
  });

const sanitizeTeamItems = (v: unknown): TeamSection["items"] =>
  sanitizeItems(v, (c) => {
    const name = strOpt(c.name);
    const role = strOpt(c.role);
    return name && role ? { name, role, photoUrl: strOrNull(c.photoUrl), bio: strOpt(c.bio) } : null;
  });

const sanitizePricingTiers = (v: unknown): PricingSection["tiers"] =>
  sanitizeItems(v, (c) => {
    const name = strOpt(c.name);
    const price = strOpt(c.price);
    const ctaLabel = strOpt(c.ctaLabel);
    const features = Array.isArray(c.features) ? c.features.filter((f): f is string => typeof f === "string") : [];
    return name && price && ctaLabel ? { name, price, period: strOpt(c.period), features, ctaLabel } : null;
  });

const sanitizeFaqItems = (v: unknown): FaqSection["items"] =>
  sanitizeItems(v, (c) => {
    const question = strOpt(c.question);
    const answer = strOpt(c.answer);
    return question && answer ? { question, answer } : null;
  });

const sanitizeFooterColumns = (v: unknown): FooterSection["columns"] =>
  sanitizeItems(v, (c) => {
    const heading = strOpt(c.heading);
    return heading ? { heading, links: sanitizeLinkList(c.links) } : null;
  });

const sanitizeBookingFields = (v: unknown): ContactSection["bookingFields"] => {
  if (!v || typeof v !== "object") {
    return undefined;
  }
  const c = v as Record<string, unknown>;
  const checkInLabel = strOpt(c.checkInLabel);
  const checkOutLabel = strOpt(c.checkOutLabel);
  const guestsLabel = strOpt(c.guestsLabel);
  return checkInLabel && checkOutLabel && guestsLabel ? { checkInLabel, checkOutLabel, guestsLabel } : undefined;
};

const HERO_LAYOUTS: HeroSection["layout"][] = ["image-right", "image-left", "background", "center"];
const CATALOG_VARIANTS: CatalogSection["variant"][] = ["products", "listings", "rooms", "menu", "packages"];

// ---------------------------------------------------------------------------
// Section instance sanitization (schemaVersion 2)
// ---------------------------------------------------------------------------

function sanitizeSectionInstance(value: unknown, index: number): WebsiteSectionInstance | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const c = value as Record<string, unknown>;
  const id = typeof c.id === "string" && c.id ? c.id : createId(`section-${index}`);
  const type = c.type;
  if (typeof type !== "string" || !WEBSITE_SECTION_TYPES.includes(type as WebsiteSectionType)) {
    return null;
  }

  switch (type as WebsiteSectionType) {
    case "navbar":
      return {
        id,
        type: "navbar",
        brand: str(c.brand, "Brand"),
        links: sanitizeLinkList(c.links),
        cta: sanitizeButtonRef(c.cta),
      };
    case "hero":
      return {
        id,
        type: "hero",
        eyebrow: strOpt(c.eyebrow),
        heading: str(c.heading, "Welcome"),
        subheading: strOpt(c.subheading),
        body: strOpt(c.body),
        primaryCta: sanitizeButtonRef(c.primaryCta),
        secondaryCta: sanitizeButtonRef(c.secondaryCta),
        imageUrl: strOrNull(c.imageUrl),
        layout: HERO_LAYOUTS.includes(c.layout as HeroSection["layout"])
          ? (c.layout as HeroSection["layout"])
          : "image-right",
      };
    case "about":
      return {
        id,
        type: "about",
        heading: str(c.heading, "About us"),
        body: str(c.body, ""),
        imageUrl: strOrNull(c.imageUrl),
        variant: c.variant === "story" || c.variant === "mission" ? c.variant : undefined,
      };
    case "features":
      return {
        id,
        type: "features",
        heading: str(c.heading, "Features"),
        intro: strOpt(c.intro),
        items: sanitizeFeatureItems(c.items),
        variant: strOpt(c.variant) as FeaturesVariant | undefined,
      };
    case "catalog":
      return {
        id,
        type: "catalog",
        heading: str(c.heading, "Catalog"),
        intro: strOpt(c.intro),
        items: sanitizeCatalogItems(c.items),
        variant: CATALOG_VARIANTS.includes(c.variant as CatalogSection["variant"])
          ? (c.variant as CatalogSection["variant"])
          : "products",
      };
    case "gallery":
      return {
        id,
        type: "gallery",
        heading: strOpt(c.heading),
        images: sanitizeGalleryImages(c.images),
        layout: strOpt(c.layout) as GallerySection["layout"],
      };
    case "testimonials":
      return {
        id,
        type: "testimonials",
        heading: strOpt(c.heading),
        items: sanitizeTestimonialItems(c.items),
      };
    case "stats":
      return { id, type: "stats", heading: strOpt(c.heading), items: sanitizeStatItems(c.items) };
    case "team":
      return { id, type: "team", heading: str(c.heading, "Our team"), items: sanitizeTeamItems(c.items) };
    case "pricing":
      return { id, type: "pricing", heading: str(c.heading, "Pricing"), tiers: sanitizePricingTiers(c.tiers) };
    case "faq":
      return { id, type: "faq", heading: strOpt(c.heading), items: sanitizeFaqItems(c.items) };
    case "cta":
      return {
        id,
        type: "cta",
        heading: str(c.heading, "Ready to get started?"),
        body: strOpt(c.body),
        primaryCta: sanitizeButtonRefRequired(c.primaryCta, "Get started"),
        secondaryCta: sanitizeButtonRef(c.secondaryCta),
      };
    case "contact":
      return {
        id,
        type: "contact",
        heading: str(c.heading, "Contact us"),
        body: strOpt(c.body),
        address: strOpt(c.address),
        phone: strOpt(c.phone),
        email: strOpt(c.email),
        mapEmbedUrl: strOpt(c.mapEmbedUrl),
        variant: c.variant === "booking" ? "booking" : "form",
        bookingFields: sanitizeBookingFields(c.bookingFields),
      };
    case "footer":
      return {
        id,
        type: "footer",
        brand: str(c.brand, "Brand"),
        columns: sanitizeFooterColumns(c.columns),
        socialLinks: sanitizeLinkList(c.socialLinks),
        copyrightText: str(c.copyrightText, `© ${new Date().getFullYear()} All rights reserved.`),
      };
    default:
      return null;
  }
}

const sanitizeSectionInstances = (value: unknown): WebsiteSectionInstance[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item, index) => sanitizeSectionInstance(item, index))
    .filter((section): section is WebsiteSectionInstance => section !== null);
};

// ---------------------------------------------------------------------------
// Legacy (schemaVersion 1) migration
// ---------------------------------------------------------------------------

const sanitizeLegacyContentBlocks = (value: unknown): LegacyWebsiteContentBlock[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((block, index) => {
      if (!block || typeof block !== "object") {
        return null;
      }
      const candidate = block as Partial<LegacyWebsiteContentBlock>;
      const id = typeof candidate.id === "string" && candidate.id.length > 0 ? candidate.id : null;
      const heading =
        typeof candidate.heading === "string" && candidate.heading.length > 0 ? candidate.heading : null;
      const body = typeof candidate.body === "string" ? candidate.body : "";
      const imageUrl = typeof candidate.imageUrl === "string" ? candidate.imageUrl : null;
      if (!id || !heading) {
        return null;
      }
      return { id, heading, body, imageUrl, sortIndex: index };
    })
    .filter(
      (
        block
      ): block is { id: string; heading: string; body: string; imageUrl: string | null; sortIndex: number } =>
        block !== null
    )
    .sort((a, b) => a.sortIndex - b.sortIndex)
    .map(({ id, heading, body, imageUrl }): LegacyWebsiteContentBlock => ({ id, heading, body, imageUrl }));
};

/**
 * Losslessly upgrades v1 flat content blocks to typed sections: a page's
 * first block becomes its hero, every other block becomes a generic "about"
 * section. Nothing is dropped, no manual per-project classification needed.
 */
const migrateLegacyBlocksToSections = (blocks: LegacyWebsiteContentBlock[]): WebsiteSectionInstance[] =>
  blocks.map((block, index): WebsiteSectionInstance => {
    if (index === 0) {
      return {
        id: block.id,
        type: "hero",
        heading: block.heading,
        body: block.body,
        imageUrl: block.imageUrl,
        layout: "image-right",
      };
    }
    return {
      id: block.id,
      type: "about",
      heading: block.heading,
      body: block.body,
      imageUrl: block.imageUrl,
    };
  });

const sanitizeLegacyPages = (value: unknown, fallbackTemplate?: TemplateDefinition): WebsitePage[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  const defaultResponsive = createDefaultResponsive();
  return value
    .map((page, index) => {
      if (!page || typeof page !== "object") {
        return null;
      }
      const candidate = page as Record<string, unknown>;
      const title =
        typeof candidate.title === "string" && candidate.title.trim() ? candidate.title.trim() : `Page ${index + 1}`;
      const slug = typeof candidate.slug === "string" && candidate.slug.trim() ? candidate.slug.trim() : slugify(title);
      const legacyBlocks = sanitizeLegacyContentBlocks(candidate.sections);
      const sections =
        legacyBlocks.length > 0 ? migrateLegacyBlocksToSections(legacyBlocks) : createDefaultSections(fallbackTemplate);
      return {
        id: typeof candidate.id === "string" && candidate.id.trim() ? candidate.id : createId("page"),
        title,
        slug,
        sections,
        responsive: candidate.responsive ? sanitizeResponsive(candidate.responsive) : defaultResponsive,
      };
    })
    .filter((page): page is WebsitePage => Boolean(page));
};

// ---------------------------------------------------------------------------
// schemaVersion 2 pages + responsive
// ---------------------------------------------------------------------------

const sanitizeResponsive = (value: unknown): Record<WebsiteBreakpoint, WebsiteResponsiveConfig> => {
  const fallback = createDefaultResponsive();
  if (!value || typeof value !== "object") {
    return fallback;
  }
  const raw = value as Partial<Record<WebsiteBreakpoint, Partial<WebsiteResponsiveConfig>>>;
  const parse = (breakpoint: WebsiteBreakpoint, key: keyof WebsiteResponsiveConfig, fallbackValue: number) =>
    typeof raw[breakpoint]?.[key] === "number" ? Number(raw[breakpoint]?.[key]) : fallbackValue;

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

const sanitizePagesV2 = (value: unknown, fallbackTemplate?: TemplateDefinition): WebsitePage[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  const defaultResponsive = createDefaultResponsive();
  return value
    .map((page, index) => {
      if (!page || typeof page !== "object") {
        return null;
      }
      const candidate = page as Record<string, unknown>;
      const title =
        typeof candidate.title === "string" && candidate.title.trim() ? candidate.title.trim() : `Page ${index + 1}`;
      const slug = typeof candidate.slug === "string" && candidate.slug.trim() ? candidate.slug.trim() : slugify(title);
      const sections = sanitizeSectionInstances(candidate.sections);
      return {
        id: typeof candidate.id === "string" && candidate.id.trim() ? candidate.id : createId("page"),
        title,
        slug,
        sections: sections.length > 0 ? sections : createDefaultSections(fallbackTemplate),
        responsive: candidate.responsive ? sanitizeResponsive(candidate.responsive) : defaultResponsive,
      };
    })
    .filter((page): page is WebsitePage => Boolean(page));
};

// ---------------------------------------------------------------------------
// Theme selection
// ---------------------------------------------------------------------------

const COLOR_KEYS: (keyof WebsiteThemeColors)[] = [
  "primary",
  "secondary",
  "accent",
  "background",
  "surface",
  "text",
  "textMuted",
  "border",
];

const sanitizeColorOverrides = (value: Record<string, unknown>): Partial<WebsiteThemeColors> | undefined => {
  const result: Partial<WebsiteThemeColors> = {};
  for (const key of COLOR_KEYS) {
    const v = value[key];
    if (typeof v === "string") {
      result[key] = v;
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
};

const resolveDefaultThemeId = (selectedTemplateId: string | null): string => {
  const definition = selectedTemplateId ? getWebsiteTemplateDefinition(selectedTemplateId) : undefined;
  return definition?.defaultThemeId ?? DEFAULT_WEBSITE_THEME_ID;
};

const sanitizeThemeSelection = (value: unknown, selectedTemplateId: string | null): WebsiteThemeSelection => {
  const fallbackPresetId = resolveDefaultThemeId(selectedTemplateId);

  if (!value || typeof value !== "object") {
    return { presetId: fallbackPresetId };
  }
  const c = value as Record<string, unknown>;
  const presetId =
    typeof c.presetId === "string" && websiteThemePresets.some((theme) => theme.id === c.presetId)
      ? c.presetId
      : fallbackPresetId;
  const overrides =
    c.overrides && typeof c.overrides === "object"
      ? sanitizeColorOverrides(c.overrides as Record<string, unknown>)
      : undefined;
  return overrides ? { presetId, overrides } : { presetId };
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Assigns instance ids + default responsive config to raw template page
 * definitions (no ids, as authored in @fsx/templates or returned by
 * /ai/generate-site). Shared by createTemplateBackedPages and the AI
 * site-generation flow so both produce identically-shaped WebsitePage[].
 */
export const instantiateTemplatePages = (
  pages: { title: string; slug: string; sections: WebsiteSectionContent[] }[],
  idPrefix: string
): WebsitePage[] =>
  pages.map((page, pageIndex) => ({
    id: `${idPrefix}-page-${pageIndex}`,
    title: page.title,
    slug: page.slug,
    sections: page.sections.map(
      (section, sectionIndex): WebsiteSectionInstance => ({
        ...section,
        id: `${idPrefix}-section-${pageIndex}-${sectionIndex}`,
      })
    ),
    responsive: createDefaultResponsive(),
  }));

export const createTemplateBackedPages = (
  selectedTemplateId: string | null,
  templates: TemplateDefinition[]
): WebsitePage[] => {
  const template = templates.find((item) => item.id === selectedTemplateId);
  const definition = selectedTemplateId ? getWebsiteTemplateDefinition(selectedTemplateId) : undefined;

  if (definition) {
    return instantiateTemplatePages(definition.pages, createId(selectedTemplateId!));
  }

  return [
    {
      id: createId("page"),
      title: "Home",
      slug: "",
      sections: createDefaultSections(template),
      responsive: createDefaultResponsive(),
    },
  ];
};

export const createPersistedWebsiteProjectState = (state: WebsiteProjectState) => ({
  schemaVersion: CURRENT_WEBSITE_SCHEMA_VERSION,
  selectedTemplateId: state.selectedTemplateId,
  theme: state.theme,
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
    parsedData && typeof parsedData === "object" ? (parsedData as Record<string, unknown>) : ({} as Record<string, unknown>);

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

  const schemaVersion = typeof objectData.schemaVersion === "number" ? objectData.schemaVersion : 1;

  let normalizedPages: WebsitePage[];
  if (schemaVersion >= 2) {
    const pages = sanitizePagesV2(objectData.pages, selectedTemplate);
    normalizedPages = pages.length > 0 ? pages : createTemplateBackedPages(selectedTemplateId, templates);
  } else {
    const legacyPages = sanitizeLegacyPages(objectData.pages, selectedTemplate);
    if (legacyPages.length > 0) {
      normalizedPages = legacyPages;
    } else {
      const legacyContentBlocks = sanitizeLegacyContentBlocks(objectData.contentBlocks);
      normalizedPages =
        legacyContentBlocks.length > 0
          ? [
              {
                id: createId("page"),
                title: "Home",
                slug: "",
                sections: migrateLegacyBlocksToSections(legacyContentBlocks),
                responsive: createDefaultResponsive(),
              },
            ]
          : createTemplateBackedPages(selectedTemplateId, templates);
    }
  }

  const activePageIdCandidate = objectData.activePageId;
  const activePageId =
    typeof activePageIdCandidate === "string" && normalizedPages.some((page) => page.id === activePageIdCandidate)
      ? activePageIdCandidate
      : (normalizedPages[0]?.id ?? null);

  const theme = sanitizeThemeSelection(objectData.theme, selectedTemplateId);

  return {
    schemaVersion: CURRENT_WEBSITE_SCHEMA_VERSION,
    selectedTemplateId,
    theme,
    searchQuery,
    selectedCategory,
    pages: normalizedPages,
    activePageId,
    publishedAt: typeof objectData.publishedAt === "string" ? objectData.publishedAt : null,
  };
};
