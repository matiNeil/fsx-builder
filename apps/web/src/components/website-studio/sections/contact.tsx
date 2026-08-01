"use client";

import type { ContactSection } from "@fsx/templates";
import { SelectField, TextAreaField, TextField } from "./field-controls";

type Instance = { id: string } & ContactSection;

export function ContactRenderer({ section }: { section: Instance }) {
  const fields =
    section.variant === "booking"
      ? [
          section.bookingFields?.checkInLabel ?? "Check-in",
          section.bookingFields?.checkOutLabel ?? "Check-out",
          section.bookingFields?.guestsLabel ?? "Guests",
        ]
      : ["Name", "Email", "Message"];

  return (
    <section className="px-6 sm:px-10" style={{ paddingBlock: "var(--fsx-space-section)" }}>
      <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold" style={{ fontFamily: "var(--fsx-font-heading)" }}>
            {section.heading}
          </h2>
          {section.body ? <p className="text-[var(--fsx-color-text-muted)]">{section.body}</p> : null}
          <ul className="space-y-1 text-sm text-[var(--fsx-color-text-muted)]">
            {section.address ? <li>{section.address}</li> : null}
            {section.phone ? <li>{section.phone}</li> : null}
            {section.email ? <li>{section.email}</li> : null}
          </ul>
        </div>
        <form
          className="space-y-3 rounded-[var(--fsx-radius)] border p-5"
          style={{ borderColor: "var(--fsx-color-border)", backgroundColor: "var(--fsx-color-surface)" }}
        >
          {fields.map((field) => (
            <div key={field} className="space-y-1">
              <label className="text-xs font-medium text-[var(--fsx-color-text-muted)]">{field}</label>
              <div
                className="h-9 rounded-[var(--fsx-radius)] border bg-[var(--fsx-color-background)]"
                style={{ borderColor: "var(--fsx-color-border)" }}
              />
            </div>
          ))}
          <div
            className="mt-2 inline-flex items-center justify-center rounded-[var(--fsx-radius)] bg-[var(--fsx-color-primary)] px-5 py-2.5 text-sm font-medium text-white"
          >
            {section.variant === "booking" ? "Check availability" : "Send message"}
          </div>
        </form>
      </div>
    </section>
  );
}

export function ContactEditor({ section, onChange }: { section: Instance; onChange: (next: Instance) => void }) {
  return (
    <div className="space-y-4">
      <TextField label="Heading" value={section.heading} onChange={(heading) => onChange({ ...section, heading })} />
      <TextAreaField
        label="Description (optional)"
        value={section.body ?? ""}
        onChange={(body) => onChange({ ...section, body: body || undefined })}
      />
      <TextField
        label="Address (optional)"
        value={section.address ?? ""}
        onChange={(address) => onChange({ ...section, address: address || undefined })}
      />
      <TextField
        label="Phone number (optional)"
        value={section.phone ?? ""}
        onChange={(phone) => onChange({ ...section, phone: phone || undefined })}
      />
      <TextField
        label="Email address (optional)"
        value={section.email ?? ""}
        onChange={(email) => onChange({ ...section, email: email || undefined })}
      />
      <SelectField
        label="Form type"
        description="A booking form collects check-in/check-out dates instead of a message."
        value={section.variant}
        options={[
          { value: "form" as const, label: "Contact form" },
          { value: "booking" as const, label: "Booking form" },
        ]}
        onChange={(variant) => {
          onChange({
            ...section,
            variant,
            bookingFields:
              variant === "booking"
                ? (section.bookingFields ?? {
                    checkInLabel: "Check-in",
                    checkOutLabel: "Check-out",
                    guestsLabel: "Guests",
                  })
                : undefined,
          });
        }}
      />
      {section.variant === "booking" ? (
        <>
          <TextField
            label="Check-in field caption"
            description='The text shown above the check-in date picker on your site (e.g. "Check-in" or "Arrival Date").'
            value={section.bookingFields?.checkInLabel ?? ""}
            onChange={(checkInLabel) =>
              onChange({
                ...section,
                bookingFields: {
                  checkInLabel,
                  checkOutLabel: section.bookingFields?.checkOutLabel ?? "Check-out",
                  guestsLabel: section.bookingFields?.guestsLabel ?? "Guests",
                },
              })
            }
          />
          <TextField
            label="Check-out field caption"
            description='The text shown above the check-out date picker on your site (e.g. "Check-out" or "Departure Date").'
            value={section.bookingFields?.checkOutLabel ?? ""}
            onChange={(checkOutLabel) =>
              onChange({
                ...section,
                bookingFields: {
                  checkInLabel: section.bookingFields?.checkInLabel ?? "Check-in",
                  checkOutLabel,
                  guestsLabel: section.bookingFields?.guestsLabel ?? "Guests",
                },
              })
            }
          />
          <TextField
            label="Guests field caption"
            description='The text shown above the guest-count field on your site (e.g. "Guests" or "Party Size").'
            value={section.bookingFields?.guestsLabel ?? ""}
            onChange={(guestsLabel) =>
              onChange({
                ...section,
                bookingFields: {
                  checkInLabel: section.bookingFields?.checkInLabel ?? "Check-in",
                  checkOutLabel: section.bookingFields?.checkOutLabel ?? "Check-out",
                  guestsLabel,
                },
              })
            }
          />
        </>
      ) : null}
    </div>
  );
}
