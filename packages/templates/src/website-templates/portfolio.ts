import type { WebsiteTemplateDefinition } from "../website-template-definitions.js";

export const portfolioTemplate: WebsiteTemplateDefinition = {
  id: "website-portfolio-minimal",
  defaultThemeId: "minimal-mono",
  pages: [
    {
      title: "Home",
      slug: "",
      sections: [
        {
          type: "navbar",
          brand: "Ava Chen",
          links: [
            { label: "Work", href: "#gallery" },
            { label: "About", href: "#about" },
            { label: "Contact", href: "#contact" },
          ],
        },
        {
          type: "hero",
          eyebrow: "Product designer",
          heading: "I design interfaces people actually enjoy using",
          subheading: "Currently designing at a Series B fintech startup. Open to select freelance work.",
          primaryCta: { label: "View work", href: "#gallery" },
          secondaryCta: { label: "Get in touch", href: "#contact" },
          layout: "center",
        },
        {
          type: "about",
          heading: "About me",
          body: "I'm a product designer with eight years of experience across fintech, healthcare, and developer tools. I care most about the details most people never notice — the ones that make a product feel effortless.",
          imageUrl: "https://picsum.photos/seed/portfolio-about/900/900",
        },
        {
          type: "gallery",
          heading: "Selected work",
          images: [
            { url: "https://picsum.photos/seed/portfolio-work-1/900/700", caption: "Ledger — mobile banking redesign" },
            { url: "https://picsum.photos/seed/portfolio-work-2/900/700", caption: "Northwind — developer dashboard" },
            { url: "https://picsum.photos/seed/portfolio-work-3/900/700", caption: "Clario — patient scheduling app" },
            { url: "https://picsum.photos/seed/portfolio-work-4/900/700", caption: "Fable — design system" },
          ],
        },
        {
          type: "testimonials",
          items: [
            {
              quote: "Ava is the rare designer who can also explain the 'why' to engineers and executives alike.",
              author: "Kofi Mensah",
              role: "VP Product, Ledger",
            },
          ],
        },
        {
          type: "contact",
          heading: "Let's work together",
          body: "I'm currently available for a limited number of freelance engagements.",
          email: "hello@avachen.example",
          variant: "form",
        },
        {
          type: "footer",
          brand: "Ava Chen",
          columns: [],
          socialLinks: [
            { label: "Dribbble", href: "#" },
            { label: "LinkedIn", href: "#" },
          ],
          copyrightText: `© ${new Date().getFullYear()} Ava Chen.`,
        },
      ],
    },
  ],
};
