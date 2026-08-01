export type WebsiteSectionType =
  | "navbar"
  | "hero"
  | "about"
  | "features"
  | "catalog"
  | "gallery"
  | "testimonials"
  | "stats"
  | "team"
  | "pricing"
  | "faq"
  | "cta"
  | "contact"
  | "footer";

export type WebsiteButtonRef = {
  label: string;
  href: string;
};

export type NavbarSection = {
  type: "navbar";
  brand: string;
  links: { label: string; href: string }[];
  cta?: WebsiteButtonRef;
};

export type HeroSection = {
  type: "hero";
  eyebrow?: string;
  heading: string;
  subheading?: string;
  body?: string;
  primaryCta?: WebsiteButtonRef;
  secondaryCta?: WebsiteButtonRef;
  imageUrl?: string | null;
  layout: "image-right" | "image-left" | "background" | "center";
};

export type AboutSection = {
  type: "about";
  heading: string;
  body: string;
  imageUrl?: string | null;
  variant?: "story" | "mission";
};

export type FeaturesVariant =
  | "services"
  | "amenities"
  | "programs"
  | "practice-areas"
  | "why-choose-us"
  | "why-shop-with-us"
  | "why-book-with-us";

export type FeaturesSection = {
  type: "features";
  heading: string;
  intro?: string;
  items: { icon?: string; title: string; body: string }[];
  variant?: FeaturesVariant;
};

export type CatalogItem = {
  imageUrl?: string | null;
  title: string;
  description: string;
  price?: string;
  meta?: string;
  ctaLabel?: string;
};

export type CatalogSection = {
  type: "catalog";
  heading: string;
  intro?: string;
  items: CatalogItem[];
  variant: "products" | "listings" | "rooms" | "menu" | "packages";
};

export type GallerySection = {
  type: "gallery";
  heading?: string;
  images: { url: string; caption?: string }[];
  layout?: "grid" | "masonry" | "carousel";
};

export type TestimonialsSection = {
  type: "testimonials";
  heading?: string;
  items: { quote: string; author: string; role?: string; avatarUrl?: string | null }[];
};

export type StatsSection = {
  type: "stats";
  heading?: string;
  items: { value: string; label: string }[];
};

export type TeamSection = {
  type: "team";
  heading: string;
  items: { name: string; role: string; photoUrl?: string | null; bio?: string }[];
};

export type PricingSection = {
  type: "pricing";
  heading: string;
  tiers: { name: string; price: string; period?: string; features: string[]; ctaLabel: string }[];
};

export type FaqSection = {
  type: "faq";
  heading?: string;
  items: { question: string; answer: string }[];
};

export type CtaSection = {
  type: "cta";
  heading: string;
  body?: string;
  primaryCta: WebsiteButtonRef;
  secondaryCta?: WebsiteButtonRef;
};

export type ContactSection = {
  type: "contact";
  heading: string;
  body?: string;
  address?: string;
  phone?: string;
  email?: string;
  mapEmbedUrl?: string;
  variant: "form" | "booking";
  bookingFields?: { checkInLabel: string; checkOutLabel: string; guestsLabel: string };
};

export type FooterSection = {
  type: "footer";
  brand: string;
  columns: { heading: string; links: { label: string; href: string }[] }[];
  socialLinks?: { label: string; href: string }[];
  copyrightText: string;
};

export type WebsiteSectionContent =
  | NavbarSection
  | HeroSection
  | AboutSection
  | FeaturesSection
  | CatalogSection
  | GallerySection
  | TestimonialsSection
  | StatsSection
  | TeamSection
  | PricingSection
  | FaqSection
  | CtaSection
  | ContactSection
  | FooterSection;

export const WEBSITE_SECTION_TYPES: WebsiteSectionType[] = [
  "navbar",
  "hero",
  "about",
  "features",
  "catalog",
  "gallery",
  "testimonials",
  "stats",
  "team",
  "pricing",
  "faq",
  "cta",
  "contact",
  "footer",
];
