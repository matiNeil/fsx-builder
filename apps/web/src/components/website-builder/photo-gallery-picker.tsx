"use client";

import { useState } from "react";

const CATEGORIES = ["Business", "Nature", "Food", "People", "Technology", "Abstract"] as const;
type Category = (typeof CATEGORIES)[number];

const THUMBS_PER_CATEGORY = 12;

const thumbUrl = (category: Category, index: number) =>
  `https://picsum.photos/seed/${category.toLowerCase()}-${index}/400/300`;
const fullUrl = (category: Category, index: number) =>
  `https://picsum.photos/seed/${category.toLowerCase()}-${index}/1600/900`;

type PhotoGalleryPickerProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
};

export function PhotoGalleryPicker({ isOpen, onClose, onSelect }: PhotoGalleryPickerProps) {
  const [category, setCategory] = useState<Category>("Business");

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <h2 className="text-sm font-medium">Choose a photo</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-wrap gap-2 border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                category === item
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                  : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 overflow-y-auto p-5 sm:grid-cols-4">
          {Array.from({ length: THUMBS_PER_CATEGORY }).map((_, index) => {
            const n = index + 1;
            return (
              <button
                key={n}
                type="button"
                onClick={() => onSelect(fullUrl(category, n))}
                className="aspect-[4/3] overflow-hidden rounded-lg border border-zinc-200 transition hover:ring-2 hover:ring-blue-500 dark:border-zinc-800"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbUrl(category, n)}
                  alt={`${category} stock photo ${n}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
