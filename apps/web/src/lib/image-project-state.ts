import {
  defaultImageAdjustments,
  type CreatorDocument,
  type CreatorLayer,
  type ImageAdjustment,
} from "@/app/image-creator/_lib/use-image-creator-store";

export type ImageProjectState = {
  document: CreatorDocument;
  selectedLayerId: string | null;
  imageAdjustments: Record<string, ImageAdjustment>;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object");

const sanitizeLayer = (value: unknown): CreatorLayer | null => {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.type !== "string") {
    return null;
  }

  const base = {
    id: value.id,
    type: value.type,
    name: typeof value.name === "string" ? value.name : "Layer",
    x: typeof value.x === "number" ? value.x : 0,
    y: typeof value.y === "number" ? value.y : 0,
    width: typeof value.width === "number" ? value.width : 100,
    height: typeof value.height === "number" ? value.height : 100,
    rotation: typeof value.rotation === "number" ? value.rotation : 0,
    opacity: typeof value.opacity === "number" ? value.opacity : 1,
    visible: typeof value.visible === "boolean" ? value.visible : true,
  };

  if (value.type === "text") {
    return {
      ...base,
      type: "text",
      text: typeof value.text === "string" ? value.text : "",
      fontFamily: typeof value.fontFamily === "string" ? value.fontFamily : "Arial",
      fontSize: typeof value.fontSize === "number" ? value.fontSize : 32,
      fontWeight: typeof value.fontWeight === "number" ? value.fontWeight : 600,
      color: typeof value.color === "string" ? value.color : "#111827",
    };
  }

  if (value.type === "shape") {
    const shape = value.shape;
    return {
      ...base,
      type: "shape",
      shape: shape === "circle" || shape === "triangle" ? shape : "rectangle",
      fill: typeof value.fill === "string" ? value.fill : "#22c55e",
      stroke: typeof value.stroke === "string" ? value.stroke : "#15803d",
      strokeWidth: typeof value.strokeWidth === "number" ? value.strokeWidth : 0,
    };
  }

  if (value.type === "image") {
    return {
      ...base,
      type: "image",
      src: typeof value.src === "string" ? value.src : "",
    };
  }

  return null;
};

const sanitizeDocument = (value: unknown): CreatorDocument | null => {
  if (!isRecord(value) || !Array.isArray(value.layers)) {
    return null;
  }

  const layers = value.layers.map((layer) => sanitizeLayer(layer)).filter(Boolean) as CreatorLayer[];
  return {
    id: typeof value.id === "string" ? value.id : crypto.randomUUID(),
    name: typeof value.name === "string" ? value.name : "image-creator",
    width: typeof value.width === "number" ? value.width : 1024,
    height: typeof value.height === "number" ? value.height : 768,
    background: typeof value.background === "string" ? value.background : "#ffffff",
    layers,
  };
};

const sanitizeAdjustments = (value: unknown): Record<string, ImageAdjustment> => {
  if (!isRecord(value)) {
    return {};
  }

  const next: Record<string, ImageAdjustment> = {};
  for (const [layerId, rawAdjustment] of Object.entries(value)) {
    if (!isRecord(rawAdjustment)) {
      continue;
    }
    next[layerId] = {
      brightness:
        typeof rawAdjustment.brightness === "number"
          ? rawAdjustment.brightness
          : defaultImageAdjustments.brightness,
      contrast:
        typeof rawAdjustment.contrast === "number"
          ? rawAdjustment.contrast
          : defaultImageAdjustments.contrast,
      blur: typeof rawAdjustment.blur === "number" ? rawAdjustment.blur : defaultImageAdjustments.blur,
      grayscale:
        typeof rawAdjustment.grayscale === "boolean"
          ? rawAdjustment.grayscale
          : defaultImageAdjustments.grayscale,
    };
  }
  return next;
};

export const createImageProjectState = (
  document: CreatorDocument,
  selectedLayerId: string | null,
  imageAdjustments: Record<string, ImageAdjustment>
): ImageProjectState => ({
  document,
  selectedLayerId,
  imageAdjustments,
});

export const loadImageProjectState = (
  rawData: string | undefined,
  fallbackDocument: CreatorDocument
): ImageProjectState => {
  let parsed: unknown = {};
  if (rawData) {
    try {
      parsed = JSON.parse(rawData) as unknown;
    } catch {
      parsed = {};
    }
  }

  const objectData = isRecord(parsed) ? parsed : {};
  const document = sanitizeDocument(objectData.document) ?? fallbackDocument;
  const selectedLayerId =
    typeof objectData.selectedLayerId === "string" ? objectData.selectedLayerId : null;

  return {
    document,
    selectedLayerId,
    imageAdjustments: sanitizeAdjustments(objectData.imageAdjustments),
  };
};
