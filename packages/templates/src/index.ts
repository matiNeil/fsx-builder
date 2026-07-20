export type TemplateType = "poster" | "website" | "image";

export interface TemplateDefinition {
  id: string;
  type: TemplateType;
  name: string;
  width: number;
  height: number;
  description: string;
}

export const templatePresets: TemplateDefinition[] = [
  {
    id: "poster-a4-portrait",
    type: "poster",
    name: "Poster A4 Portrait",
    width: 2480,
    height: 3508,
    description: "Print-ready A4 portrait poster template.",
  },
  {
    id: "instagram-post",
    type: "image",
    name: "Instagram Post",
    width: 1080,
    height: 1080,
    description: "Square social post template.",
  },
  {
    id: "landing-page-hero",
    type: "website",
    name: "Landing Hero Section",
    width: 1440,
    height: 720,
    description: "Hero section baseline for website composition.",
  },
];
