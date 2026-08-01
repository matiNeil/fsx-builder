"use client";

import type { GallerySection } from "@fsx/templates";
import { ArrayField, ImageField, TextField } from "./field-controls";

type Instance = { id: string } & GallerySection;
type GalleryImage = GallerySection["images"][number];

export function GalleryRenderer({ section }: { section: Instance }) {
  return (
    <section className="px-6 sm:px-10" style={{ paddingBlock: "var(--fsx-space-section)" }}>
      <div className="mx-auto max-w-6xl space-y-8">
        {section.heading ? (
          <h2 className="text-center text-3xl font-bold" style={{ fontFamily: "var(--fsx-font-heading)" }}>
            {section.heading}
          </h2>
        ) : null}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {section.images.map((image, index) => (
            <figure key={index} className="overflow-hidden rounded-[var(--fsx-radius)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt={image.caption ?? ""} className="aspect-square w-full object-cover" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function GalleryEditor({ section, onChange }: { section: Instance; onChange: (next: Instance) => void }) {
  return (
    <div className="space-y-4">
      <TextField
        label="Heading (optional)"
        value={section.heading ?? ""}
        onChange={(heading) => onChange({ ...section, heading: heading || undefined })}
      />
      <ArrayField<GalleryImage>
        label="Images"
        description="Photos shown in a grid. New photos start as a placeholder — click Browse to pick a real one."
        items={section.images}
        onChange={(images) => onChange({ ...section, images })}
        createItem={() => ({ url: "https://picsum.photos/seed/gallery/800/800" })}
        renderItem={(item, _index, update) => (
          <>
            <ImageField label="Image" value={item.url} onChange={(url) => update({ ...item, url: url ?? "" })} />
            <TextField
              label="Caption (optional)"
              description="A short line shown with this photo."
              value={item.caption ?? ""}
              onChange={(caption) => update({ ...item, caption: caption || undefined })}
            />
          </>
        )}
      />
    </div>
  );
}
