"use client";

import type { ComponentType } from "react";
import type { WebsiteSectionType } from "@fsx/templates";
import type { WebsiteSectionInstance } from "@/lib/website-project-state";
import { AboutEditor, AboutRenderer } from "./about";
import { CatalogEditor, CatalogRenderer } from "./catalog";
import { ContactEditor, ContactRenderer } from "./contact";
import { CtaEditor, CtaRenderer } from "./cta";
import { FaqEditor, FaqRenderer } from "./faq";
import { FeaturesEditor, FeaturesRenderer } from "./features";
import { FooterEditor, FooterRenderer } from "./footer";
import { GalleryEditor, GalleryRenderer } from "./gallery";
import { HeroEditor, HeroRenderer } from "./hero";
import { NavbarEditor, NavbarRenderer } from "./navbar";
import { PricingEditor, PricingRenderer } from "./pricing";
import { StatsEditor, StatsRenderer } from "./stats";
import { TeamEditor, TeamRenderer } from "./team";
import { TestimonialsEditor, TestimonialsRenderer } from "./testimonials";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = ComponentType<any>;

const renderers: Record<WebsiteSectionType, AnyComponent> = {
  navbar: NavbarRenderer,
  hero: HeroRenderer,
  about: AboutRenderer,
  features: FeaturesRenderer,
  catalog: CatalogRenderer,
  gallery: GalleryRenderer,
  testimonials: TestimonialsRenderer,
  stats: StatsRenderer,
  team: TeamRenderer,
  pricing: PricingRenderer,
  faq: FaqRenderer,
  cta: CtaRenderer,
  contact: ContactRenderer,
  footer: FooterRenderer,
};

const editors: Record<WebsiteSectionType, AnyComponent> = {
  navbar: NavbarEditor,
  hero: HeroEditor,
  about: AboutEditor,
  features: FeaturesEditor,
  catalog: CatalogEditor,
  gallery: GalleryEditor,
  testimonials: TestimonialsEditor,
  stats: StatsEditor,
  team: TeamEditor,
  pricing: PricingEditor,
  faq: FaqEditor,
  cta: CtaEditor,
  contact: ContactEditor,
  footer: FooterEditor,
};

export const SECTION_TYPE_LABELS: Record<WebsiteSectionType, string> = {
  navbar: "Navbar",
  hero: "Hero",
  about: "About",
  features: "Features",
  catalog: "Catalog",
  gallery: "Gallery",
  testimonials: "Testimonials",
  stats: "Stats",
  team: "Team",
  pricing: "Pricing",
  faq: "FAQ",
  cta: "Call to action",
  contact: "Contact",
  footer: "Footer",
};

export function SectionRenderer({ section }: { section: WebsiteSectionInstance }) {
  const Component = renderers[section.type];
  return <Component section={section} />;
}

export function SectionEditor({
  section,
  onChange,
}: {
  section: WebsiteSectionInstance;
  onChange: (next: WebsiteSectionInstance) => void;
}) {
  const Component = editors[section.type];
  return <Component section={section} onChange={onChange} />;
}

const createId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

export function createDefaultSectionInstance(type: WebsiteSectionType): WebsiteSectionInstance {
  const id = createId(type);
  switch (type) {
    case "navbar":
      return { id, type, brand: "Brand", links: [{ label: "Home", href: "/" }] };
    case "hero":
      return { id, type, heading: "New hero heading", body: "Describe your value proposition.", layout: "image-right" };
    case "about":
      return { id, type, heading: "About us", body: "Tell your story here." };
    case "features":
      return {
        id,
        type,
        heading: "Features",
        items: [{ title: "Feature one", body: "Describe a core benefit." }],
      };
    case "catalog":
      return {
        id,
        type,
        heading: "Catalog",
        items: [{ title: "Item one", description: "Describe this item." }],
        variant: "products",
      };
    case "gallery":
      return { id, type, images: [] };
    case "testimonials":
      return { id, type, items: [{ quote: "Great experience!", author: "A happy customer" }] };
    case "stats":
      return { id, type, items: [{ value: "100+", label: "Metric" }] };
    case "team":
      return { id, type, heading: "Our team", items: [{ name: "New member", role: "Role" }] };
    case "pricing":
      return {
        id,
        type,
        heading: "Pricing",
        tiers: [{ name: "Starter", price: "$0", features: ["Feature one"], ctaLabel: "Get started" }],
      };
    case "faq":
      return { id, type, items: [{ question: "New question?", answer: "Answer goes here." }] };
    case "cta":
      return { id, type, heading: "Ready to get started?", primaryCta: { label: "Get started", href: "#" } };
    case "contact":
      return { id, type, heading: "Contact us", variant: "form" };
    case "footer":
      return { id, type, brand: "Brand", columns: [], copyrightText: `© ${new Date().getFullYear()} All rights reserved.` };
    default:
      throw new Error(`Unknown section type: ${type satisfies never}`);
  }
}
