"use client";

import { createContext, useContext, useMemo, type CSSProperties, type ReactNode } from "react";
import {
  getWebsiteThemeById,
  type WebsiteRadius,
  type WebsiteSpacing,
  type WebsiteTheme,
  type WebsiteThemeColors,
} from "@fsx/templates";
import { WEBSITE_FONT_CSS_VAR } from "@/app/website-fonts";

const RADIUS_SCALE: Record<WebsiteRadius, string> = {
  none: "0px",
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  full: "9999px",
};

const SPACING_SCALE: Record<WebsiteSpacing, string> = {
  compact: "2.5rem",
  comfortable: "4rem",
  spacious: "6rem",
};

const WebsiteThemeContext = createContext<WebsiteTheme | null>(null);

export const useWebsiteTheme = (): WebsiteTheme => {
  const theme = useContext(WebsiteThemeContext);
  if (!theme) {
    throw new Error("useWebsiteTheme must be used within a WebsiteThemeProvider");
  }
  return theme;
};

export function WebsiteThemeProvider({
  presetId,
  overrides,
  children,
  className,
}: {
  presetId: string;
  overrides?: Partial<WebsiteThemeColors>;
  children: ReactNode;
  className?: string;
}) {
  const theme = useMemo<WebsiteTheme>(() => {
    const preset = getWebsiteThemeById(presetId);
    return overrides ? { ...preset, colors: { ...preset.colors, ...overrides } } : preset;
  }, [presetId, overrides]);

  const style = useMemo<CSSProperties>(
    () =>
      ({
        "--fsx-color-primary": theme.colors.primary,
        "--fsx-color-secondary": theme.colors.secondary,
        "--fsx-color-accent": theme.colors.accent,
        "--fsx-color-background": theme.colors.background,
        "--fsx-color-surface": theme.colors.surface,
        "--fsx-color-text": theme.colors.text,
        "--fsx-color-text-muted": theme.colors.textMuted,
        "--fsx-color-border": theme.colors.border,
        "--fsx-radius": RADIUS_SCALE[theme.radius],
        "--fsx-space-section": SPACING_SCALE[theme.spacing],
        "--fsx-font-heading": WEBSITE_FONT_CSS_VAR[theme.fonts.heading],
        "--fsx-font-body": WEBSITE_FONT_CSS_VAR[theme.fonts.body],
        fontFamily: "var(--fsx-font-body)",
      }) as CSSProperties,
    [theme]
  );

  return (
    <WebsiteThemeContext.Provider value={theme}>
      <div className={`bg-[var(--fsx-color-background)] text-[var(--fsx-color-text)] ${className ?? ""}`} style={style}>
        {children}
      </div>
    </WebsiteThemeContext.Provider>
  );
}
