"use client";

import type { TeamSection } from "@fsx/templates";
import { ArrayField, ImageField, TextAreaField, TextField } from "./field-controls";

type Instance = { id: string } & TeamSection;
type TeamMember = TeamSection["items"][number];

export function TeamRenderer({ section }: { section: Instance }) {
  return (
    <section className="px-6 sm:px-10" style={{ paddingBlock: "var(--fsx-space-section)" }}>
      <div className="mx-auto max-w-6xl space-y-8">
        <h2 className="text-center text-3xl font-bold" style={{ fontFamily: "var(--fsx-font-heading)" }}>
          {section.heading}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {section.items.map((item, index) => (
            <div key={index} className="text-center">
              {item.photoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={item.photoUrl}
                  alt=""
                  className="mx-auto aspect-square w-32 rounded-[var(--fsx-radius)] object-cover"
                />
              ) : null}
              <p className="mt-3 font-semibold">{item.name}</p>
              <p className="text-sm text-[var(--fsx-color-text-muted)]">{item.role}</p>
              {item.bio ? <p className="mt-2 text-xs text-[var(--fsx-color-text-muted)]">{item.bio}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TeamEditor({ section, onChange }: { section: Instance; onChange: (next: Instance) => void }) {
  return (
    <div className="space-y-4">
      <TextField label="Heading" value={section.heading} onChange={(heading) => onChange({ ...section, heading })} />
      <ArrayField<TeamMember>
        label="Team members"
        items={section.items}
        onChange={(items) => onChange({ ...section, items })}
        createItem={() => ({ name: "New member", role: "Role" })}
        renderItem={(item, _index, update) => (
          <>
            <TextField label="Name" value={item.name} onChange={(name) => update({ ...item, name })} />
            <TextField
              label="Job title"
              description='e.g. "Founder" or "Head Chef".'
              value={item.role}
              onChange={(role) => update({ ...item, role })}
            />
            <TextAreaField
              label="Short bio (optional)"
              value={item.bio ?? ""}
              onChange={(bio) => update({ ...item, bio: bio || undefined })}
            />
            <ImageField
              label="Photo"
              value={item.photoUrl}
              onChange={(photoUrl) => update({ ...item, photoUrl })}
            />
          </>
        )}
      />
    </div>
  );
}
