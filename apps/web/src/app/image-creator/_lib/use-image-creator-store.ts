"use client";

import { create } from "zustand";

type LayerType = "image" | "text" | "shape";

interface BaseLayer {
  id: string;
  type: LayerType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
}

interface ImageLayer extends BaseLayer {
  type: "image";
  src: string;
}

interface TextLayer extends BaseLayer {
  type: "text";
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
}

interface ShapeLayer extends BaseLayer {
  type: "shape";
  shape: "rectangle" | "circle" | "triangle";
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

interface CanvasDocument {
  id: string;
  name: string;
  width: number;
  height: number;
  background: string;
  layers: Array<ImageLayer | TextLayer | ShapeLayer>;
}

interface HistoryState {
  past: CanvasDocument[];
  present: CanvasDocument;
  future: CanvasDocument[];
}

const createEmptyDocument = (
  name = "Untitled",
  width = 1200,
  height = 1200
): CanvasDocument => ({
  id: crypto.randomUUID(),
  name,
  width,
  height,
  background: "#ffffff",
  layers: [],
});

const initializeHistory = (document: CanvasDocument): HistoryState => ({
  past: [],
  present: document,
  future: [],
});

const pushHistory = (
  state: HistoryState,
  nextDocument: CanvasDocument
): HistoryState => ({
  past: [...state.past, state.present],
  present: nextDocument,
  future: [],
});

const historyUndo = (state: HistoryState): HistoryState => {
  if (state.past.length === 0) {
    return state;
  }
  const previous = state.past[state.past.length - 1];
  if (!previous) {
    return state;
  }
  return {
    past: state.past.slice(0, -1),
    present: previous,
    future: [state.present, ...state.future],
  };
};

const historyRedo = (state: HistoryState): HistoryState => {
  if (state.future.length === 0) {
    return state;
  }
  const [next, ...rest] = state.future;
  if (!next) {
    return state;
  }
  return {
    past: [...state.past, state.present],
    present: next,
    future: rest,
  };
};

type NamedLayer = { name: string };

export type CreatorImageLayer = ImageLayer & NamedLayer;
export type CreatorTextLayer = TextLayer & NamedLayer;
export type CreatorShapeLayer = ShapeLayer & NamedLayer;
export type CreatorLayer = CreatorImageLayer | CreatorTextLayer | CreatorShapeLayer;
type CreatorDocument = Omit<CanvasDocument, "layers"> & { layers: CreatorLayer[] };

export type ImageAdjustment = {
  brightness: number;
  contrast: number;
  blur: number;
  grayscale: boolean;
};

export const defaultImageAdjustments: ImageAdjustment = {
  brightness: 0,
  contrast: 0,
  blur: 0,
  grayscale: false,
};

type CreatorHistoryState = Omit<HistoryState, "past" | "present" | "future"> & {
  past: CreatorDocument[];
  present: CreatorDocument;
  future: CreatorDocument[];
};

type ImageCreatorStore = {
  history: CreatorHistoryState;
  document: CreatorDocument;
  selectedLayerId: string | null;
  imageAdjustments: Record<string, ImageAdjustment>;
  canUndo: boolean;
  canRedo: boolean;
  addTextLayer: () => void;
  addRectangleLayer: () => void;
  addImageLayer: (src: string, name?: string) => void;
  removeLayer: (layerId: string) => void;
  selectLayer: (layerId: string | null) => void;
  moveLayer: (layerId: string, x: number, y: number) => void;
  updateLayerText: (layerId: string, text: string) => void;
  setImageAdjustment: (
    layerId: string,
    key: keyof ImageAdjustment,
    value: number | boolean
  ) => void;
  undo: () => void;
  redo: () => void;
};

const baseDocument = createEmptyDocument("image-creator", 1024, 768) as CreatorDocument;
baseDocument.background = "#ffffff";

const initialHistory = initializeHistory(baseDocument) as CreatorHistoryState;

const applyDocument = (
  set: (
    next:
      | Partial<ImageCreatorStore>
      | ((state: ImageCreatorStore) => Partial<ImageCreatorStore>)
  ) => void,
  nextDocument: CreatorDocument
) => {
  set((state) => {
    const nextHistory = pushHistory(state.history, nextDocument) as CreatorHistoryState;
    return {
      history: nextHistory,
      document: nextHistory.present,
      canUndo: nextHistory.past.length > 0,
      canRedo: nextHistory.future.length > 0,
    };
  });
};

export const useImageCreatorStore = create<ImageCreatorStore>((set, get) => ({
  history: initialHistory,
  document: initialHistory.present,
  selectedLayerId: null,
  imageAdjustments: {},
  canUndo: false,
  canRedo: false,
  addTextLayer: () => {
    const current = get().document;
    const newLayer: CreatorTextLayer = {
      id: crypto.randomUUID(),
      type: "text",
      name: "Text layer",
      text: "Edit this text",
      x: 80,
      y: 80,
      width: 280,
      height: 48,
      rotation: 0,
      opacity: 1,
      visible: true,
      fontFamily: "Arial",
      fontSize: 36,
      fontWeight: 600,
      color: "#111827",
    };
    const nextDocument = {
      ...current,
      layers: [...current.layers, newLayer],
    };
    applyDocument(set, nextDocument);
    set({ selectedLayerId: newLayer.id });
  },
  addRectangleLayer: () => {
    const current = get().document;
    const newLayer: CreatorShapeLayer = {
      id: crypto.randomUUID(),
      type: "shape",
      name: "Rectangle",
      shape: "rectangle",
      x: 120,
      y: 120,
      width: 240,
      height: 160,
      rotation: 0,
      opacity: 1,
      visible: true,
      fill: "#22c55e",
      stroke: "#15803d",
      strokeWidth: 0,
    };
    const nextDocument = {
      ...current,
      layers: [...current.layers, newLayer],
    };
    applyDocument(set, nextDocument);
    set({ selectedLayerId: newLayer.id });
  },
  addImageLayer: (src, name = "Image layer") => {
    const current = get().document;
    const newLayer: CreatorImageLayer = {
      id: crypto.randomUUID(),
      type: "image",
      name,
      src,
      x: 140,
      y: 140,
      width: 320,
      height: 320,
      rotation: 0,
      opacity: 1,
      visible: true,
    };
    const nextDocument = {
      ...current,
      layers: [...current.layers, newLayer],
    };
    applyDocument(set, nextDocument);
    set((state) => ({
      selectedLayerId: newLayer.id,
      imageAdjustments: {
        ...state.imageAdjustments,
        [newLayer.id]: defaultImageAdjustments,
      },
    }));
  },
  removeLayer: (layerId) => {
    const current = get().document;
    const nextDocument = {
      ...current,
      layers: current.layers.filter((layer) => layer.id !== layerId),
    };
    applyDocument(set, nextDocument);
    set((state) => {
      const nextAdjustments = { ...state.imageAdjustments };
      delete nextAdjustments[layerId];
      return {
        selectedLayerId: state.selectedLayerId === layerId ? null : state.selectedLayerId,
        imageAdjustments: nextAdjustments,
      };
    });
  },
  selectLayer: (layerId) => set({ selectedLayerId: layerId }),
  moveLayer: (layerId, x, y) => {
    const current = get().document;
    const nextDocument = {
      ...current,
      layers: current.layers.map((layer) =>
        layer.id === layerId ? { ...layer, x, y } : layer
      ),
    };
    applyDocument(set, nextDocument);
  },
  updateLayerText: (layerId, text) => {
    const current = get().document;
    const nextDocument = {
      ...current,
      layers: current.layers.map((layer) =>
        layer.id === layerId && layer.type === "text" ? { ...layer, text } : layer
      ),
    };
    applyDocument(set, nextDocument);
  },
  setImageAdjustment: (layerId, key, value) => {
    set((state) => ({
      imageAdjustments: {
        ...state.imageAdjustments,
        [layerId]: {
          ...(state.imageAdjustments[layerId] ?? defaultImageAdjustments),
          [key]: value,
        },
      },
    }));
  },
  undo: () => {
    set((state) => {
      const nextHistory = historyUndo(state.history) as CreatorHistoryState;
      return {
        history: nextHistory,
        document: nextHistory.present,
        canUndo: nextHistory.past.length > 0,
        canRedo: nextHistory.future.length > 0,
      };
    });
  },
  redo: () => {
    set((state) => {
      const nextHistory = historyRedo(state.history) as CreatorHistoryState;
      return {
        history: nextHistory,
        document: nextHistory.present,
        canUndo: nextHistory.past.length > 0,
        canRedo: nextHistory.future.length > 0,
      };
    });
  },
}));
