import type { WebsiteTemplateDefinition } from "../website-template-definitions.js";

export const realEstateTemplate: WebsiteTemplateDefinition = {
  id: "website-realty-listings",
  defaultThemeId: "minimal-mono",
  pages: [
    {
      title: "Home",
      slug: "",
      sections: [
        {
          type: "navbar",
          brand: "Highline Realty",
          links: [
            { label: "Listings", href: "#listings" },
            { label: "About", href: "#about" },
            { label: "Agents", href: "#team" },
            { label: "Contact", href: "#contact" },
          ],
          cta: { label: "Book a viewing", href: "#contact" },
        },
        {
          type: "hero",
          eyebrow: "Boutique real estate",
          heading: "Find a home that actually fits your life",
          subheading: "Curated listings across the city, backed by agents who know every block.",
          primaryCta: { label: "Browse listings", href: "#listings" },
          secondaryCta: { label: "Talk to an agent", href: "#contact" },
          imageUrl: "https://picsum.photos/seed/realestate-hero/1600/1200",
          layout: "image-right",
        },
        {
          type: "about",
          heading: "Local expertise, honest advice",
          body: "Highline Realty has helped over 900 families buy and sell in this city. We're not interested in the fastest close — we're interested in the right one.",
          imageUrl: "https://picsum.photos/seed/realestate-about/1200/900",
        },
        {
          type: "catalog",
          heading: "Featured listings",
          variant: "listings",
          items: [
            {
              title: "Modern loft, Arts District",
              description: "2 bed, 2 bath, 1,450 sqft, exposed brick.",
              price: "$685,000",
              meta: "2 bd · 2 ba · 1,450 sqft",
              ctaLabel: "View listing",
              imageUrl: "https://picsum.photos/seed/realestate-listing-1/700/500",
            },
            {
              title: "Craftsman bungalow, Maple Hill",
              description: "3 bed, 2 bath, updated kitchen, large yard.",
              price: "$549,000",
              meta: "3 bd · 2 ba · 1,800 sqft",
              ctaLabel: "View listing",
              imageUrl: "https://picsum.photos/seed/realestate-listing-2/700/500",
            },
            {
              title: "Riverside condo",
              description: "1 bed, 1 bath, floor-to-ceiling windows, water views.",
              price: "$412,000",
              meta: "1 bd · 1 ba · 820 sqft",
              ctaLabel: "View listing",
              imageUrl: "https://picsum.photos/seed/realestate-listing-3/700/500",
            },
          ],
        },
        {
          type: "features",
          heading: "Why work with us",
          variant: "why-choose-us",
          items: [
            { title: "Local market data", body: "Real comps and pricing guidance, not guesswork." },
            { title: "Dedicated agent", body: "One point of contact from search to closing." },
            { title: "Negotiation support", body: "We fight for terms that protect you, not just the sale." },
          ],
        },
        {
          type: "stats",
          items: [
            { value: "900+", label: "Homes sold" },
            { value: "18 days", label: "Average time to offer" },
            { value: "4.9★", label: "Client rating" },
          ],
        },
        {
          type: "testimonials",
          heading: "What clients say",
          items: [
            {
              quote: "They found us three homes we never would have seen on our own.",
              author: "The Osei family",
            },
            {
              quote: "Our agent negotiated $18k off asking. Worth every bit of the commission.",
              author: "Carla Jimenez",
            },
          ],
        },
        {
          type: "team",
          heading: "Meet the agents",
          items: [
            { name: "Ravi Suresh", role: "Principal Broker", photoUrl: "https://picsum.photos/seed/realestate-team-1/400/400" },
            { name: "Lena Brooks", role: "Senior Agent", photoUrl: "https://picsum.photos/seed/realestate-team-2/400/400" },
          ],
        },
        {
          type: "contact",
          heading: "Book a viewing",
          body: "Tell us what you're looking for and we'll line up showings this week.",
          address: "88 Highline Ave, Chicago, IL",
          phone: "+1 (312) 555-0177",
          email: "hello@highlinerealty.example",
          variant: "form",
        },
        {
          type: "footer",
          brand: "Highline Realty",
          columns: [
            {
              heading: "Explore",
              links: [
                { label: "Listings", href: "#listings" },
                { label: "Agents", href: "#team" },
              ],
            },
          ],
          copyrightText: `© ${new Date().getFullYear()} Highline Realty. Equal housing opportunity.`,
        },
      ],
    },
  ],
};
