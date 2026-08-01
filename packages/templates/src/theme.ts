export type WebsiteThemeColors = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
};

export type WebsiteFontChoice =
  | "inter"
  | "playfair-display"
  | "poppins"
  | "merriweather"
  | "space-grotesk"
  | "dm-serif-display";

export type WebsiteButtonStyle = "solid" | "outline" | "pill" | "ghost";
export type WebsiteRadius = "none" | "sm" | "md" | "lg" | "full";
export type WebsiteSpacing = "compact" | "comfortable" | "spacious";

export type WebsiteTheme = {
  id: string;
  name: string;
  colors: WebsiteThemeColors;
  fonts: { heading: WebsiteFontChoice; body: WebsiteFontChoice };
  buttonStyle: WebsiteButtonStyle;
  radius: WebsiteRadius;
  spacing: WebsiteSpacing;
};

export const websiteThemePresets: WebsiteTheme[] = [
  {
    id: "modern-blue",
    name: "Modern Blue",
    colors: {
      primary: "#2563eb",
      secondary: "#1e3a8a",
      accent: "#38bdf8",
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#0f172a",
      textMuted: "#475569",
      border: "#e2e8f0",
    },
    fonts: { heading: "inter", body: "inter" },
    buttonStyle: "solid",
    radius: "md",
    spacing: "comfortable",
  },
  {
    id: "luxury-dark",
    name: "Luxury Dark",
    colors: {
      primary: "#c9a875",
      secondary: "#8a6d3b",
      accent: "#e8d5b5",
      background: "#0b0a08",
      surface: "#17140f",
      text: "#f5f0e6",
      textMuted: "#b8ac96",
      border: "#2c2620",
    },
    fonts: { heading: "playfair-display", body: "inter" },
    buttonStyle: "outline",
    radius: "none",
    spacing: "spacious",
  },
  {
    id: "warm-earth",
    name: "Warm Earth",
    colors: {
      primary: "#b45309",
      secondary: "#78350f",
      accent: "#f59e0b",
      background: "#fffbf5",
      surface: "#fef3e2",
      text: "#3b2a16",
      textMuted: "#7c6650",
      border: "#f0dfc4",
    },
    fonts: { heading: "merriweather", body: "inter" },
    buttonStyle: "pill",
    radius: "lg",
    spacing: "comfortable",
  },
  {
    id: "fresh-green",
    name: "Fresh Green",
    colors: {
      primary: "#16a34a",
      secondary: "#14532d",
      accent: "#86efac",
      background: "#ffffff",
      surface: "#f0fdf4",
      text: "#0f2417",
      textMuted: "#4b6355",
      border: "#dcfce7",
    },
    fonts: { heading: "poppins", body: "inter" },
    buttonStyle: "solid",
    radius: "full",
    spacing: "comfortable",
  },
  {
    id: "bold-construction",
    name: "Bold Construction",
    colors: {
      primary: "#ea580c",
      secondary: "#1c1917",
      accent: "#facc15",
      background: "#fafaf9",
      surface: "#f5f5f4",
      text: "#1c1917",
      textMuted: "#57534e",
      border: "#e7e5e4",
    },
    fonts: { heading: "space-grotesk", body: "inter" },
    buttonStyle: "solid",
    radius: "sm",
    spacing: "compact",
  },
  {
    id: "minimal-mono",
    name: "Minimal Mono",
    colors: {
      primary: "#18181b",
      secondary: "#3f3f46",
      accent: "#a1a1aa",
      background: "#ffffff",
      surface: "#fafafa",
      text: "#18181b",
      textMuted: "#71717a",
      border: "#e4e4e7",
    },
    fonts: { heading: "dm-serif-display", body: "inter" },
    buttonStyle: "ghost",
    radius: "none",
    spacing: "spacious",
  },
  {
    id: "coastal-breeze",
    name: "Coastal Breeze",
    colors: {
      primary: "#0891b2",
      secondary: "#155e75",
      accent: "#67e8f9",
      background: "#ffffff",
      surface: "#ecfeff",
      text: "#0c2a33",
      textMuted: "#4d7480",
      border: "#cffafe",
    },
    fonts: { heading: "poppins", body: "inter" },
    buttonStyle: "pill",
    radius: "lg",
    spacing: "comfortable",
  },
];

export const DEFAULT_WEBSITE_THEME_ID = "modern-blue";

export const getWebsiteThemeById = (id: string | undefined | null): WebsiteTheme => {
  const found = id ? websiteThemePresets.find((theme) => theme.id === id) : undefined;
  return found ?? websiteThemePresets.find((theme) => theme.id === DEFAULT_WEBSITE_THEME_ID)!;
};
