"use client";

import type { AboutSection } from "@fsx/templates";
import { ImageField, TextAreaField, TextField } from "./field-controls";

type Instance = { id: string } & AboutSection;

export function AboutRenderer({ section }: { section: Instance }) {
  return (
    <section className="px-6 sm:px-10" style={{ paddingBlock: "var(--fsx-space-section)" }}>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 sm:flex-row">
        {section.imageUrl ? (
          <div className="flex-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={section.imageUrl}
              alt=""
              className="aspect-[4/3] w-full rounded-[var(--fsx-radius)] object-cover"
            />
          </div>
        ) : null}
        <div className="flex-1 space-y-4">
          <h2 className="text-3xl font-bold" style={{ fontFamily: "var(--fsx-font-heading)" }}>
            {section.heading}
          </h2>
          <p className="whitespace-pre-wrap text-[var(--fsx-color-text-muted)]">{section.body}</p>
        </div>
      </div>
    </section>
  );
}

export function AboutEditor({ section, onChange }: { section: Instance; onChange: (next: Instance) => void }) {
  return (
    <div className="space-y-4">
      <TextField label="Heading" value={section.heading} onChange={(heading) => onChange({ ...section, heading })} />
      <TextAreaField
        label="Description"
        description="Tell visitors your story — who you are and what makes you different."
        value={section.body}
        onChange={(body) => onChange({ ...section, body })}
        rows={5}
      />
      <ImageField
        label="Image"
        description="A photo shown next to this text."
        value={section.imageUrl}
        onChange={(imageUrl) => onChange({ ...section, imageUrl })}
      />
    </div>
  );
}
