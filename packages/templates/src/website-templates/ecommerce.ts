import type { WebsiteTemplateDefinition } from "../website-template-definitions.js";

export const ecommerceTemplate: WebsiteTemplateDefinition = {
  id: "website-ecommerce-home",
  defaultThemeId: "coastal-breeze",
  pages: [
    {
      title: "Home",
      slug: "",
      sections: [
        {
          type: "navbar",
          brand: "Fernweh Goods",
          links: [
            { label: "Shop", href: "#products" },
            { label: "Why us", href: "#services" },
            { label: "FAQ", href: "#faq" },
            { label: "Contact", href: "#contact" },
          ],
          cta: { label: "Shop now", href: "#products" },
        },
        {
          type: "hero",
          eyebrow: "New season collection",
          heading: "Everyday essentials, made to last",
          subheading: "Thoughtfully made goods for the home and the road, shipped worldwide.",
          primaryCta: { label: "Shop the collection", href: "#products" },
          secondaryCta: { label: "Our story", href: "#services" },
          imageUrl: "https://picsum.photos/seed/ecommerce-hero/1600/1200",
          layout: "image-right",
        },
        {
          type: "catalog",
          heading: "Best sellers",
          variant: "products",
          items: [
            {
              title: "Canvas weekender bag",
              description: "Waxed canvas, leather trim, lifetime warranty.",
              price: "$168",
              imageUrl: "https://picsum.photos/seed/ecommerce-product-1/600/600",
            },
            {
              title: "Ceramic pour-over set",
              description: "Hand-thrown stoneware, dishwasher safe.",
              price: "$64",
              imageUrl: "https://picsum.photos/seed/ecommerce-product-2/600/600",
            },
            {
              title: "Merino travel blanket",
              description: "100% merino wool, packable, machine washable.",
              price: "$96",
              imageUrl: "https://picsum.photos/seed/ecommerce-product-3/600/600",
            },
            {
              title: "Brass desk lamp",
              description: "Solid brass, dimmable LED, 10-year warranty.",
              price: "$142",
              imageUrl: "https://picsum.photos/seed/ecommerce-product-4/600/600",
            },
          ],
        },
        {
          type: "features",
          heading: "Why shop with us",
          variant: "why-shop-with-us",
          items: [
            { title: "Free shipping over $75", body: "On every order, every country." },
            { title: "Lifetime warranty", body: "We repair or replace, no questions asked." },
            { title: "Carbon-neutral shipping", body: "Every order offsets its own footprint." },
          ],
        },
        {
          type: "testimonials",
          heading: "What customers say",
          items: [
            { quote: "The weekender bag gets compliments everywhere I take it. Worth every dollar.", author: "Priya N." },
            { quote: "Customer service replaced a damaged lamp with zero hassle. Loyal customer now.", author: "Tom R." },
          ],
        },
        {
          type: "faq",
          heading: "Shipping & returns",
          items: [
            { question: "How long does shipping take?", answer: "5–8 business days domestically, 10–14 internationally." },
            { question: "What's your return policy?", answer: "Free returns within 30 days, no questions asked." },
          ],
        },
        {
          type: "cta",
          heading: "Get 10% off your first order",
          body: "Join our list for early access to new drops.",
          primaryCta: { label: "Shop now", href: "#products" },
        },
        {
          type: "contact",
          heading: "Need help?",
          body: "Our support team responds within a few hours.",
          email: "support@fernwehgoods.example",
          variant: "form",
        },
        {
          type: "footer",
          brand: "Fernweh Goods",
          columns: [
            {
              heading: "Shop",
              links: [
                { label: "All products", href: "#products" },
                { label: "Gift cards", href: "#" },
              ],
            },
            {
              heading: "Support",
              links: [
                { label: "Shipping", href: "#faq" },
                { label: "Returns", href: "#faq" },
              ],
            },
          ],
          socialLinks: [
            { label: "Instagram", href: "#" },
            { label: "Pinterest", href: "#" },
          ],
          copyrightText: `© ${new Date().getFullYear()} Fernweh Goods.`,
        },
      ],
    },
  ],
};
