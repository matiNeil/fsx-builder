import assert from "node:assert/strict";
import test from "node:test";
import { getTemplatesByType } from "@/lib/templates";
import {
  createPosterProjectState,
  createPosterStateFromTemplate,
  loadPosterProjectState,
} from "@/lib/poster-project-state";

const posterTemplates = getTemplatesByType("poster");

test("smoke: poster state roundtrip preserves selected template and edited content", () => {
  const seedState = createPosterStateFromTemplate(posterTemplates[0]?.id ?? null, posterTemplates);
  seedState.title = "Launch Week";
  seedState.blocks[0] = { id: "line-1", text: "Date: 12 Sep" };

  const persisted = createPosterProjectState(seedState);
  const loaded = loadPosterProjectState(JSON.stringify(persisted), posterTemplates);

  assert.equal(loaded.selectedTemplateId, seedState.selectedTemplateId);
  assert.equal(loaded.title, "Launch Week");
  assert.equal(loaded.blocks[0]?.text, "Date: 12 Sep");
});

test("smoke: invalid poster payload falls back to defaults", () => {
  const loaded = loadPosterProjectState(
    JSON.stringify({
      selectedTemplateId: posterTemplates[1]?.id ?? null,
      blocks: "broken",
    }),
    posterTemplates
  );

  assert.equal(loaded.blocks.length > 0, true);
  assert.equal(typeof loaded.title, "string");
});
