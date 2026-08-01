import type { WebsiteTemplateDefinition } from "../website-template-definitions.js";

export const lawFirmTemplate: WebsiteTemplateDefinition = {
  id: "website-law-firm",
  defaultThemeId: "modern-blue",
  pages: [
    {
      title: "Home",
      slug: "",
      sections: [
        {
          type: "navbar",
          brand: "Whitfield & Cole LLP",
          links: [
            { label: "Practice areas", href: "#services" },
            { label: "Attorneys", href: "#team" },
            { label: "About", href: "#about" },
            { label: "Contact", href: "#contact" },
          ],
          cta: { label: "Free consultation", href: "#contact" },
        },
        {
          type: "hero",
          eyebrow: "Trial-tested representation",
          heading: "Serious legal representation when it matters most",
          subheading: "Business litigation, employment law, and civil disputes.",
          primaryCta: { label: "Free consultation", href: "#contact" },
          secondaryCta: { label: "Practice areas", href: "#services" },
          imageUrl: "https://picsum.photos/seed/lawfirm-hero/1600/1200",
          layout: "image-right",
        },
        {
          type: "about",
          heading: "A firm built on preparation",
          body: "Whitfield & Cole has represented individuals and businesses in state and federal court for over 25 years. We take fewer cases so we can prepare each one as if it's going to trial — because sometimes it does.",
          imageUrl: "https://picsum.photos/seed/lawfirm-about/1200/900",
        },
        {
          type: "features",
          heading: "Practice areas",
          variant: "practice-areas",
          items: [
            { title: "Business litigation", body: "Contract disputes, partnership disputes, and commercial claims." },
            { title: "Employment law", body: "Wrongful termination, discrimination, and wage disputes." },
            { title: "Civil litigation", body: "Personal injury and general civil disputes." },
            { title: "Appeals", body: "State and federal appellate representation." },
          ],
        },
        {
          type: "stats",
          items: [
            { value: "25+", label: "Years in practice" },
            { value: "600+", label: "Cases resolved" },
            { value: "$140M", label: "Recovered for clients" },
          ],
        },
        {
          type: "team",
          heading: "Our attorneys",
          items: [
            { name: "Margaret Whitfield", role: "Founding Partner", photoUrl: "https://picsum.photos/seed/lawfirm-team-1/400/400" },
            { name: "David Cole", role: "Founding Partner", photoUrl: "https://picsum.photos/seed/lawfirm-team-2/400/400" },
            { name: "Anita Rao", role: "Senior Associate", photoUrl: "https://picsum.photos/seed/lawfirm-team-3/400/400" },
          ],
        },
        {
          type: "testimonials",
          heading: "Client results",
          items: [
            { quote: "They prepared our case like it was going to trial from day one. It never had to.", author: "Confidential client" },
            { quote: "Direct, honest advice — no unnecessary billing, no runaround.", author: "R. Alvarez, small business owner" },
          ],
        },
        {
          type: "faq",
          heading: "Frequently asked questions",
          items: [
            { question: "Do you offer free consultations?", answer: "Yes, initial consultations are free for most matters." },
            { question: "Do you work on contingency?", answer: "For personal injury and some employment cases, yes — ask during your consultation." },
          ],
        },
        {
          type: "contact",
          heading: "Schedule a consultation",
          body: "Tell us briefly about your matter and an attorney will follow up.",
          address: "500 Courthouse Square, Suite 1100, Austin, TX",
          phone: "+1 (512) 555-0166",
          email: "intake@whitfieldcole.example",
          variant: "form",
        },
        {
          type: "footer",
          brand: "Whitfield & Cole LLP",
          columns: [
            {
              heading: "Practice areas",
              links: [
                { label: "Business litigation", href: "#services" },
                { label: "Employment law", href: "#services" },
              ],
            },
          ],
          copyrightText: `© ${new Date().getFullYear()} Whitfield & Cole LLP. Attorney advertising.`,
        },
      ],
    },
  ],
};
