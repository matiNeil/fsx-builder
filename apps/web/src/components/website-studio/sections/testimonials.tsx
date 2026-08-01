"use client";

import type { TestimonialsSection } from "@fsx/templates";
import { ArrayField, ImageField, TextAreaField, TextField } from "./field-controls";

type Instance = { id: string } & TestimonialsSection;
type Testimonial = TestimonialsSection["items"][number];

export function TestimonialsRenderer({ section }: { section: Instance }) {
  return (
    <section className="px-6 sm:px-10" style={{ paddingBlock: "var(--fsx-space-section)" }}>
      <div className="mx-auto max-w-6xl space-y-8">
        {section.heading ? (
          <h2 className="text-center text-3xl font-bold" style={{ fontFamily: "var(--fsx-font-heading)" }}>
            {section.heading}
          </h2>
        ) : null}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {section.items.map((item, index) => (
            <figure
              key={index}
              className="rounded-[var(--fsx-radius)] border p-6"
              style={{ borderColor: "var(--fsx-color-border)", backgroundColor: "var(--fsx-color-surface)" }}
            >
              <blockquote className="text-sm italic text-[var(--fsx-color-text)]">&ldquo;{item.quote}&rdquo;</blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                {item.avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={item.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : null}
                <div>
                  <p className="text-sm font-medium">{item.author}</p>
                  {item.role ? <p className="text-xs text-[var(--fsx-color-text-muted)]">{item.role}</p> : null}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsEditor({ section, onChange }: { section: Instance; onChange: (next: Instance) => void }) {
  return (
    <div className="space-y-4">
      <TextField
        label="Heading (optional)"
        value={section.heading ?? ""}
        onChange={(heading) => onChange({ ...section, heading: heading || undefined })}
      />
      <ArrayField<Testimonial>
        label="Testimonials"
        items={section.items}
        onChange={(items) => onChange({ ...section, items })}
        createItem={() => ({ quote: "This was great!", author: "Happy customer" })}
        renderItem={(item, _index, update) => (
          <>
            <TextAreaField label="Quote" value={item.quote} onChange={(quote) => update({ ...item, quote })} />
            <TextField label="Author" value={item.author} onChange={(author) => update({ ...item, author })} />
            <TextField
              label="Role (optional)"
              value={item.role ?? ""}
              onChange={(role) => update({ ...item, role: role || undefined })}
            />
            <ImageField label="Avatar" value={item.avatarUrl} onChange={(avatarUrl) => update({ ...item, avatarUrl })} />
          </>
        )}
      />
    </div>
  );
}
