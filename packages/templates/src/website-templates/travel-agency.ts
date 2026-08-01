import type { WebsiteTemplateDefinition } from "../website-template-definitions.js";

export const travelAgencyTemplate: WebsiteTemplateDefinition = {
  id: "website-travel-agency",
  defaultThemeId: "warm-earth",
  pages: [
    {
      title: "Home",
      slug: "",
      sections: [
        {
          type: "navbar",
          brand: "Wanderlight Travel",
          links: [
            { label: "Destinations", href: "#packages" },
            { label: "Why us", href: "#services" },
            { label: "Gallery", href: "#gallery" },
            { label: "Contact", href: "#contact" },
          ],
          cta: { label: "Plan my trip", href: "#contact" },
        },
        {
          type: "hero",
          eyebrow: "Custom-planned journeys",
          heading: "Trips planned around how you actually want to travel",
          subheading: "Hand-built itineraries, local guides, and 24/7 support on the ground.",
          primaryCta: { label: "Plan my trip", href: "#contact" },
          secondaryCta: { label: "See destinations", href: "#packages" },
          imageUrl: "https://picsum.photos/seed/travel-hero/1600/1200",
          layout: "background",
        },
        {
          type: "about",
          heading: "Real itineraries, built by people who've been there",
          body: "Every Wanderlight trip is designed by a travel specialist who has visited the destination. No templated tours — just itineraries built around your pace, budget, and interests.",
          imageUrl: "https://picsum.photos/seed/travel-about/1200/900",
        },
        {
          type: "catalog",
          heading: "Popular destinations",
          variant: "packages",
          items: [
            {
              title: "Northern Portugal, 8 days",
              description: "Porto, Douro Valley wine country, coastal towns.",
              price: "From $2,450",
              imageUrl: "https://picsum.photos/seed/travel-package-1/700/500",
            },
            {
              title: "Japan in Autumn, 12 days",
              description: "Tokyo, Kyoto, Hakone, private guide included.",
              price: "From $4,900",
              imageUrl: "https://picsum.photos/seed/travel-package-2/700/500",
            },
            {
              title: "Peru Highlands, 10 days",
              description: "Cusco, Sacred Valley, Machu Picchu trek.",
              price: "From $3,200",
              imageUrl: "https://picsum.photos/seed/travel-package-3/700/500",
            },
          ],
        },
        {
          type: "features",
          heading: "Why book with us",
          variant: "why-book-with-us",
          items: [
            { title: "Local specialists", body: "Every itinerary designed by someone who's lived it." },
            { title: "24/7 support", body: "A real person to call if anything changes mid-trip." },
            { title: "No hidden fees", body: "Transparent pricing from the first quote." },
          ],
        },
        {
          type: "gallery",
          heading: "Where we've been",
          images: [
            { url: "https://picsum.photos/seed/travel-gallery-1/800/600" },
            { url: "https://picsum.photos/seed/travel-gallery-2/800/600" },
            { url: "https://picsum.photos/seed/travel-gallery-3/800/600" },
            { url: "https://picsum.photos/seed/travel-gallery-4/800/600" },
          ],
        },
        {
          type: "testimonials",
          heading: "Traveler stories",
          items: [
            { quote: "They rebuilt our entire itinerary overnight when a storm hit. Never missed a beat.", author: "The Sharma family" },
            { quote: "Best trip we've ever taken, and we didn't have to plan a single detail.", author: "Ellen & Marcus Byrd" },
          ],
        },
        {
          type: "faq",
          heading: "Planning FAQ",
          items: [
            { question: "How far in advance should I book?", answer: "We recommend 3–6 months for custom itineraries, longer for peak season." },
            { question: "Do you handle visas and travel documents?", answer: "Yes, our team assists with visa requirements for every destination." },
          ],
        },
        {
          type: "contact",
          heading: "Start planning your trip",
          body: "Tell us where you want to go and we'll send a custom itinerary within 48 hours.",
          email: "plan@wanderlighttravel.example",
          phone: "+1 (206) 555-0155",
          variant: "form",
        },
        {
          type: "footer",
          brand: "Wanderlight Travel",
          columns: [
            {
              heading: "Explore",
              links: [
                { label: "Destinations", href: "#packages" },
                { label: "Gallery", href: "#gallery" },
              ],
            },
          ],
          socialLinks: [{ label: "Instagram", href: "#" }],
          copyrightText: `© ${new Date().getFullYear()} Wanderlight Travel.`,
        },
      ],
    },
  ],
};
