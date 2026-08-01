"use client";

import type { HeroSection } from "@fsx/templates";
import { ThemedButton } from "../themed-button";
import { ImageField, SelectField, TextAreaField, TextField } from "./field-controls";

type Instance = { id: string } & HeroSection;

export function HeroRenderer({ section }: { section: Instance }) {
  const hasImage = Boolean(section.imageUrl) && section.layout !== "center";
  const imageOnLeft = section.layout === "image-left";

  const textBlock = (
    <div className="flex flex-1 flex-col justify-center gap-4 text-center sm:text-left">
      {section.eyebrow ? (
        <span className="text-sm font-medium uppercase tracking-wide text-[var(--fsx-color-primary)]">
          {section.eyebrow}
        </span>
      ) : null}
      <h1 className="text-4xl font-bold sm:text-5xl" style={{ fontFamily: "var(--fsx-font-heading)" }}>
        {section.heading}
      </h1>
      {section.subheading ? (
        <p className="text-xl text-[var(--fsx-color-text-muted)]">{section.subheading}</p>
      ) : null}
      {section.body ? <p className="text-[var(--fsx-color-text-muted)]">{section.body}</p> : null}
      <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
        {section.primaryCta ? <ThemedButton button={section.primaryCta} /> : null}
        {section.secondaryCta ? <ThemedButton button={section.secondaryCta} variant="secondary" /> : null}
      </div>
    </div>
  );

  const imageBlock = hasImage ? (
    <div className="flex-1">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={section.imageUrl!}
        alt=""
        className="aspect-[4/3] w-full rounded-[var(--fsx-radius)] object-cover"
      />
    </div>
  ) : null;

  if (section.layout === "background" && section.imageUrl) {
    return (
      <section
        className="relative flex min-h-[420px] items-center justify-center bg-cover bg-center px-6 py-24 text-center sm:px-10"
        style={{ backgroundImage: `url(${section.imageUrl})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative max-w-2xl text-white [&_p]:text-white/85 [&_span]:text-white">{textBlock}</div>
      </section>
    );
  }

  return (
    <section className="px-6 py-16 sm:px-10" style={{ paddingBlock: "var(--fsx-space-section)" }}>
      <div
        className={`mx-auto flex max-w-6xl flex-col items-center gap-10 sm:flex-row ${
          imageOnLeft ? "sm:flex-row-reverse" : ""
        }`}
      >
        {textBlock}
        {imageBlock}
      </div>
    </section>
  );
}

const LAYOUT_OPTIONS: { value: HeroSection["layout"]; label: string }[] = [
  { value: "image-right", label: "Image right" },
  { value: "image-left", label: "Image left" },
  { value: "background", label: "Full-bleed background" },
  { value: "center", label: "Centered, no image" },
];

export function HeroEditor({ section, onChange }: { section: Instance; onChange: (next: Instance) => void }) {
  return (
    <div className="space-y-4">
      <TextField
        label="Eyebrow (optional)"
        value={section.eyebrow ?? ""}
        onChange={(eyebrow) => onChange({ ...section, eyebrow: eyebrow || undefined })}
      />
      <TextField label="Heading" value={section.heading} onChange={(heading) => onChange({ ...section, heading })} />
      <TextField
        label="Subheading (optional)"
        value={section.subheading ?? ""}
        onChange={(subheading) => onChange({ ...section, subheading: subheading || undefined })}
      />
      <TextAreaField
        label="Body"
        value={section.body ?? ""}
        onChange={(body) => onChange({ ...section, body: body || undefined })}
      />
      <SelectField
        label="Layout"
        value={section.layout}
        options={LAYOUT_OPTIONS}
        onChange={(layout) => onChange({ ...section, layout })}
      />
      <ImageField label="Image" value={section.imageUrl} onChange={(imageUrl) => onChange({ ...section, imageUrl })} />
      <TextField
        label="Primary CTA label"
        value={section.primaryCta?.label ?? ""}
        onChange={(label) =>
          onChange({ ...section, primaryCta: label ? { label, href: section.primaryCta?.href ?? "#" } : undefined })
        }
      />
      {section.primaryCta ? (
        <TextField
          label="Primary CTA URL"
          value={section.primaryCta.href}
          onChange={(href) => onChange({ ...section, primaryCta: { ...section.primaryCta!, href } })}
        />
      ) : null}
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
