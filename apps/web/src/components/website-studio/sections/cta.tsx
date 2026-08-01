"use client";

import type { CtaSection } from "@fsx/templates";
import { ThemedButton } from "../themed-button";
import { TextAreaField, TextField } from "./field-controls";

type Instance = { id: string } & CtaSection;

export function CtaRenderer({ section }: { section: Instance }) {
  return (
    <section
      className="px-6 text-center sm:px-10"
      style={{ paddingBlock: "var(--fsx-space-section)", backgroundColor: "var(--fsx-color-surface)" }}
    >
      <div className="mx-auto max-w-2xl space-y-5">
        <h2 className="text-3xl font-bold" style={{ fontFamily: "var(--fsx-font-heading)" }}>
          {section.heading}
        </h2>
        {section.body ? <p className="text-[var(--fsx-color-text-muted)]">{section.body}</p> : null}
        <div className="flex flex-wrap justify-center gap-3">
          <ThemedButton button={section.primaryCta} />
          {section.secondaryCta ? <ThemedButton button={section.secondaryCta} variant="secondary" /> : null}
        </div>
      </div>
    </section>
  );
}

export function CtaEditor({ section, onChange }: { section: Instance; onChange: (next: Instance) => void }) {
  return (
    <div className="space-y-4">
      <TextField label="Heading" value={section.heading} onChange={(heading) => onChange({ ...section, heading })} />
      <TextAreaField
        label="Body (optional)"
        value={section.body ?? ""}
        onChange={(body) => onChange({ ...section, body: body || undefined })}
      />
      <TextField
        label="Primary CTA label"
        value={section.primaryCta.label}
        onChange={(label) => onChange({ ...section, primaryCta: { ...section.primaryCta, label } })}
      />
      <TextField
        label="Primary CTA URL"
        value={section.primaryCta.href}
        onChange={(href) => onChange({ ...section, primaryCta: { ...section.primaryCta, href } })}
      />
      <TextField
        label="Secondary CTA label"
        value={section.secondaryCta?.label ?? ""}
        onChange={(label) =>
          onChange({
            ...section,
            secondaryCta: label ? { label, href: section.secondaryCta?.href ?? "#" } : undefined,
          })
        }
      />
      {section.secondaryCta ? (
        <TextField
          label="Secondary CTA URL"
          value={section.secondaryCta.href}
          onChange={(href) => onChange({ ...section, secondaryCta: { ...section.secondaryCta!, href } })}
        />
      ) : null}
    </div>
  );
}
