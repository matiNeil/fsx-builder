"use client";

import type { FaqSection } from "@fsx/templates";
import { ArrayField, TextAreaField, TextField } from "./field-controls";

type Instance = { id: string } & FaqSection;

export function FaqRenderer({ section }: { section: Instance }) {
  return (
    <section className="px-6 sm:px-10" style={{ paddingBlock: "var(--fsx-space-section)" }}>
      <div className="mx-auto max-w-3xl space-y-8">
        {section.heading ? (
          <h2 className="text-center text-3xl font-bold" style={{ fontFamily: "var(--fsx-font-heading)" }}>
            {section.heading}
          </h2>
        ) : null}
        <div className="divide-y" style={{ borderColor: "var(--fsx-color-border)" }}>
          {section.items.map((item, index) => (
            <details key={index} className="group py-4">
              <summary className="cursor-pointer list-none font-medium">
                {item.question}
                <span className="float-right text-[var(--fsx-color-text-muted)] group-open:hidden">+</span>
                <span className="float-right hidden text-[var(--fsx-color-text-muted)] group-open:inline">−</span>
              </summary>
              <p className="mt-2 text-sm text-[var(--fsx-color-text-muted)]">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqEditor({ section, onChange }: { section: Instance; onChange: (next: Instance) => void }) {
  return (
    <div className="space-y-4">
      <TextField
        label="Heading (optional)"
        value={section.heading ?? ""}
        onChange={(heading) => onChange({ ...section, heading: heading || undefined })}
      />
      <ArrayField
        label="Questions & answers"
        description="Common questions your customers ask, so they don't have to contact you to find out."
        items={section.items}
        onChange={(items) => onChange({ ...section, items })}
        createItem={() => ({ question: "New question?", answer: "Answer goes here." })}
        renderItem={(item, _index, update) => (
          <>
            <TextField label="Question" value={item.question} onChange={(question) => update({ ...item, question })} />
            <TextAreaField label="Answer" value={item.answer} onChange={(answer) => update({ ...item, answer })} />
          </>
        )}
      />
    </div>
  );
}
