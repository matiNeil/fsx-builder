"use client";

import Konva from "konva";
import { useMemo, useRef, useState } from "react";
import useImage from "use-image";
import { Image as KonvaImage, Layer, Rect, Stage, Text } from "react-konva";
import type { Filter } from "konva/lib/Node";
import { exportDocumentAsPng } from "@fsx/canvas-engine";
import {
  defaultImageAdjustments,
  useImageCreatorStore,
  type CreatorLayer,
  type ImageAdjustment,
} from "./_lib/use-image-creator-store";

function ImageLayerNode({
  layer,
  selected,
  adjustments,
  onSelect,
  onDragEnd,
}: {
  layer: Extract<CreatorLayer, { type: "image" }>;
  selected: boolean;
  adjustments: ImageAdjustment;
  onSelect: () => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}) {
  const [image] = useImage(layer.src, "anonymous");
  const imageRef = useRef<Konva.Image>(null);
  const filters = useMemo(() => {
    const active: Filter[] = [];
    if (adjustments.brightness !== 0) {
      active.push(Konva.Filters.Brighten as Filter);
    }
    if (adjustments.contrast !== 0) {
      active.push(Konva.Filters.Contrast as Filter);
    }
    if (adjustments.blur > 0) {
      active.push(Konva.Filters.Blur as Filter);
    }
    if (adjustments.grayscale) {
      active.push(Konva.Filters.Grayscale as Filter);
    }
    return active;
  }, [adjustments]);

  return (
    <KonvaImage
      ref={imageRef}
      image={image}
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      rotation={layer.rotation}
      opacity={layer.opacity}
      draggable
      stroke={selected ? "#2563eb" : undefined}
      strokeWidth={selected ? 2 : 0}
      filters={filters}
      brightness={adjustments.brightness}
      contrast={adjustments.contrast}
      blurRadius={adjustments.blur}
      onMouseDown={onSelect}
      onTap={onSelect}
      onDragEnd={(event) => onDragEnd(layer.id, event.target.x(), event.target.y())}
    />
  );
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

export default function ImageCreatorPage() {
  const stageRef = useRef<Konva.Stage>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [aiPrompt, setAiPrompt] = useState("A vibrant tech event poster style background");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const {
    document,
    selectedLayerId,
    history,
    imageAdjustments,
    canUndo,
    canRedo,
    addTextLayer,
    addRectangleLayer,
    addImageLayer,
    removeLayer,
    selectLayer,
    moveLayer,
    updateLayerText,
    setImageAdjustment,
    undo,
    redo,
  } = useImageCreatorStore();

  const selectedLayer = document.layers.find((layer) => layer.id === selectedLayerId);

  const onUploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        addImageLayer(result, file.name);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const onGenerateAiImage = async () => {
    if (!aiPrompt.trim()) {
      setAiError("Enter a prompt first.");
      return;
    }

    setIsGenerating(true);
    setAiError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/ai/generate-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: aiPrompt.trim(),
          size: "1024x1024",
        }),
      });

      const payload = (await response.json()) as { imageDataUrl?: string; message?: string };
      if (!response.ok || !payload.imageDataUrl) {
        throw new Error(payload.message ?? "Image generation failed.");
      }
      addImageLayer(payload.imageDataUrl, "AI Generated");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Image generation failed.";
      setAiError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const onExportPng = async () => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }
    await exportDocumentAsPng(() => stage.toDataURL({ pixelRatio: 2 }), `${document.name}.png`);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-6 py-8 sm:px-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Image Creator</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Layer-based canvas editor with templates, filters, text tools, and AI image generation.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_280px]">
        <aside className="space-y-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">Tools</h2>
          <div className="grid gap-2">
            <button className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900" onClick={addTextLayer}>
              Add text
            </button>
            <button className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900" onClick={addRectangleLayer}>
              Add shape
            </button>
            <button
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload image
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onUploadImage} />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">AI Image</h3>
            <textarea
              value={aiPrompt}
              onChange={(event) => setAiPrompt(event.target.value)}
              className="h-24 w-full rounded-md border border-zinc-300 bg-transparent p-2 text-sm dark:border-zinc-700"
              placeholder="Describe the image you want..."
            />
            <button
              className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isGenerating}
              onClick={onGenerateAiImage}
            >
              {isGenerating ? "Generating..." : "Generate with AI"}
            </button>
            {aiError ? <p className="text-xs text-red-500">{aiError}</p> : null}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-zinc-700"
              disabled={!canUndo}
              onClick={undo}
            >
              Undo
            </button>
            <button
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-zinc-700"
              disabled={!canRedo}
              onClick={redo}
            >
              Redo
            </button>
          </div>

          <button className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700" onClick={onExportPng}>
            Export PNG
          </button>

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            History: {history.past.length} undo / {history.future.length} redo
          </p>
        </aside>

        <section className="overflow-auto rounded-xl border border-zinc-200 bg-zinc-100 p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto w-fit rounded-md border border-zinc-300 bg-white shadow dark:border-zinc-700">
            <Stage ref={stageRef} width={document.width} height={document.height}>
              <Layer>
                <Rect x={0} y={0} width={document.width} height={document.height} fill={document.background} />
                {document.layers.map((layer) => {
                  if (layer.type === "text") {
                    return (
                      <Text
                        key={layer.id}
                        x={layer.x}
                        y={layer.y}
                        text={layer.text}
                        fontSize={layer.fontSize}
                        fontFamily={layer.fontFamily}
                        fontStyle={layer.fontWeight >= 600 ? "bold" : "normal"}
                        fill={layer.color}
                        width={layer.width}
                        rotation={layer.rotation}
                        opacity={layer.opacity}
                        draggable
                        stroke={selectedLayerId === layer.id ? "#2563eb" : undefined}
                        strokeWidth={selectedLayerId === layer.id ? 1 : 0}
                        onMouseDown={() => selectLayer(layer.id)}
                        onTap={() => selectLayer(layer.id)}
                        onDragEnd={(event) => moveLayer(layer.id, event.target.x(), event.target.y())}
                      />
                    );
                  }
                  if (layer.type === "shape") {
                    return (
                      <Rect
                        key={layer.id}
                        x={layer.x}
                        y={layer.y}
                        width={layer.width}
                        height={layer.height}
                        fill={layer.fill}
                        stroke={selectedLayerId === layer.id ? "#2563eb" : layer.stroke}
                        strokeWidth={selectedLayerId === layer.id ? 2 : layer.strokeWidth ?? 0}
                        rotation={layer.rotation}
                        opacity={layer.opacity}
                        draggable
                        onMouseDown={() => selectLayer(layer.id)}
                        onTap={() => selectLayer(layer.id)}
                        onDragEnd={(event) => moveLayer(layer.id, event.target.x(), event.target.y())}
                      />
                    );
                  }
                  if (layer.type === "image") {
                    return (
                      <ImageLayerNode
                        key={layer.id}
                        layer={layer}
                        selected={selectedLayerId === layer.id}
                        adjustments={imageAdjustments[layer.id] ?? defaultImageAdjustments}
                        onSelect={() => selectLayer(layer.id)}
                        onDragEnd={moveLayer}
                      />
                    );
                  }
                  return null;
                })}
              </Layer>
            </Stage>
          </div>
        </section>

        <aside className="space-y-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">Layers</h2>
          <div className="max-h-56 space-y-2 overflow-auto">
            {[...document.layers].reverse().map((layer) => (
              <button
                key={layer.id}
                className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm ${
                  selectedLayerId === layer.id ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40" : "border-zinc-300 dark:border-zinc-700"
                }`}
                onClick={() => selectLayer(layer.id)}
              >
                <span>
                  {layer.type}: {layer.name}
                </span>
              </button>
            ))}
          </div>

          {selectedLayer ? (
            <div className="space-y-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
              <h3 className="text-sm font-medium">Selected layer</h3>
              <p className="text-xs text-zinc-500">Type: {selectedLayer.type}</p>
              {selectedLayer.type === "text" ? (
                <textarea
                  value={selectedLayer.text}
                  onChange={(event) => updateLayerText(selectedLayer.id, event.target.value)}
                  className="h-20 w-full rounded-md border border-zinc-300 bg-transparent p-2 text-sm dark:border-zinc-700"
                />
              ) : null}

              {selectedLayer.type === "image" ? (
                <div className="space-y-2">
                  <label className="block text-xs">
                    Brightness
                    <input
                      type="range"
                      min={-1}
                      max={1}
                      step={0.05}
                      value={(imageAdjustments[selectedLayer.id] ?? defaultImageAdjustments).brightness}
                      onChange={(event) => setImageAdjustment(selectedLayer.id, "brightness", Number(event.target.value))}
                      className="w-full"
                    />
                  </label>
                  <label className="block text-xs">
                    Contrast
                    <input
                      type="range"
                      min={-100}
                      max={100}
                      step={1}
                      value={(imageAdjustments[selectedLayer.id] ?? defaultImageAdjustments).contrast}
                      onChange={(event) => setImageAdjustment(selectedLayer.id, "contrast", Number(event.target.value))}
                      className="w-full"
                    />
                  </label>
                  <label className="block text-xs">
                    Blur
                    <input
                      type="range"
                      min={0}
                      max={20}
                      step={0.5}
                      value={(imageAdjustments[selectedLayer.id] ?? defaultImageAdjustments).blur}
                      onChange={(event) => setImageAdjustment(selectedLayer.id, "blur", Number(event.target.value))}
                      className="w-full"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={(imageAdjustments[selectedLayer.id] ?? defaultImageAdjustments).grayscale}
                      onChange={(event) => setImageAdjustment(selectedLayer.id, "grayscale", event.target.checked)}
                    />
                    Grayscale
                  </label>
                </div>
              ) : null}

              <button
                className="w-full rounded-md border border-red-400 px-3 py-2 text-sm text-red-600 dark:border-red-700 dark:text-red-400"
                onClick={() => removeLayer(selectedLayer.id)}
              >
                Delete layer
              </button>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Select a layer to edit.</p>
          )}
        </aside>
      </section>
    </main>
  );
}
