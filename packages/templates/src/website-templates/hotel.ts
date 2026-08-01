import type { WebsiteTemplateDefinition } from "../website-template-definitions.js";

export const hotelTemplate: WebsiteTemplateDefinition = {
  id: "website-hotel",
  defaultThemeId: "luxury-dark",
  pages: [
    {
      title: "Home",
      slug: "",
      sections: [
        {
          type: "navbar",
          brand: "The Ainsworth",
          links: [
            { label: "Rooms", href: "#rooms" },
            { label: "Amenities", href: "#amenities" },
            { label: "Gallery", href: "#gallery" },
            { label: "Contact", href: "#contact" },
          ],
          cta: { label: "Check availability", href: "#contact" },
        },
        {
          type: "hero",
          eyebrow: "Boutique hotel, downtown waterfront",
          heading: "A quiet luxury, right on the water",
          subheading: "42 rooms, one view worth staying for.",
          primaryCta: { label: "Check availability", href: "#contact" },
          secondaryCta: { label: "Explore rooms", href: "#rooms" },
          imageUrl: "https://picsum.photos/seed/hotel-hero/1600/1200",
          layout: "background",
        },
        {
          type: "about",
          heading: "Welcome to The Ainsworth",
          body: "Housed in a restored 1920s warehouse, The Ainsworth pairs original architecture with quiet, considered design. Every room faces the water.",
          imageUrl: "https://picsum.photos/seed/hotel-about/1200/900",
        },
        {
          type: "catalog",
          heading: "Rooms & suites",
          variant: "rooms",
          items: [
            {
              title: "Harbor King",
              description: "King bed, water view, soaking tub.",
              price: "$320/night",
              imageUrl: "https://picsum.photos/seed/hotel-room-1/700/500",
            },
            {
              title: "Loft Suite",
              description: "Two-level suite, private terrace.",
              price: "$480/night",
              imageUrl: "https://picsum.photos/seed/hotel-room-2/700/500",
            },
            {
              title: "Classic Queen",
              description: "Queen bed, city view, marble bath.",
              price: "$260/night",
              imageUrl: "https://picsum.photos/seed/hotel-room-3/700/500",
            },
          ],
        },
        {
          type: "features",
          heading: "Amenities",
          variant: "amenities",
          items: [
            { title: "Rooftop bar", body: "Open nightly, harbor views." },
            { title: "Spa & sauna", body: "Full-service spa, open daily." },
            { title: "In-house dining", body: "Chef-led restaurant, breakfast included." },
            { title: "Concierge", body: "24-hour concierge and valet." },
          ],
        },
        {
          type: "gallery",
          heading: "The property",
          images: [
            { url: "https://picsum.photos/seed/hotel-gallery-1/800/800" },
            { url: "https://picsum.photos/seed/hotel-gallery-2/800/800" },
            { url: "https://picsum.photos/seed/hotel-gallery-3/800/800" },
            { url: "https://picsum.photos/seed/hotel-gallery-4/800/800" },
          ],
        },
        {
          type: "testimonials",
          heading: "Guest reviews",
          items: [
            { quote: "The best hotel we've stayed at in years. Quiet, beautiful, perfectly run.", author: "Grace Liu" },
            { quote: "Room had the best view in the city. Staff remembered our names by day two.", author: "Owen Faraday" },
          ],
        },
        {
          type: "contact",
          heading: "Check availability",
          body: "Best rates guaranteed when you book direct.",
          address: "1 Harborfront Way, Boston, MA",
          phone: "+1 (617) 555-0199",
          email: "reservations@theainsworth.example",
          variant: "booking",
          bookingFields: { checkInLabel: "Check-in", checkOutLabel: "Check-out", guestsLabel: "Guests" },
        },
        {
          type: "faq",
          heading: "Good to know",
          items: [
            { question: "What time is check-in?", answer: "Check-in is 3pm, check-out is 11am. Early check-in is available on request." },
            { question: "Is parking available?", answer: "Yes, valet parking is available for $38/night." },
            { question: "Are pets allowed?", answer: "We welcome dogs under 40lbs for a $75 nightly fee." },
          ],
        },
        {
          type: "footer",
          brand: "The Ainsworth",
          columns: [
            {
              heading: "Stay",
              links: [
                { label: "Rooms", href: "#rooms" },
                { label: "Amenities", href: "#amenities" },
              ],
            },
          ],
          copyrightText: `© ${new Date().getFullYear()} The Ainsworth Hotel.`,
        },
      ],
    },
  ],
};
