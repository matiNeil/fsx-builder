import assert from "node:assert/strict";
import test from "node:test";
import { getTemplatesByType } from "@/lib/templates";
import {
  createPersistedWebsiteProjectState,
  createTemplateBackedPages,
  loadWebsiteProjectState,
} from "@/lib/website-project-state";

const websiteTemplates = getTemplatesByType("website");

test("smoke: loading saved project restores selected template and page data", () => {
  const selectedTemplateId = websiteTemplates[0]?.id ?? null;
  const savedState = JSON.stringify({
    selectedTemplateId,
    searchQuery: "landing",
    selectedCategory: "Technology",
    pages: [
      {
        id: "page-home",
        title: "Home",
        slug: "",
        sections: [
          {
            id: "hero",
            heading: "Hero title",
            body: "Hero body",
          },
          {
            id: "cta",
            heading: "CTA title",
            body: "CTA body",
          },
        ],
        responsive: {
          desktop: { columns: 1, contentWidth: 1024, sectionGap: 30, fontScale: 1 },
          tablet: { columns: 1, contentWidth: 768, sectionGap: 20, fontScale: 0.95 },
          mobile: { columns: 1, contentWidth: 420, sectionGap: 16, fontScale: 0.9 },
        },
      },
    ],
    activePageId: "page-home",
    publishedAt: "2026-07-24T10:00:00.000Z",
  });

  const loaded = loadWebsiteProjectState(savedState, websiteTemplates);

  assert.equal(loaded.selectedTemplateId, selectedTemplateId);
  assert.equal(loaded.searchQuery, "landing");
  assert.equal(loaded.selectedCategory, "Technology");
  assert.equal(loaded.pages.length, 1);
  assert.equal(loaded.pages[0]?.sections.length, 2);
  assert.equal(loaded.pages[0]?.sections[0]?.heading, "Hero title");
  assert.equal(loaded.activePageId, "page-home");
  assert.equal(loaded.publishedAt, "2026-07-24T10:00:00.000Z");
});

test("smoke: invalid saved pages payload falls back to template-backed default page", () => {
  const selectedTemplateId = websiteTemplates[1]?.id ?? null;
  const loaded = loadWebsiteProjectState(
    JSON.stringify({
      selectedTemplateId,
      pages: "invalid",
    }),
    websiteTemplates
  );

  assert.equal(loaded.selectedTemplateId, selectedTemplateId);
  assert.equal(loaded.pages.length, 1);
  assert.equal(loaded.pages[0]?.sections.length, 3);
  assert.match(loaded.pages[0]?.sections[0]?.id ?? "", new RegExp(`^${selectedTemplateId}`));
});

test("smoke: persisted payload keeps edited page sections and template reference", () => {
  const selectedTemplateId = websiteTemplates[2]?.id ?? null;
  const pages = createTemplateBackedPages(selectedTemplateId, websiteTemplates);
  const editedPages = pages.map((page, index) =>
    index === 0
      ? {
          ...page,
          title: "Homepage",
          sections: page.sections.map((section, sectionIndex) =>
            sectionIndex === 0
              ? {
                  ...section,
                  heading: "Updated hero",
                }
              : section
          ),
        }
      : page
  );

  const persisted = createPersistedWebsiteProjectState({
    selectedTemplateId,
    searchQuery: "",
    selectedCategory: "All",
    pages: editedPages,
    activePageId: editedPages[0]?.id ?? null,
    publishedAt: null,
  });
  const loaded = loadWebsiteProjectState(JSON.stringify(persisted), websiteTemplates);

  assert.equal(loaded.selectedTemplateId, selectedTemplateId);
  assert.equal(loaded.pages[0]?.sections[0]?.heading, "Updated hero");
  assert.equal(loaded.pages[0]?.title, "Homepage");
  assert.equal(loaded.pages.length, editedPages.length);
});

test("smoke: legacy contentBlocks payload maps to home page sections", () => {
  const loaded = loadWebsiteProjectState(
    JSON.stringify({
      selectedTemplateId: websiteTemplates[0]?.id ?? null,
      contentBlocks: [
        { id: "legacy-hero", heading: "Legacy Hero", body: "Legacy Body" },
        { id: "legacy-cta", heading: "Legacy CTA", body: "Legacy CTA Body" },
      ],
    }),
    websiteTemplates
  );

  assert.equal(loaded.pages.length, 1);
  assert.equal(loaded.pages[0]?.title, "Home");
  assert.equal(loaded.pages[0]?.sections[0]?.heading, "Legacy Hero");
  assert.equal(loaded.pages[0]?.sections.length, 2);
});

test("smoke: flagship template produces multiple real pages with imagery", () => {
  const pages = createTemplateBackedPages("website-corporate", websiteTemplates);

  assert.ok(pages.length > 1, "flagship template should create more than one page");
  assert.equal(pages[0]?.title, "Home");
  assert.ok(pages.some((page) => page.slug === "about"));
  assert.ok(pages.some((page) => page.slug === "contact"));
  assert.notEqual(pages[0]?.sections[0]?.heading, "Corporate Hero");
  assert.match(pages[0]?.sections[0]?.imageUrl ?? "", /^https:\/\/picsum\.photos\//);
});
