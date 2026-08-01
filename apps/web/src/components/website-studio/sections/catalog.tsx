"use client";

import type { CatalogItem, CatalogSection } from "@fsx/templates";
import { ArrayField, ImageField, SelectField, TextAreaField, TextField } from "./field-controls";

type Instance = { id: string } & CatalogSection;

export function CatalogRenderer({ section }: { section: Instance }) {
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
              className="overflow-hidden rounded-[var(--fsx-radius)] border"
              style={{ borderColor: "var(--fsx-color-border)" }}
            >
              {item.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={item.imageUrl} alt="" className="aspect-[4/3] w-full object-cover" />
              ) : null}
              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{item.title}</h3>
                  {item.price ? (
                    <span className="text-sm font-medium text-[var(--fsx-color-primary)]">{item.price}</span>
                  ) : null}
                </div>
                <p className="text-sm text-[var(--fsx-color-text-muted)]">{item.description}</p>
                {item.meta ? <p className="text-xs text-[var(--fsx-color-text-muted)]">{item.meta}</p> : null}
                {item.ctaLabel ? (
                  <span className="inline-block text-sm font-medium text-[var(--fsx-color-primary)]">
                    {item.ctaLabel} →
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const VARIANT_OPTIONS: { value: CatalogSection["variant"]; label: string }[] = [
  { value: "products", label: "Products" },
  { value: "listings", label: "Listings" },
  { value: "rooms", label: "Rooms" },
  { value: "menu", label: "Menu" },
  { value: "packages", label: "Packages" },
];

const META_FIELD: Record<CatalogSection["variant"], { label: string; description: string }> = {
  products: { label: "Extra detail (optional)", description: 'e.g. "Ships in 2 days".' },
  listings: { label: "Property details (optional)", description: 'e.g. "3 bed · 2 bath · 1,400 sqft".' },
  rooms: { label: "Room details (optional)", description: 'e.g. "2 guests · King bed".' },
  menu: { label: "Dietary info (optional)", description: 'e.g. "Vegetarian" or "Contains nuts".' },
  packages: { label: "Package details (optional)", description: 'e.g. "3 sessions, 1 month".' },
};

export function CatalogEditor({ section, onChange }: { section: Instance; onChange: (next: Instance) => void }) {
  const metaField = META_FIELD[section.variant];
  return (
    <div className="space-y-4">
      <TextField label="Heading" value={section.heading} onChange={(heading) => onChange({ ...section, heading })} />
      <TextAreaField
        label="Short intro text (optional)"
        description="One sentence introducing this section, shown above the list."
        value={section.intro ?? ""}
        onChange={(intro) => onChange({ ...section, intro: intro || undefined })}
      />
      <SelectField
        label="Type"
        description="What kind of items you're listing — changes the fields below to match."
        value={section.variant}
        options={VARIANT_OPTIONS}
        onChange={(variant) => onChange({ ...section, variant })}
      />
      <ArrayField<CatalogItem>
        label="Items"
        items={section.items}
        onChange={(items) => onChange({ ...section, items })}
        createItem={() => ({ title: "New item", description: "Describe it." })}
        renderItem={(item, _index, update) => (
          <>
            <TextField label="Title" value={item.title} onChange={(title) => update({ ...item, title })} />
            <TextAreaField
              label="Description"
              value={item.description}
              onChange={(description) => update({ ...item, description })}
            />
            <TextField
              label="Price (optional)"
              description='e.g. "$25" or "From $99/night".'
              value={item.price ?? ""}
              onChange={(price) => update({ ...item, price: price || undefined })}
            />
            <TextField
              label={metaField.label}
              description={metaField.description}
              value={item.meta ?? ""}
              onChange={(meta) => update({ ...item, meta: meta || undefined })}
            />
            <TextField
              label="Button text (optional)"
              description='e.g. "Order now" or "View details".'
              value={item.ctaLabel ?? ""}
              onChange={(ctaLabel) => update({ ...item, ctaLabel: ctaLabel || undefined })}
            />
            <ImageField
              label="Image"
              value={item.imageUrl}
              onChange={(imageUrl) => update({ ...item, imageUrl })}
            />
          </>
        )}
      />
    </div>
  );
}
