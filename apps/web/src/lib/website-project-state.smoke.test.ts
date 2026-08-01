import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_WEBSITE_THEME_ID, getTemplatesByType, getWebsiteTemplateDefinition } from "@fsx/templates";
import {
  createPersistedWebsiteProjectState,
  createTemplateBackedPages,
  loadWebsiteProjectState,
  type WebsiteSectionInstance,
} from "@/lib/website-project-state";

const websiteTemplates = getTemplatesByType("website");

test("smoke: v1 legacy content blocks migrate — first block becomes hero, rest become about", () => {
  const loaded = loadWebsiteProjectState(
    JSON.stringify({
      selectedTemplateId: null,
      pages: [
        {
          id: "page-home",
          title: "Home",
          slug: "",
          sections: [
            { id: "legacy-hero", heading: "Legacy Hero", body: "Legacy Body", imageUrl: "https://example.com/a.png" },
            { id: "legacy-features", heading: "Legacy Features", body: "Legacy Features Body" },
          ],
        },
      ],
      activePageId: "page-home",
    }),
    websiteTemplates
  );

  assert.equal(loaded.schemaVersion, 2);
  assert.equal(loaded.pages.length, 1);
  const [first, second] = loaded.pages[0]!.sections;
  assert.equal(first!.type, "hero");
  assert.equal(first!.id, "legacy-hero");
  assert.equal((first as Extract<WebsiteSectionInstance, { type: "hero" }>).heading, "Legacy Hero");
  assert.equal((first as Extract<WebsiteSectionInstance, { type: "hero" }>).imageUrl, "https://example.com/a.png");
  assert.equal(second!.type, "about");
  assert.equal((second as Extract<WebsiteSectionInstance, { type: "about" }>).heading, "Legacy Features");
});

test("smoke: v1 legacy flat contentBlocks (pre-multi-page) migrate to a single home page", () => {
  const loaded = loadWebsiteProjectState(
    JSON.stringify({
      selectedTemplateId: null,
      contentBlocks: [
        { id: "legacy-hero", heading: "Legacy Hero", body: "Legacy Body" },
        { id: "legacy-cta", heading: "Legacy CTA", body: "Legacy CTA Body" },
      ],
    }),
    websiteTemplates
  );

  assert.equal(loaded.pages.length, 1);
  assert.equal(loaded.pages[0]?.title, "Home");
  assert.equal(loaded.pages[0]?.sections.length, 2);
  assert.equal(loaded.pages[0]?.sections[0]?.type, "hero");
  assert.equal(loaded.pages[0]?.sections[1]?.type, "about");
});

test("smoke: v2 sections round-trip through persist + load unchanged", () => {
  const selectedTemplateId = websiteTemplates[0]?.id ?? null;
  const pages = [
    {
      id: "page-home",
      title: "Home",
      slug: "",
      sections: [
        {
          id: "hero-1",
          type: "hero" as const,
          heading: "Welcome",
          body: "A great hero body",
          layout: "image-right" as const,
        },
        {
          id: "features-1",
          type: "features" as const,
          heading: "Why choose us",
          items: [{ title: "Fast", body: "Very fast" }],
        },
      ],
      responsive: {
        desktop: { columns: 1, contentWidth: 1024, sectionGap: 30, fontScale: 1 },
        tablet: { columns: 1, contentWidth: 768, sectionGap: 20, fontScale: 0.95 },
        mobile: { columns: 1, contentWidth: 420, sectionGap: 16, fontScale: 0.9 },
      },
    },
  ];

  const persisted = createPersistedWebsiteProjectState({
    schemaVersion: 2,
    selectedTemplateId,
    theme: { presetId: "luxury-dark" },
    searchQuery: "",
    selectedCategory: "All",
    pages,
    activePageId: "page-home",
    publishedAt: null,
  });
  const loaded = loadWebsiteProjectState(JSON.stringify(persisted), websiteTemplates);

  assert.equal(loaded.schemaVersion, 2);
  assert.equal(loaded.theme.presetId, "luxury-dark");
  assert.equal(loaded.pages[0]?.sections.length, 2);
  const [hero, features] = loaded.pages[0]!.sections;
  assert.equal(hero!.type, "hero");
  assert.equal((hero as Extract<WebsiteSectionInstance, { type: "hero" }>).heading, "Welcome");
  assert.equal(features!.type, "features");
  assert.equal((features as Extract<WebsiteSectionInstance, { type: "features" }>).items.length, 1);
});

test("smoke: v2 payload with an unknown section type drops it but keeps valid sections", () => {
  const loaded = loadWebsiteProjectState(
    JSON.stringify({
      schemaVersion: 2,
      selectedTemplateId: null,
      pages: [
        {
          id: "page-home",
          title: "Home",
          slug: "",
          sections: [
            { id: "bad", type: "not-a-real-type", heading: "Nope" },
            { id: "good", type: "cta", heading: "Get started", primaryCta: { label: "Go", href: "/go" } },
          ],
        },
      ],
      activePageId: "page-home",
    }),
    websiteTemplates
  );

  assert.equal(loaded.pages[0]?.sections.length, 1);
  assert.equal(loaded.pages[0]?.sections[0]?.id, "good");
  assert.equal(loaded.pages[0]?.sections[0]?.type, "cta");
});

test("smoke: theme falls back to the global default when no template default is registered", () => {
  const loaded = loadWebsiteProjectState(
    JSON.stringify({ selectedTemplateId: "website-nonprofit", pages: [] }),
    websiteTemplates
  );
  assert.equal(loaded.theme.presetId, DEFAULT_WEBSITE_THEME_ID);
});

test("smoke: theme defaults to the template's registered theme when available", () => {
  const definition = getWebsiteTemplateDefinition("website-corporate");
  if (!definition) {
    return;
  }
  const loaded = loadWebsiteProjectState(
    JSON.stringify({ selectedTemplateId: "website-corporate", pages: [] }),
    websiteTemplates
  );
  assert.equal(loaded.theme.presetId, definition.defaultThemeId);
});

test("smoke: createTemplateBackedPages falls back to a generic single page for templates without rich content", () => {
  const templateId = websiteTemplates.find((template) => !getWebsiteTemplateDefinition(template.id))?.id ?? null;
  const pages = createTemplateBackedPages(templateId, websiteTemplates);
  assert.equal(pages.length, 1);
  assert.equal(pages[0]?.sections.length, 3);
});

test("smoke: registered template definitions produce real multi-page sites", () => {
  const definition = getWebsiteTemplateDefinition("website-corporate");
  if (!definition) {
    return;
  }
  const pages = createTemplateBackedPages("website-corporate", websiteTemplates);
  assert.ok(pages.length >= 1);
  assert.ok(pages[0]!.sections.length > 0);
  assert.equal(pages[0]!.sections[0]!.type, "navbar");
});
