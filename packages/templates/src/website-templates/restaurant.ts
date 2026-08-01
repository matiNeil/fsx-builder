import type { WebsiteTemplateDefinition } from "../website-template-definitions.js";

export const restaurantTemplate: WebsiteTemplateDefinition = {
  id: "website-restaurant",
  defaultThemeId: "warm-earth",
  pages: [
    {
      title: "Home",
      slug: "",
      sections: [
        {
          type: "navbar",
          brand: "Bellview Bistro",
          links: [
            { label: "Menu", href: "#menu" },
            { label: "Our story", href: "#about" },
            { label: "Gallery", href: "#gallery" },
            { label: "Reservations", href: "#contact" },
          ],
          cta: { label: "Reserve a table", href: "#contact" },
        },
        {
          type: "hero",
          eyebrow: "Est. 2011",
          heading: "Seasonal plates, made from scratch",
          subheading: "A neighborhood kitchen built around local produce and open flame cooking.",
          primaryCta: { label: "Reserve a table", href: "#contact" },
          secondaryCta: { label: "View menu", href: "#menu" },
          imageUrl: "https://picsum.photos/seed/restaurant-hero/1600/1200",
          layout: "background",
        },
        {
          type: "about",
          heading: "Our story",
          body: "Bellview Bistro started as a weekend pop-up and grew into a full kitchen built on the same idea: cook what's in season, source from farms we know, and keep the plate honest.",
          imageUrl: "https://picsum.photos/seed/restaurant-about/1200/900",
          variant: "story",
        },
        {
          type: "catalog",
          heading: "From the kitchen",
          intro: "A short menu that changes with the season.",
          variant: "menu",
          items: [
            {
              title: "Charred octopus",
              description: "White beans, chorizo, lemon oil.",
              price: "$22",
              imageUrl: "https://picsum.photos/seed/restaurant-menu-1/600/450",
            },
            {
              title: "Wood-fired short rib",
              description: "Root vegetable purée, salsa verde.",
              price: "$34",
              imageUrl: "https://picsum.photos/seed/restaurant-menu-2/600/450",
            },
            {
              title: "Burrata & heirloom tomato",
              description: "Basil oil, aged balsamic, sourdough crumb.",
              price: "$18",
              imageUrl: "https://picsum.photos/seed/restaurant-menu-3/600/450",
            },
            {
              title: "Brown butter tart",
              description: "Seasonal fruit, crème fraîche.",
              price: "$12",
              imageUrl: "https://picsum.photos/seed/restaurant-menu-4/600/450",
            },
          ],
        },
        {
          type: "gallery",
          heading: "Inside the dining room",
          images: [
            { url: "https://picsum.photos/seed/restaurant-gallery-1/800/800" },
            { url: "https://picsum.photos/seed/restaurant-gallery-2/800/800" },
            { url: "https://picsum.photos/seed/restaurant-gallery-3/800/800" },
            { url: "https://picsum.photos/seed/restaurant-gallery-4/800/800" },
            { url: "https://picsum.photos/seed/restaurant-gallery-5/800/800" },
            { url: "https://picsum.photos/seed/restaurant-gallery-6/800/800" },
          ],
        },
        {
          type: "testimonials",
          heading: "What guests say",
          items: [
            {
              quote: "Best short rib in the city, hands down. We come back every month.",
              author: "Renata Cole",
              avatarUrl: "https://picsum.photos/seed/restaurant-testimonial-1/200/200",
            },
            {
              quote: "Warm room, honest food, no pretense. Exactly what we wanted.",
              author: "Julian Marsh",
              avatarUrl: "https://picsum.photos/seed/restaurant-testimonial-2/200/200",
            },
          ],
        },
        {
          type: "cta",
          heading: "Join us this weekend",
          body: "Walk-ins welcome, but reservations get you the good table.",
          primaryCta: { label: "Reserve a table", href: "#contact" },
        },
        {
          type: "contact",
          heading: "Visit us",
          body: "Open Tuesday–Sunday, 5pm–11pm.",
          address: "142 Bellview Ave, Portland, OR",
          phone: "+1 (503) 555-0119",
          email: "reservations@bellviewbistro.example",
          variant: "form",
        },
        {
          type: "footer",
          brand: "Bellview Bistro",
          columns: [
            {
              heading: "Visit",
              links: [
                { label: "Menu", href: "#menu" },
                { label: "Reservations", href: "#contact" },
                { label: "Gift cards", href: "#" },
              ],
            },
          ],
          socialLinks: [
            { label: "Instagram", href: "#" },
            { label: "Facebook", href: "#" },
          ],
          copyrightText: `© ${new Date().getFullYear()} Bellview Bistro. All rights reserved.`,
        },
      ],
    },
  ],
};
