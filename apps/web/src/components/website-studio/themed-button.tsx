"use client";

import Link from "next/link";
import type { WebsiteButtonRef } from "@fsx/templates";
import { useWebsiteTheme } from "./theme-provider";

export function ThemedButton({
  button,
  variant = "primary",
}: {
  button: WebsiteButtonRef;
  variant?: "primary" | "secondary";
}) {
  const theme = useWebsiteTheme();
  const base = "inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium transition";
  const shape = theme.buttonStyle === "pill" ? "rounded-full" : "rounded-[var(--fsx-radius)]";

  const primaryByStyle: Record<typeof theme.buttonStyle, string> = {
    solid: "bg-[var(--fsx-color-primary)] text-white hover:opacity-90",
    pill: "bg-[var(--fsx-color-primary)] text-white hover:opacity-90",
    outline:
      "border-2 border-[var(--fsx-color-primary)] text-[var(--fsx-color-primary)] hover:bg-[var(--fsx-color-primary)]/10",
    ghost: "text-[var(--fsx-color-primary)] hover:bg-[var(--fsx-color-primary)]/10",
  };

  const secondaryClass =
    "border border-[var(--fsx-color-border)] text-[var(--fsx-color-text)] hover:bg-[var(--fsx-color-surface)]";

  const variantClass = variant === "primary" ? primaryByStyle[theme.buttonStyle] : secondaryClass;

  return (
    <Link href={button.href} className={`${base} ${shape} ${variantClass}`}>
      {button.label}
    </Link>
  );
}
