import {
  DM_Serif_Display,
  Inter,
  Merriweather,
  Playfair_Display,
  Poppins,
  Space_Grotesk,
} from "next/font/google";
import type { WebsiteFontChoice } from "@fsx/templates";

const fontInter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fontPlayfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: "swap",
});
const fontPoppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});
const fontMerriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-merriweather",
  display: "swap",
});
const fontSpaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});
const fontDmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-dm-serif-display",
  display: "swap",
});

/** Applied once on the root layout so every theme's font CSS variables exist globally. */
export const websiteFontVariables = [
  fontInter.variable,
  fontPlayfairDisplay.variable,
  fontPoppins.variable,
  fontMerriweather.variable,
  fontSpaceGrotesk.variable,
  fontDmSerifDisplay.variable,
].join(" ");

export const WEBSITE_FONT_CSS_VAR: Record<WebsiteFontChoice, string> = {
  inter: "var(--font-inter)",
  "playfair-display": "var(--font-playfair-display)",
  poppins: "var(--font-poppins)",
  merriweather: "var(--font-merriweather)",
  "space-grotesk": "var(--font-space-grotesk)",
  "dm-serif-display": "var(--font-dm-serif-display)",
};
