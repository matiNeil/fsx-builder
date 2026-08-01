import type { WebsiteTemplateDefinition } from "../website-template-definitions.js";

export const corporateTemplate: WebsiteTemplateDefinition = {
  id: "website-corporate",
  defaultThemeId: "modern-blue",
  pages: [
    {
      title: "Home",
      slug: "",
      sections: [
        {
          type: "navbar",
          brand: "Meridian Group",
          links: [
            { label: "About", href: "#about" },
            { label: "Services", href: "#services" },
            { label: "Team", href: "#team" },
            { label: "Contact", href: "#contact" },
          ],
          cta: { label: "Get in touch", href: "#contact" },
        },
        {
          type: "hero",
          eyebrow: "Enterprise consulting",
          heading: "Strategy and execution for ambitious companies",
          subheading: "We help enterprise teams plan, build, and scale with confidence.",
          body: "From market entry to operating model redesign, Meridian Group partners with leadership teams to turn strategy into measurable results.",
          primaryCta: { label: "Book a consultation", href: "#contact" },
          secondaryCta: { label: "Our services", href: "#services" },
          imageUrl: "https://picsum.photos/seed/corporate-hero/1600/1200",
          layout: "image-right",
        },
        {
          type: "about",
          heading: "Two decades of turning strategy into results",
          body: "Meridian Group was founded to close the gap between big ideas and real execution. Our consultants embed with your team, bringing structure, data, and hands-on delivery to every engagement.",
          imageUrl: "https://picsum.photos/seed/corporate-about/1200/900",
        },
        {
          type: "features",
          heading: "What we do",
          intro: "Full-service consulting across strategy, operations, and technology.",
          variant: "services",
          items: [
            { title: "Strategy & planning", body: "Market analysis, growth planning, and competitive positioning." },
            { title: "Operations", body: "Process redesign and operating model transformation." },
            { title: "Technology advisory", body: "Digital transformation roadmaps and vendor selection." },
            { title: "Change management", body: "Structured rollout plans that keep teams aligned." },
          ],
        },
        {
          type: "stats",
          heading: "Trusted by growing companies",
          items: [
            { value: "180+", label: "Clients served" },
            { value: "$2.4B", label: "Value delivered" },
            { value: "22", label: "Years in business" },
            { value: "96%", label: "Client retention" },
          ],
        },
        {
          type: "testimonials",
          heading: "What clients say",
          items: [
            {
              quote: "Meridian Group didn't just hand us a deck — they stayed until the plan was actually working.",
              author: "Dana Whitfield",
              role: "COO, Larkspur Holdings",
              avatarUrl: "https://picsum.photos/seed/corporate-testimonial-1/200/200",
            },
            {
              quote: "The clearest, most pragmatic consulting engagement we've run in years.",
              author: "Marcus Ige",
              role: "CEO, Ampervale",
              avatarUrl: "https://picsum.photos/seed/corporate-testimonial-2/200/200",
            },
          ],
        },
        {
          type: "team",
          heading: "Leadership",
          items: [
            { name: "Elena Voss", role: "Managing Partner", photoUrl: "https://picsum.photos/seed/corporate-team-1/400/400" },
            { name: "Priya Anand", role: "Head of Strategy", photoUrl: "https://picsum.photos/seed/corporate-team-2/400/400" },
            { name: "Tomas Reyes", role: "Head of Operations", photoUrl: "https://picsum.photos/seed/corporate-team-3/400/400" },
          ],
        },
        {
          type: "cta",
          heading: "Ready to move faster?",
          body: "Tell us where you're headed and we'll help you build the plan to get there.",
          primaryCta: { label: "Book a consultation", href: "#contact" },
        },
        {
          type: "contact",
          heading: "Get in touch",
          body: "We typically respond within one business day.",
          address: "400 Market Street, Suite 900, San Francisco, CA",
          phone: "+1 (415) 555-0182",
          email: "hello@meridiangroup.example",
          variant: "form",
        },
        {
          type: "footer",
          brand: "Meridian Group",
          columns: [
            {
              heading: "Company",
              links: [
                { label: "About", href: "#about" },
                { label: "Team", href: "#team" },
                { label: "Careers", href: "#" },
              ],
            },
            {
              heading: "Services",
              links: [
                { label: "Strategy", href: "#services" },
                { label: "Operations", href: "#services" },
                { label: "Technology", href: "#services" },
              ],
            },
          ],
          socialLinks: [
            { label: "LinkedIn", href: "#" },
            { label: "Twitter", href: "#" },
          ],
          copyrightText: `© ${new Date().getFullYear()} Meridian Group. All rights reserved.`,
        },
      ],
    },
  ],
};
