"use client";

import type { FeaturesSection } from "@fsx/templates";
import { ArrayField, TextAreaField, TextField } from "./field-controls";

type Instance = { id: string } & FeaturesSection;

export function FeaturesRenderer({ section }: { section: Instance }) {
  return (
    <section className="px-6 sm:px-10" style={{ paddingBlock: "var(--fsx-space-section)" }}>
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <h2 className="text-3xl font-bold" style={{ fontFamily: "var(--fsx-font-heading)" }}>
            {section.heading}
          </h2>
          {section.intro ? <p className="text-[var(--fsx-color-text-muted)]">{section.intro}</p> : null}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {section.items.map((item, index) => (
            <div
              key={index}
              className="rounded-[var(--fsx-radius)] border p-6"
              style={{ borderColor: "var(--fsx-color-border)", backgroundColor: "var(--fsx-color-surface)" }}
            >
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-[var(--fsx-color-text-muted)]">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturesEditor({ section, onChange }: { section: Instance; onChange: (next: Instance) => void }) {
  return (
    <div className="space-y-4">
      <TextField label="Heading" value={section.heading} onChange={(heading) => onChange({ ...section, heading })} />
      <TextAreaField
        label="Intro (optional)"
        value={section.intro ?? ""}
        onChange={(intro) => onChange({ ...section, intro: intro || undefined })}
      />
      <ArrayField
        label="Items"
        items={section.items}
        onChange={(items) => onChange({ ...section, items })}
        createItem={() => ({ title: "New feature", body: "Describe it." })}
        renderItem={(item, _index, update) => (
          <>
            <TextField label="Title" value={item.title} onChange={(title) => update({ ...item, title })} />
            <TextAreaField label="Body" value={item.body} onChange={(body) => update({ ...item, body })} />
          </>
        )}
      />
    </div>
  );
}
