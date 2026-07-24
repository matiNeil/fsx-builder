import assert from "node:assert/strict";
import test from "node:test";
import { getTemplatesByType } from "@/lib/templates";
import {
  createPersistedWebsiteProjectState,
  createTemplateBackedBlocks,
  loadWebsiteProjectState,
} from "@/lib/website-project-state";

const websiteTemplates = getTemplatesByType("website");

test("smoke: loading saved project restores selected template and content blocks", () => {
  const selectedTemplateId = websiteTemplates[0]?.id ?? null;
  const savedState = JSON.stringify({
    selectedTemplateId,
    searchQuery: "landing",
    selectedCategory: "Technology",
    contentBlocks: [
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
  });

  const loaded = loadWebsiteProjectState(savedState, websiteTemplates);

  assert.equal(loaded.selectedTemplateId, selectedTemplateId);
  assert.equal(loaded.searchQuery, "landing");
  assert.equal(loaded.selectedCategory, "Technology");
  assert.equal(loaded.contentBlocks.length, 2);
  assert.equal(loaded.contentBlocks[0]?.heading, "Hero title");
});

test("smoke: invalid saved payload falls back to template-backed default blocks", () => {
  const selectedTemplateId = websiteTemplates[1]?.id ?? null;
  const loaded = loadWebsiteProjectState(
    JSON.stringify({
      selectedTemplateId,
      contentBlocks: "invalid",
    }),
    websiteTemplates
  );

  assert.equal(loaded.selectedTemplateId, selectedTemplateId);
  assert.equal(loaded.contentBlocks.length, 3);
  assert.match(loaded.contentBlocks[0]?.id ?? "", new RegExp(`^${selectedTemplateId}`));
});

test("smoke: persisted payload keeps edited blocks and template reference", () => {
  const selectedTemplateId = websiteTemplates[2]?.id ?? null;
  const editedBlocks = createTemplateBackedBlocks(selectedTemplateId, websiteTemplates).map(
    (block, index) =>
      index === 0
        ? {
            ...block,
            heading: "Updated hero",
          }
        : block
  );

  const persisted = createPersistedWebsiteProjectState({
    selectedTemplateId,
    searchQuery: "",
    selectedCategory: "All",
    contentBlocks: editedBlocks,
  });
  const loaded = loadWebsiteProjectState(JSON.stringify(persisted), websiteTemplates);

  assert.equal(loaded.selectedTemplateId, selectedTemplateId);
  assert.equal(loaded.contentBlocks[0]?.heading, "Updated hero");
  assert.equal(loaded.contentBlocks.length, editedBlocks.length);
});
