export type LayerType = "image" | "text" | "shape" | "group";

export interface BaseLayer {
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

export interface ImageLayer extends BaseLayer {
  type: "image";
  src: string;
}

export interface TextLayer extends BaseLayer {
  type: "text";
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
}

export interface ShapeLayer extends BaseLayer {
  type: "shape";
  shape: "rectangle" | "circle" | "triangle";
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface GroupLayer extends BaseLayer {
  type: "group";
  children: string[];
}

export type Layer = ImageLayer | TextLayer | ShapeLayer | GroupLayer;

export interface CanvasDocument {
  id: string;
  name: string;
  width: number;
  height: number;
  background: string;
  layers: Layer[];
}

export interface HistoryState {
  past: CanvasDocument[];
  present: CanvasDocument;
  future: CanvasDocument[];
}

export const createEmptyDocument = (
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

export const initializeHistory = (document: CanvasDocument): HistoryState => ({
  past: [],
  present: document,
  future: [],
});

export const pushHistory = (
  state: HistoryState,
  nextDocument: CanvasDocument
): HistoryState => ({
  past: [...state.past, state.present],
  present: nextDocument,
  future: [],
});

export const undo = (state: HistoryState): HistoryState => {
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

export const redo = (state: HistoryState): HistoryState => {
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

export const exportDocumentAsPng = async (
  stageToDataUrl: () => string,
  downloadName = "canvas-export.png"
): Promise<void> => {
  const dataUrl = stageToDataUrl();
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = downloadName;
  link.click();
};
