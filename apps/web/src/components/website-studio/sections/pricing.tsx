"use client";

import type { PricingSection } from "@fsx/templates";
import { ThemedButton } from "../themed-button";
import { ArrayField, TextAreaField, TextField } from "./field-controls";

type Instance = { id: string } & PricingSection;

export function PricingRenderer({ section }: { section: Instance }) {
  return (
    <section className="px-6 sm:px-10" style={{ paddingBlock: "var(--fsx-space-section)" }}>
      <div className="mx-auto max-w-6xl space-y-8">
        <h2 className="text-center text-3xl font-bold" style={{ fontFamily: "var(--fsx-font-heading)" }}>
          {section.heading}
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {section.tiers.map((tier, index) => (
            <div
              key={index}
              className="flex flex-col gap-4 rounded-[var(--fsx-radius)] border p-6"
              style={{ borderColor: "var(--fsx-color-border)", backgroundColor: "var(--fsx-color-surface)" }}
            >
              <div>
                <p className="font-semibold">{tier.name}</p>
                <p className="mt-1 text-2xl font-bold">
                  {tier.price}
                  {tier.period ? <span className="text-sm font-normal text-[var(--fsx-color-text-muted)]">/{tier.period}</span> : null}
                </p>
              </div>
              <ul className="flex-1 space-y-1 text-sm text-[var(--fsx-color-text-muted)]">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex}>✓ {feature}</li>
                ))}
              </ul>
              <ThemedButton button={{ label: tier.ctaLabel, href: "#" }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PricingEditor({ section, onChange }: { section: Instance; onChange: (next: Instance) => void }) {
  return (
    <div className="space-y-4">
      <TextField label="Heading" value={section.heading} onChange={(heading) => onChange({ ...section, heading })} />
      <ArrayField
        label="Plans"
        description="Each plan is one pricing option customers can choose."
        items={section.tiers}
        onChange={(tiers) => onChange({ ...section, tiers })}
        createItem={() => ({ name: "New tier", price: "$0", features: [], ctaLabel: "Choose plan" })}
        renderItem={(tier, _index, update) => (
          <>
            <TextField
              label="Plan name"
              description='e.g. "Basic" or "Pro".'
              value={tier.name}
              onChange={(name) => update({ ...tier, name })}
            />
            <TextField
              label="Price"
              description='e.g. "$29".'
              value={tier.price}
              onChange={(price) => update({ ...tier, price })}
            />
            <TextField
              label="Billing period (optional)"
              description='e.g. "per month" or "per year", shown next to the price.'
              value={tier.period ?? ""}
              onChange={(period) => update({ ...tier, period: period || undefined })}
            />
            <TextAreaField
              label="What's included (one per line)"
              description="Each line becomes a checkmarked feature in the list."
              value={tier.features.join("\n")}
              onChange={(value) => update({ ...tier, features: value.split("\n").filter(Boolean) })}
            />
            <TextField
              label="Button text"
              description='e.g. "Choose plan" or "Sign up".'
              value={tier.ctaLabel}
              onChange={(ctaLabel) => update({ ...tier, ctaLabel })}
            />
          </>
        )}
      />
    </div>
  );
}
