import { z } from "zod";
import {
  templatePresets,
  websiteThemePresets,
  websiteTemplateDefinitions,
  type WebsiteSectionContent,
  type WebsiteTemplateDefinition,
  type WebsiteTemplatePageDefinition,
} from "@fsx/templates";

export type SiteSelection = { templateId: string; themeId: string };

type Logger = { warn: (obj: unknown, msg?: string) => void };

/**
 * Section types the AI is allowed to rewrite — copy/branding only. Deliberately
 * excludes stats, team, faq, testimonials, catalog items, and contact details:
 * those carry specific factual claims (named employees, prices, policies,
 * reviews) that would be fabricated if written about a business the model has
 * never interacted with.
 */
const COPY_EDITABLE_TYPES = new Set(["navbar", "hero", "about", "features", "cta", "footer"]);

const heroCopySchema = z.object({
  eyebrow: z.string().max(80).optional(),
  heading: z.string().min(1).max(120),
  subheading: z.string().max(200).optional(),
  body: z.string().max(500).optional(),
});
const aboutCopySchema = z.object({
  heading: z.string().min(1).max(120),
  body: z.string().min(1).max(800),
});
const featuresCopySchema = z.object({
  heading: z.string().min(1).max(120),
  intro: z.string().max(300).optional(),
  items: z
    .array(z.object({ title: z.string().min(1).max(80), body: z.string().min(1).max(300) }))
    .max(8)
    .optional(),
});
const ctaCopySchema = z.object({
  heading: z.string().min(1).max(120),
  body: z.string().max(300).optional(),
});
const navbarCopySchema = z.object({ brand: z.string().min(1).max(60) });
const footerCopySchema = z.object({
  brand: z.string().min(1).max(60),
  copyrightText: z.string().min(1).max(150).optional(),
});

const COPY_SCHEMA_BY_TYPE: Record<string, z.ZodTypeAny> = {
  navbar: navbarCopySchema,
  hero: heroCopySchema,
  about: aboutCopySchema,
  features: featuresCopySchema,
  cta: ctaCopySchema,
  footer: footerCopySchema,
};

const extractCurrentCopy = (section: WebsiteSectionContent): Record<string, unknown> => {
  switch (section.type) {
    case "navbar":
      return { brand: section.brand };
    case "hero":
      return { eyebrow: section.eyebrow, heading: section.heading, subheading: section.subheading, body: section.body };
    case "about":
      return { heading: section.heading, body: section.body };
    case "features":
      return { heading: section.heading, intro: section.intro, items: section.items };
    case "cta":
      return { heading: section.heading, body: section.body };
    case "footer":
      return { brand: section.brand, copyrightText: section.copyrightText };
    default:
      return {};
  }
};

export const listSelectableTemplates = () =>
  templatePresets
    .filter((template) => template.id in websiteTemplateDefinitions)
    .map((template) => ({
      id: template.id,
      name: template.name,
      category: template.category ?? "Business",
      description: template.description,
    }));

export const listSelectableThemes = () =>
  websiteThemePresets.map((theme) => ({
    id: theme.id,
    name: theme.name,
    vibe: `${theme.buttonStyle} buttons, ${theme.spacing} spacing, primary ${theme.colors.primary}, secondary ${theme.colors.secondary}`,
  }));

async function callOpenAiJson(
  apiKey: string,
  messages: { role: "system" | "user"; content: string }[],
  options: { temperature: number; maxTokens: number }
): Promise<Record<string, unknown> | null> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const result = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const raw = result.choices?.[0]?.message?.content;
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function selectTemplateAndTheme(apiKey: string, description: string): Promise<SiteSelection | null> {
  const templates = listSelectableTemplates();
  const themes = listSelectableThemes();

  const parsed = await callOpenAiJson(
    apiKey,
    [
      {
        role: "system",
        content:
          'You pick the best-fit website template and color theme for a business description. ' +
          'Respond with strict JSON: {"templateId": string, "themeId": string}. Only use ids from the provided lists.',
      },
      {
        role: "user",
        content: `Business description: ${description}\n\nAvailable templates:\n${JSON.stringify(
          templates
        )}\n\nAvailable themes:\n${JSON.stringify(themes)}`,
      },
    ],
    { temperature: 0.3, maxTokens: 100 }
  );

  const templateId = typeof parsed?.templateId === "string" ? parsed.templateId : undefined;
  const themeId = typeof parsed?.themeId === "string" ? parsed.themeId : undefined;

  return {
    templateId: templateId && templates.some((t) => t.id === templateId) ? templateId : (templates[0]?.id ?? ""),
    themeId: themeId && themes.some((t) => t.id === themeId) ? themeId : (themes[0]?.id ?? ""),
  };
}

type FlatSectionRef = { pageIndex: number; sectionIndex: number; type: string };

const flattenEditableSections = (definition: WebsiteTemplateDefinition): FlatSectionRef[] => {
  const refs: FlatSectionRef[] = [];
  definition.pages.forEach((page, pageIndex) => {
    page.sections.forEach((section, sectionIndex) => {
      if (COPY_EDITABLE_TYPES.has(section.type)) {
        refs.push({ pageIndex, sectionIndex, type: section.type });
      }
    });
  });
  return refs;
};

/**
 * Overlays AI-written copy onto a deep copy of the template's seed pages.
 * Never fails the whole request — any section the model omits, or whose JSON
 * doesn't validate against that section's copy schema, silently keeps its
 * original template seed copy.
 */
export async function generateWebsiteContent(
  apiKey: string,
  description: string,
  definition: WebsiteTemplateDefinition,
  logger: Logger
): Promise<WebsiteTemplatePageDefinition[]> {
  const pages: WebsiteTemplatePageDefinition[] = definition.pages.map((page) => ({
    ...page,
    sections: page.sections.map((section) => ({ ...section })),
  }));

  const refs = flattenEditableSections(definition);
  if (refs.length === 0) {
    return pages;
  }

  const promptSections = refs.map((ref, index) => ({
    index,
    type: ref.type,
    current: extractCurrentCopy(definition.pages[ref.pageIndex]!.sections[ref.sectionIndex]!),
  }));

  const parsed = await callOpenAiJson(
    apiKey,
    [
      {
        role: "system",
        content:
          "You write real marketing copy for a small business website, replacing placeholder template copy. " +
          "You are given a list of sections with their type and current placeholder content. " +
          'Respond with strict JSON: {"sections": [{"index": number, ...fields matching that section\'s current content}]}. ' +
          "Only include the fields already present in each section's current content — never add a type field, " +
          "never invent new sections, never write fabricated statistics, named employees, testimonials, prices, or contact details.",
      },
      { role: "user", content: `Business description: ${description}\n\nSections:\n${JSON.stringify(promptSections)}` },
    ],
    { temperature: 0.7, maxTokens: 1500 }
  );

  const rawSections = Array.isArray(parsed?.sections) ? (parsed!.sections as unknown[]) : [];

  for (const rawSection of rawSections) {
    if (!rawSection || typeof rawSection !== "object") {
      continue;
    }
    const candidate = rawSection as Record<string, unknown>;
    const index = candidate.index;
    if (typeof index !== "number" || !refs[index]) {
      continue;
    }
    const ref = refs[index];
    const schema = COPY_SCHEMA_BY_TYPE[ref.type];
    if (!schema) {
      continue;
    }
    const validation = schema.safeParse(candidate);
    if (!validation.success) {
      logger.warn(
        { index, type: ref.type, issues: validation.error.issues },
        "Discarding invalid AI section copy, keeping template default"
      );
      continue;
    }
    Object.assign(pages[ref.pageIndex]!.sections[ref.sectionIndex]!, validation.data);
  }

  return pages;
}
