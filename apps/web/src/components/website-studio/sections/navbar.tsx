"use client";

import Link from "next/link";
import type { NavbarSection } from "@fsx/templates";
import { useWebsiteTheme } from "../theme-provider";
import { ThemedButton } from "../themed-button";
import { ArrayField, TextField } from "./field-controls";

type Instance = { id: string } & NavbarSection;

export function NavbarRenderer({ section }: { section: Instance }) {
  const theme = useWebsiteTheme();
  return (
    <header
      className="flex items-center justify-between border-b px-6 py-4 sm:px-10"
      style={{ borderColor: "var(--fsx-color-border)" }}
    >
      <span className="text-lg font-semibold" style={{ fontFamily: "var(--fsx-font-heading)" }}>
        {section.brand}
      </span>
      <nav className="hidden items-center gap-6 text-sm sm:flex">
        {section.links.map((link) => (
          <Link key={link.href} href={link.href} className="opacity-80 hover:opacity-100">
            {link.label}
          </Link>
        ))}
      </nav>
      {section.cta ? <ThemedButton button={section.cta} /> : null}
      <span className="sr-only">{theme.name}</span>
    </header>
  );
}

export function NavbarEditor({ section, onChange }: { section: Instance; onChange: (next: Instance) => void }) {
  return (
    <div className="space-y-4">
      <TextField
        label="Business name"
        description="Shown in the top-left corner of every page."
        value={section.brand}
        onChange={(brand) => onChange({ ...section, brand })}
      />
      <ArrayField
        label="Menu links"
        description="The links shown across the top of your site."
        items={section.links}
        onChange={(links) => onChange({ ...section, links })}
        createItem={() => ({ label: "New link", href: "#" })}
        renderItem={(item, _index, update) => (
          <>
            <TextField label="Text" value={item.label} onChange={(label) => update({ ...item, label })} />
            <TextField
              label="Link"
              description="Where this goes when clicked."
              value={item.href}
              onChange={(href) => update({ ...item, href })}
            />
          </>
        )}
      />
      <TextField
        label="Button text (optional)"
        description='Shown as a highlighted button in your top menu, e.g. "Get Started".'
        value={section.cta?.label ?? ""}
        onChange={(label) =>
          onChange({ ...section, cta: label ? { label, href: section.cta?.href ?? "#" } : undefined })
        }
      />
      {section.cta ? (
        <TextField
          label="Button link"
          description="Where this button sends visitors."
          value={section.cta.href}
          onChange={(href) => onChange({ ...section, cta: { ...section.cta!, href } })}
        />
      ) : null}
    </div>
  );
}
