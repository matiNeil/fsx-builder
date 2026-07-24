export type TemplateType = "poster" | "website" | "image";
export type WebsiteTemplateCategory =
  | "Business"
  | "Portfolio"
  | "Store"
  | "Food"
  | "Media"
  | "Events"
  | "Education"
  | "Health"
  | "Real Estate"
  | "Nonprofit"
  | "Technology"
  | "Landing";

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
    id: "website-saas-landing",
    type: "website",
    name: "SaaS Landing",
    width: 1440,
    height: 2200,
    description: "Hero, features, testimonials, and pricing for SaaS products.",
  },
  {
    id: "website-startup-pitch",
    type: "website",
    name: "Startup Pitch",
    width: 1440,
    height: 2100,
    description: "Clean startup homepage with traction and investor CTA sections.",
  },
  {
    id: "website-agency-showcase",
    type: "website",
    name: "Agency Showcase",
    width: 1440,
    height: 2300,
    description: "Portfolio-first layout for agencies and studios.",
  },
  {
    id: "website-portfolio-minimal",
    type: "website",
    name: "Portfolio Minimal",
    width: 1280,
    height: 2000,
    description: "Minimal personal portfolio for designers and developers.",
  },
  {
    id: "website-freelancer-profile",
    type: "website",
    name: "Freelancer Profile",
    width: 1280,
    height: 1900,
    description: "Single-page profile with services, work samples, and contact.",
  },
  {
    id: "website-ecommerce-home",
    type: "website",
    name: "Ecommerce Home",
    width: 1440,
    height: 2600,
    description: "Product grid, featured collections, and promotional banners.",
  },
  {
    id: "website-fashion-store",
    type: "website",
    name: "Fashion Store",
    width: 1440,
    height: 2500,
    description: "Editorial style storefront for apparel and lifestyle brands.",
  },
  {
    id: "website-food-delivery",
    type: "website",
    name: "Food Delivery",
    width: 1440,
    height: 2200,
    description: "Restaurant cards, categories, and app download sections.",
  },
  {
    id: "website-restaurant",
    type: "website",
    name: "Restaurant",
    width: 1366,
    height: 2100,
    description: "Menu highlights, reservations, and chef story layout.",
  },
  {
    id: "website-cafe",
    type: "website",
    name: "Cafe",
    width: 1366,
    height: 1900,
    description: "Warm branding template for cafes and coffee shops.",
  },
  {
    id: "website-travel-blog",
    type: "website",
    name: "Travel Blog",
    width: 1366,
    height: 2400,
    description: "Story-first travel journal with featured destinations.",
  },
  {
    id: "website-news-magazine",
    type: "website",
    name: "News Magazine",
    width: 1440,
    height: 2800,
    description: "Multi-column editorial homepage for online publications.",
  },
  {
    id: "website-personal-blog",
    type: "website",
    name: "Personal Blog",
    width: 1280,
    height: 2200,
    description: "Simple blog index with featured post and newsletter CTA.",
  },
  {
    id: "website-podcast",
    type: "website",
    name: "Podcast",
    width: 1440,
    height: 2100,
    description: "Episode-focused template with player and guest highlights.",
  },
  {
    id: "website-event-conference",
    type: "website",
    name: "Event Conference",
    width: 1440,
    height: 2400,
    description: "Speaker lineup, agenda, sponsors, and ticket section.",
  },
  {
    id: "website-webinar",
    type: "website",
    name: "Webinar Registration",
    width: 1280,
    height: 1800,
    description: "Conversion-focused webinar registration page.",
  },
  {
    id: "website-course-sales",
    type: "website",
    name: "Course Sales Page",
    width: 1440,
    height: 2600,
    description: "Online course page with curriculum, outcomes, and FAQs.",
  },
  {
    id: "website-edtech-platform",
    type: "website",
    name: "EdTech Platform",
    width: 1440,
    height: 2300,
    description: "Learning platform layout with tracks and student stories.",
  },
  {
    id: "website-healthcare-clinic",
    type: "website",
    name: "Healthcare Clinic",
    width: 1366,
    height: 2200,
    description: "Trust-oriented medical clinic homepage with appointment CTA.",
  },
  {
    id: "website-fitness-gym",
    type: "website",
    name: "Fitness Gym",
    width: 1366,
    height: 2300,
    description: "High-energy gym template with class schedule and plans.",
  },
  {
    id: "website-realty-listings",
    type: "website",
    name: "Realty Listings",
    width: 1440,
    height: 2500,
    description: "Property cards, map section, and agent profiles.",
  },
  {
    id: "website-law-firm",
    type: "website",
    name: "Law Firm",
    width: 1366,
    height: 2100,
    description: "Professional legal services template with practice areas.",
  },
  {
    id: "website-nonprofit",
    type: "website",
    name: "Nonprofit Campaign",
    width: 1440,
    height: 2300,
    description: "Mission-led layout with impact stats and donation CTA.",
  },
  {
    id: "website-charity-fundraiser",
    type: "website",
    name: "Charity Fundraiser",
    width: 1280,
    height: 2100,
    description: "Fundraising microsite with progress and campaign story.",
  },
  {
    id: "website-product-launch",
    type: "website",
    name: "Product Launch",
    width: 1440,
    height: 2200,
    description: "Launch announcement page with waitlist and feature teasers.",
  },
  {
    id: "website-mobile-app",
    type: "website",
    name: "Mobile App Landing",
    width: 1440,
    height: 2100,
    description: "App screenshots, features, and app store download links.",
  },
  {
    id: "website-community-forum",
    type: "website",
    name: "Community Forum",
    width: 1366,
    height: 2200,
    description: "Community-centric template with discussions and onboarding.",
  },
  {
    id: "website-corporate",
    type: "website",
    name: "Corporate",
    width: 1440,
    height: 2400,
    description: "Enterprise-style homepage with solutions and case studies.",
  },
  {
    id: "website-b2b-services",
    type: "website",
    name: "B2B Services",
    width: 1366,
    height: 2300,
    description: "Lead-generation design for consulting and B2B services.",
  },
  {
    id: "website-support-docs",
    type: "website",
    name: "Support Docs Home",
    width: 1440,
    height: 2000,
    description: "Documentation homepage with search and category cards.",
  },
  {
    id: "website-marketplace",
    type: "website",
    name: "Marketplace",
    width: 1440,
    height: 2600,
    description: "Two-sided marketplace homepage with categories and trust.",
  },
  {
    id: "website-creator-link-in-bio",
    type: "website",
    name: "Creator Link-in-Bio",
    width: 1080,
    height: 1920,
    description: "Mobile-first landing page for creators and social links.",
  },
  {
    id: "website-coming-soon",
    type: "website",
    name: "Coming Soon",
    width: 1280,
    height: 1400,
    description: "Simple waitlist page for pre-launch products.",
  },
  {
    id: "website-job-board",
    type: "website",
    name: "Job Board",
    width: 1440,
    height: 2500,
    description: "Hiring-focused layout with featured roles and filters.",
  },
  {
    id: "website-education-school",
    type: "website",
    name: "School Website",
    width: 1366,
    height: 2400,
    description: "Academic institution homepage with programs and admissions.",
  },
  {
    id: "website-crypto-dashboard",
    type: "website",
    name: "Crypto Dashboard Landing",
    width: 1440,
    height: 2200,
    description: "Modern fintech landing with charts and product modules.",
  },
  {
    id: "poster-a4-portrait",
    type: "poster",
    name: "Poster A4 Portrait",
    width: 2480,
    height: 3508,
    description: "Print-ready A4 portrait poster template.",
  },
  {
    id: "poster-event-flyer",
    type: "poster",
    name: "Event Flyer",
    width: 1080,
    height: 1920,
    description: "High-impact event promotion poster for social and print.",
  },
  {
    id: "poster-conference-announcement",
    type: "poster",
    name: "Conference Announcement",
    width: 1440,
    height: 2160,
    description: "Professional conference announcement poster with speaker details.",
  },
  {
    id: "poster-music-night",
    type: "poster",
    name: "Music Night",
    width: 1080,
    height: 1350,
    description: "Concert and live music event poster with bold typography.",
  },
  {
    id: "poster-food-promo",
    type: "poster",
    name: "Food Promo",
    width: 1200,
    height: 1800,
    description: "Restaurant and food promotion poster with offer-first layout.",
  },
  {
    id: "poster-startup-hiring",
    type: "poster",
    name: "Startup Hiring",
    width: 1080,
    height: 1080,
    description: "Square hiring campaign poster for social channels.",
  },
  {
    id: "poster-webinar-signup",
    type: "poster",
    name: "Webinar Signup",
    width: 1080,
    height: 1920,
    description: "Lead-generation webinar signup poster with strong CTA.",
  },
  {
    id: "poster-corporate-workshop",
    type: "poster",
    name: "Corporate Workshop",
    width: 1240,
    height: 1754,
    description: "Corporate workshop and training poster for teams.",
  },
  {
    id: "poster-sale-campaign",
    type: "poster",
    name: "Sale Campaign",
    width: 1080,
    height: 1350,
    description: "Retail sale campaign poster with discount-first composition.",
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

export const getTemplatesByType = (type: TemplateType): TemplateDefinition[] =>
  templatePresets.filter((template) => template.type === type);

export const getWebsiteTemplateCategory = (
  template: TemplateDefinition
): WebsiteTemplateCategory => {
  const id = template.id;
  if (id.includes("ecommerce") || id.includes("fashion") || id.includes("marketplace")) {
    return "Store";
  }
  if (id.includes("restaurant") || id.includes("cafe") || id.includes("food")) {
    return "Food";
  }
  if (id.includes("portfolio") || id.includes("freelancer")) {
    return "Portfolio";
  }
  if (
    id.includes("blog") ||
    id.includes("podcast") ||
    id.includes("news") ||
    id.includes("forum")
  ) {
    return "Media";
  }
  if (id.includes("event") || id.includes("webinar")) {
    return "Events";
  }
  if (id.includes("course") || id.includes("edtech") || id.includes("school")) {
    return "Education";
  }
  if (id.includes("healthcare") || id.includes("fitness")) {
    return "Health";
  }
  if (id.includes("realty")) {
    return "Real Estate";
  }
  if (id.includes("nonprofit") || id.includes("charity")) {
    return "Nonprofit";
  }
  if (id.includes("saas") || id.includes("startup") || id.includes("crypto")) {
    return "Technology";
  }
  if (
    id.includes("landing") ||
    id.includes("coming-soon") ||
    id.includes("product-launch") ||
    id.includes("link-in-bio")
  ) {
    return "Landing";
  }
  return "Business";
};

export const listWebsiteTemplateCategories = (): WebsiteTemplateCategory[] => {
  const categories = new Set<WebsiteTemplateCategory>();
  getTemplatesByType("website").forEach((template) => {
    categories.add(getWebsiteTemplateCategory(template));
  });
  return [...categories].sort();
};

export const searchWebsiteTemplates = (
  templates: TemplateDefinition[],
  query: string,
  category: WebsiteTemplateCategory | "All"
): TemplateDefinition[] => {
  const normalizedQuery = query.trim().toLowerCase();
  return templates.filter((template) => {
    const templateCategory = getWebsiteTemplateCategory(template);
    const categoryMatches = category === "All" || templateCategory === category;
    if (!categoryMatches) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    const searchableText = [
      template.name,
      template.description,
      template.id,
      `${template.width}x${template.height}`,
      templateCategory,
    ]
      .join(" ")
      .toLowerCase();
    return searchableText.includes(normalizedQuery);
  });
};
