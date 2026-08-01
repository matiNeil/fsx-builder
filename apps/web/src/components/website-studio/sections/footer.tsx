"use client";

import Link from "next/link";
import type { FooterSection } from "@fsx/templates";
import { ArrayField, TextField } from "./field-controls";

type Instance = { id: string } & FooterSection;

export function FooterRenderer({ section }: { section: Instance }) {
  return (
    <footer
      className="border-t px-6 py-10 sm:px-10"
      style={{ borderColor: "var(--fsx-color-border)", backgroundColor: "var(--fsx-color-surface)" }}
    >
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="grid gap-8 sm:grid-cols-4">
          <span className="text-lg font-semibold" style={{ fontFamily: "var(--fsx-font-heading)" }}>
            {section.brand}
          </span>
          {section.columns.map((column, index) => (
            <div key={index} className="space-y-2">
              <p className="text-sm font-medium">{column.heading}</p>
              <ul className="space-y-1 text-sm text-[var(--fsx-color-text-muted)]">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-[var(--fsx-color-text)]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-6 text-xs text-[var(--fsx-color-text-muted)]" style={{ borderColor: "var(--fsx-color-border)" }}>
          <span>{section.copyrightText}</span>
          {section.socialLinks && section.socialLinks.length > 0 ? (
            <div className="flex gap-3">
              {section.socialLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

export function FooterEditor({ section, onChange }: { section: Instance; onChange: (next: Instance) => void }) {
  return (
    <div className="space-y-4">
      <TextField label="Brand name" value={section.brand} onChange={(brand) => onChange({ ...section, brand })} />
      <ArrayField
        label="Columns"
        items={section.columns}
        onChange={(columns) => onChange({ ...section, columns })}
        createItem={() => ({ heading: "New column", links: [] })}
        renderItem={(column, _index, update) => (
          <>
            <TextField label="Heading" value={column.heading} onChange={(heading) => update({ ...column, heading })} />
            <ArrayField
              label="Links"
              items={column.links}
              onChange={(links) => update({ ...column, links })}
              createItem={() => ({ label: "New link", href: "#" })}
              renderItem={(link, _linkIndex, updateLink) => (
                <>
                  <TextField label="Label" value={link.label} onChange={(label) => updateLink({ ...link, label })} />
                  <TextField label="URL" value={link.href} onChange={(href) => updateLink({ ...link, href })} />
                </>
              )}
            />
          </>
        )}
      />
      <ArrayField
        label="Social links"
        items={section.socialLinks ?? []}
        onChange={(socialLinks) => onChange({ ...section, socialLinks })}
        createItem={() => ({ label: "Twitter", href: "#" })}
        renderItem={(link, _index, update) => (
          <>
            <TextField label="Label" value={link.label} onChange={(label) => update({ ...link, label })} />
            <TextField label="URL" value={link.href} onChange={(href) => update({ ...link, href })} />
          </>
        )}
      />
      <TextField
        label="Copyright text"
        value={section.copyrightText}
        onChange={(copyrightText) => onChange({ ...section, copyrightText })}
      />
    </div>
  );
}
