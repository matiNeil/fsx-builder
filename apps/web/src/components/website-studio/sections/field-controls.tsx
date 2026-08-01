"use client";

import { useState, type ReactNode } from "react";
import { PhotoGalleryPicker } from "@/components/website-studio/photo-gallery-picker";

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900";
const labelClass = "block text-xs font-medium text-zinc-500 dark:text-zinc-400";

export function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className={labelClass}>{label}</span>
      <input
        type="text"
        className={inputClass}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block space-y-1">
      <span className={labelClass}>{label}</span>
      <textarea
        className={inputClass}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="block space-y-1">
      <span className={labelClass}>{label}</span>
      <select
        className={inputClass}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null | undefined;
  onChange: (url: string | null) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  return (
    <div className="space-y-1">
      <span className={labelClass}>{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="text"
          className={inputClass}
          value={value ?? ""}
          placeholder="https://..."
          onChange={(event) => onChange(event.target.value || null)}
        />
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="shrink-0 rounded-md border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-700"
        >
          Browse
        </button>
      </div>
      <PhotoGalleryPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => {
          onChange(url);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}

export function ArrayField<T>({
  label,
  items,
  onChange,
  createItem,
  renderItem,
  addLabel = "Add item",
}: {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  createItem: () => T;
  renderItem: (item: T, index: number, update: (next: T) => void) => ReactNode;
  addLabel?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className={labelClass}>{label}</span>
        <button
          type="button"
          onClick={() => onChange([...items, createItem()])}
          className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          + {addLabel}
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="relative space-y-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-800"
          >
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              className="absolute right-2 top-2 text-xs text-red-500 hover:underline"
            >
              Remove
            </button>
            {renderItem(item, index, (next) => {
              const copy = [...items];
              copy[index] = next;
              onChange(copy);
            })}
          </div>
        ))}
        {items.length === 0 ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-600">No items yet.</p>
        ) : null}
      </div>
    </div>
  );
}
