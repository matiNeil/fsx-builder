import assert from "node:assert/strict";
import test from "node:test";
import type { CreatorDocument } from "@/app/image-creator/_lib/use-image-creator-store";
import { createImageProjectState, loadImageProjectState } from "@/lib/image-project-state";

const baseDocument: CreatorDocument = {
  id: "doc-1",
  name: "image-creator",
  width: 1024,
  height: 768,
  background: "#ffffff",
  layers: [
    {
      id: "layer-1",
      type: "text",
      name: "Headline",
      x: 80,
      y: 80,
      width: 320,
      height: 64,
      rotation: 0,
      opacity: 1,
      visible: true,
      text: "Hello world",
      fontFamily: "Arial",
      fontSize: 36,
      fontWeight: 600,
      color: "#111827",
    },
  ],
};

test("smoke: image project state roundtrip preserves document and adjustments", () => {
  const persisted = createImageProjectState(
    baseDocument,
    "layer-1",
    { "layer-1": { brightness: 0.2, contrast: 10, blur: 0, grayscale: false } }
  );
  const loaded = loadImageProjectState(JSON.stringify(persisted), baseDocument);

  assert.equal(loaded.document.layers.length, 1);
  assert.equal(loaded.selectedLayerId, "layer-1");
  assert.equal(loaded.imageAdjustments["layer-1"]?.contrast, 10);
});

test("smoke: invalid image payload safely falls back to current document", () => {
  const loaded = loadImageProjectState("{\"document\":\"invalid\"}", baseDocument);
  assert.equal(loaded.document.id, baseDocument.id);
  assert.equal(loaded.document.layers.length, baseDocument.layers.length);
});
