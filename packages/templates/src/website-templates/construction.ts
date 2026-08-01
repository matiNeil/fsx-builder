import type { WebsiteTemplateDefinition } from "../website-template-definitions.js";

export const constructionTemplate: WebsiteTemplateDefinition = {
  id: "website-construction",
  defaultThemeId: "bold-construction",
  pages: [
    {
      title: "Home",
      slug: "",
      sections: [
        {
          type: "navbar",
          brand: "Ironclad Builders",
          links: [
            { label: "Services", href: "#services" },
            { label: "Projects", href: "#gallery" },
            { label: "About", href: "#about" },
            { label: "Contact", href: "#contact" },
          ],
          cta: { label: "Get a quote", href: "#contact" },
        },
        {
          type: "hero",
          eyebrow: "Licensed & insured general contractor",
          heading: "Built right, on time, every time",
          subheading: "Commercial and residential construction across the metro area.",
          primaryCta: { label: "Request a quote", href: "#contact" },
          secondaryCta: { label: "See our work", href: "#gallery" },
          imageUrl: "https://picsum.photos/seed/construction-hero/1600/1200",
          layout: "image-right",
        },
        {
          type: "about",
          heading: "Three generations of building",
          body: "Ironclad Builders has completed over 400 projects since 1994 — from ground-up commercial builds to full home renovations. Every job runs on the same principle: clear communication, real schedules, and craftsmanship that lasts.",
          imageUrl: "https://picsum.photos/seed/construction-about/1200/900",
        },
        {
          type: "features",
          heading: "What we build",
          variant: "services",
          items: [
            { title: "Commercial construction", body: "Ground-up builds and tenant improvements." },
            { title: "Residential renovation", body: "Kitchens, additions, and whole-home remodels." },
            { title: "Project management", body: "Permitting, scheduling, and subcontractor coordination." },
            { title: "Design-build", body: "Architecture and construction under one contract." },
          ],
        },
        {
          type: "gallery",
          heading: "Recent projects",
          images: [
            { url: "https://picsum.photos/seed/construction-gallery-1/800/600", caption: "Riverside office complex" },
            { url: "https://picsum.photos/seed/construction-gallery-2/800/600", caption: "Maple Street residence" },
            { url: "https://picsum.photos/seed/construction-gallery-3/800/600", caption: "Downtown retail buildout" },
            { url: "https://picsum.photos/seed/construction-gallery-4/800/600", caption: "Harbor View addition" },
          ],
        },
        {
          type: "stats",
          items: [
            { value: "400+", label: "Projects completed" },
            { value: "30 yrs", label: "In business" },
            { value: "0", label: "Missed deadlines last year" },
            { value: "4.9★", label: "Average client rating" },
          ],
        },
        {
          type: "testimonials",
          heading: "Client feedback",
          items: [
            {
              quote: "On budget, on schedule, no surprises. Exactly what you want from a contractor.",
              author: "Bill Ashford",
              role: "Property Manager, Harbor View LLC",
            },
            {
              quote: "They caught issues before they became problems. Genuinely impressed.",
              author: "Nadia Torres",
              role: "Homeowner",
            },
          ],
        },
        {
          type: "team",
          heading: "Leadership",
          items: [
            { name: "Frank Delgado", role: "Founder & General Contractor", photoUrl: "https://picsum.photos/seed/construction-team-1/400/400" },
            { name: "Sam Whitaker", role: "Project Director", photoUrl: "https://picsum.photos/seed/construction-team-2/400/400" },
          ],
        },
        {
          type: "contact",
          heading: "Start your project",
          body: "Tell us about your project and we'll follow up within one business day.",
          address: "2200 Industrial Way, Denver, CO",
          phone: "+1 (720) 555-0144",
          email: "estimates@ironcladbuilders.example",
          variant: "form",
        },
        {
          type: "footer",
          brand: "Ironclad Builders",
          columns: [
            {
              heading: "Services",
              links: [
                { label: "Commercial", href: "#services" },
                { label: "Residential", href: "#services" },
                { label: "Design-build", href: "#services" },
              ],
            },
            {
              heading: "Company",
              links: [
                { label: "About", href: "#about" },
                { label: "Projects", href: "#gallery" },
              ],
            },
          ],
          copyrightText: `© ${new Date().getFullYear()} Ironclad Builders. Licensed & insured.`,
        },
      ],
    },
  ],
};
