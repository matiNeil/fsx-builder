"use client";

import type { StatsSection } from "@fsx/templates";
import { ArrayField, TextField } from "./field-controls";

type Instance = { id: string } & StatsSection;

export function StatsRenderer({ section }: { section: Instance }) {
  return (
    <section className="px-6 sm:px-10" style={{ paddingBlock: "var(--fsx-space-section)" }}>
      <div className="mx-auto max-w-6xl space-y-8">
        {section.heading ? (
          <h2 className="text-center text-3xl font-bold" style={{ fontFamily: "var(--fsx-font-heading)" }}>
            {section.heading}
          </h2>
        ) : null}
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {section.items.map((item, index) => (
            <div key={index} className="text-center">
              <p className="text-3xl font-bold text-[var(--fsx-color-primary)]">{item.value}</p>
              <p className="mt-1 text-sm text-[var(--fsx-color-text-muted)]">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StatsEditor({ section, onChange }: { section: Instance; onChange: (next: Instance) => void }) {
  return (
    <div className="space-y-4">
      <TextField
        label="Heading (optional)"
        value={section.heading ?? ""}
        onChange={(heading) => onChange({ ...section, heading: heading || undefined })}
      />
      <ArrayField
        label="Stats"
        items={section.items}
        onChange={(items) => onChange({ ...section, items })}
        createItem={() => ({ value: "100+", label: "New stat" })}
        renderItem={(item, _index, update) => (
          <>
            <TextField label="Value" value={item.value} onChange={(value) => update({ ...item, value })} />
            <TextField label="Label" value={item.label} onChange={(label) => update({ ...item, label })} />
          </>
        )}
      />
    </div>
  );
}
