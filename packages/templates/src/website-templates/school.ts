import type { WebsiteTemplateDefinition } from "../website-template-definitions.js";

export const schoolTemplate: WebsiteTemplateDefinition = {
  id: "website-education-school",
  defaultThemeId: "fresh-green",
  pages: [
    {
      title: "Home",
      slug: "",
      sections: [
        {
          type: "navbar",
          brand: "Cedar Ridge Academy",
          links: [
            { label: "Programs", href: "#services" },
            { label: "Faculty", href: "#team" },
            { label: "Campus life", href: "#gallery" },
            { label: "Admissions", href: "#contact" },
          ],
          cta: { label: "Apply now", href: "#contact" },
        },
        {
          type: "hero",
          eyebrow: "Grades 6–12, independent school",
          heading: "Where curious students become confident thinkers",
          subheading: "Small classes, real mentorship, and a curriculum built around depth over speed.",
          primaryCta: { label: "Start an application", href: "#contact" },
          secondaryCta: { label: "Explore programs", href: "#services" },
          imageUrl: "https://picsum.photos/seed/school-hero/1600/1200",
          layout: "image-right",
        },
        {
          type: "about",
          heading: "Our mission",
          body: "Cedar Ridge Academy was founded on the belief that students learn best when they're known — by name, by strength, by what challenges them. Our average class size is 14 students.",
          imageUrl: "https://picsum.photos/seed/school-about/1200/900",
          variant: "mission",
        },
        {
          type: "features",
          heading: "Academic programs",
          variant: "programs",
          items: [
            { title: "STEM track", body: "Advanced math, engineering, and applied sciences." },
            { title: "Humanities track", body: "Writing-intensive literature, history, and philosophy." },
            { title: "Arts program", body: "Studio art, music, and performing arts." },
            { title: "Athletics", body: "12 varsity sports and daily physical education." },
          ],
        },
        {
          type: "stats",
          items: [
            { value: "14:1", label: "Student-teacher ratio" },
            { value: "98%", label: "College acceptance rate" },
            { value: "40+", label: "Clubs & activities" },
          ],
        },
        {
          type: "team",
          heading: "Faculty spotlight",
          items: [
            { name: "Dr. Helen Osei", role: "Head of School", photoUrl: "https://picsum.photos/seed/school-team-1/400/400" },
            { name: "James Okafor", role: "Dean of STEM", photoUrl: "https://picsum.photos/seed/school-team-2/400/400" },
            { name: "Marie Dubois", role: "Dean of Humanities", photoUrl: "https://picsum.photos/seed/school-team-3/400/400" },
          ],
        },
        {
          type: "testimonials",
          heading: "From our families",
          items: [
            { quote: "Our daughter went from disengaged to genuinely excited about school within a semester.", author: "The Park family" },
            { quote: "Teachers here actually know your kid. That's rare.", author: "A Cedar Ridge parent" },
          ],
        },
        {
          type: "gallery",
          heading: "Campus life",
          images: [
            { url: "https://picsum.photos/seed/school-gallery-1/800/600" },
            { url: "https://picsum.photos/seed/school-gallery-2/800/600" },
            { url: "https://picsum.photos/seed/school-gallery-3/800/600" },
            { url: "https://picsum.photos/seed/school-gallery-4/800/600" },
          ],
        },
        {
          type: "faq",
          heading: "Admissions FAQ",
          items: [
            { question: "When does the application open?", answer: "Applications open in October for the following academic year." },
            { question: "Is financial aid available?", answer: "Yes, roughly 30% of families receive need-based aid." },
          ],
        },
        {
          type: "contact",
          heading: "Start your application",
          body: "Our admissions team is happy to answer questions before you apply.",
          address: "900 Cedar Ridge Road, Asheville, NC",
          phone: "+1 (828) 555-0133",
          email: "admissions@cedarridge.example",
          variant: "form",
        },
        {
          type: "footer",
          brand: "Cedar Ridge Academy",
          columns: [
            {
              heading: "Admissions",
              links: [
                { label: "Apply", href: "#contact" },
                { label: "Tuition & aid", href: "#" },
              ],
            },
          ],
          copyrightText: `© ${new Date().getFullYear()} Cedar Ridge Academy.`,
        },
      ],
    },
  ],
};
