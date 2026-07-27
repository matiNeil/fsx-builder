import type { WebsitePage, WebsiteResponsiveConfig, WebsiteBreakpoint } from "./website-project-state";

const defaultResponsive = (): Record<WebsiteBreakpoint, WebsiteResponsiveConfig> => ({
  desktop: { columns: 1, contentWidth: 960, sectionGap: 24, fontScale: 1 },
  tablet: { columns: 1, contentWidth: 760, sectionGap: 20, fontScale: 0.95 },
  mobile: { columns: 1, contentWidth: 420, sectionGap: 16, fontScale: 0.9 },
});

type SectionSeed = { heading: string; body: string; image?: string };
type PageSeed = { title: string; slug: string; sections: SectionSeed[] };

const buildPages = (idPrefix: string, pages: PageSeed[]): WebsitePage[] =>
  pages.map((page, pageIndex) => ({
    id: `${idPrefix}-page-${pageIndex}`,
    title: page.title,
    slug: page.slug,
    sections: page.sections.map((section, sectionIndex) => ({
      id: `${idPrefix}-${page.slug || "home"}-${sectionIndex}`,
      heading: section.heading,
      body: section.body,
      imageUrl: section.image ? `https://picsum.photos/seed/${section.image}/1600/900` : null,
    })),
    responsive: defaultResponsive(),
  }));

export const flagshipWebsiteTemplateContent: Record<string, (idPrefix: string) => WebsitePage[]> = {
  "website-corporate": (idPrefix) =>
    buildPages(idPrefix, [
      {
        title: "Home",
        slug: "",
        sections: [
          {
            heading: "Solutions that move your business forward",
            body: "We help growing companies streamline operations, cut costs, and scale with confidence. Trusted by teams who need results, not just advice.",
            image: "business-hero",
          },
          {
            heading: "What we do",
            body: "From strategy to execution, we partner with your team at every stage — consulting, implementation, and ongoing support built around your goals.",
            image: "business-services",
          },
          {
            heading: "Why clients choose us",
            body: "Over a decade of experience across industries, a senior team on every engagement, and a track record of measurable outcomes.",
          },
          {
            heading: "Ready to talk?",
            body: "Book a free consultation and we'll show you exactly where we can help.",
          },
        ],
      },
      {
        title: "About",
        slug: "about",
        sections: [
          {
            heading: "Our story",
            body: "Founded to help ambitious companies get unstuck, we've grown into a team of specialists who care as much about your business as you do.",
            image: "business-about",
          },
          {
            heading: "Our values",
            body: "Straight talk, real accountability, and work we're proud to put our name on — that's how we operate, every time.",
          },
          {
            heading: "Leadership team",
            body: "Our partners bring decades of combined experience from operations, finance, and technology leadership roles.",
          },
        ],
      },
      {
        title: "Services",
        slug: "services",
        sections: [
          {
            heading: "Strategy & consulting",
            body: "We diagnose what's slowing you down and build a practical roadmap to fix it — no fluff, just a clear plan.",
          },
          {
            heading: "Implementation",
            body: "Our team rolls up its sleeves alongside yours to put the plan into action, on time and on budget.",
          },
          {
            heading: "Ongoing support",
            body: "We stick around after launch with monthly check-ins and hands-on support whenever you need us.",
          },
        ],
      },
      {
        title: "Contact",
        slug: "contact",
        sections: [
          {
            heading: "Let's work together",
            body: "Tell us a bit about your business and what you're looking to solve. We'll follow up within one business day.",
          },
          {
            heading: "Get in touch",
            body: "Email hello@yourcompany.com or call (555) 010-2200. Prefer a form? Use the button below.",
          },
        ],
      },
    ]),

  "website-portfolio-minimal": (idPrefix) =>
    buildPages(idPrefix, [
      {
        title: "Home",
        slug: "",
        sections: [
          {
            heading: "Hi, I'm a designer & developer",
            body: "I build clean, thoughtful digital products for startups and small teams. Currently open for new projects.",
            image: "portfolio-hero",
          },
          {
            heading: "Selected work",
            body: "A mix of branding, product design, and front-end builds — see a few favorites below.",
            image: "portfolio-work",
          },
          {
            heading: "Let's build something",
            body: "Have a project in mind? I'd love to hear about it.",
          },
        ],
      },
      {
        title: "About",
        slug: "about",
        sections: [
          {
            heading: "A bit about me",
            body: "I've spent the last several years helping early-stage companies design and ship their first (and second, and third) product.",
            image: "portfolio-about",
          },
          {
            heading: "How I work",
            body: "Small scope, fast feedback loops, and no surprises — I keep you in the loop from kickoff to launch.",
          },
        ],
      },
      {
        title: "Work",
        slug: "work",
        sections: [
          {
            heading: "Project One — Product redesign",
            body: "A ground-up redesign that improved onboarding completion by design, not guesswork.",
            image: "portfolio-project-1",
          },
          {
            heading: "Project Two — Brand identity",
            body: "A full brand system, from logo to launch site, for a consumer app.",
            image: "portfolio-project-2",
          },
          {
            heading: "Project Three — Marketing site",
            body: "A fast, conversion-focused marketing site built from scratch.",
            image: "portfolio-project-3",
          },
        ],
      },
      {
        title: "Contact",
        slug: "contact",
        sections: [
          { heading: "Get in touch", body: "Email me at hello@yourname.com — I usually reply within a day." },
        ],
      },
    ]),

  "website-restaurant": (idPrefix) =>
    buildPages(idPrefix, [
      {
        title: "Home",
        slug: "",
        sections: [
          {
            heading: "Seasonal food, made with care",
            body: "A neighborhood restaurant serving locally-sourced dishes in a warm, welcoming space. Open Tuesday through Sunday.",
            image: "restaurant-hero",
          },
          {
            heading: "Tonight's favorites",
            body: "Chef's picks change with the season — ask your server what's fresh today.",
            image: "restaurant-dish",
          },
          {
            heading: "Reserve a table",
            body: "Walk-ins welcome, but we recommend booking ahead for weekend evenings.",
          },
        ],
      },
      {
        title: "Menu",
        slug: "menu",
        sections: [
          {
            heading: "Starters",
            body: "Roasted beet salad · Burrata & heirloom tomato · Soup of the day",
          },
          {
            heading: "Mains",
            body: "Pan-seared salmon · Braised short rib · Wild mushroom risotto",
            image: "restaurant-menu",
          },
          {
            heading: "Desserts",
            body: "Dark chocolate tart · Seasonal fruit crumble · House-made gelato",
          },
        ],
      },
      {
        title: "About",
        slug: "about",
        sections: [
          {
            heading: "Our story",
            body: "Started by two friends who wanted a place that felt like home — good food, good company, no pretense.",
            image: "restaurant-about",
          },
          {
            heading: "Where our food comes from",
            body: "We work with local farms and suppliers to keep our menu fresh and our footprint small.",
          },
        ],
      },
      {
        title: "Contact",
        slug: "contact",
        sections: [
          {
            heading: "Visit us",
            body: "123 Main Street, open Tue–Sun, 5pm–10pm. Reservations: (555) 010-3300.",
          },
        ],
      },
    ]),

  "website-ecommerce-home": (idPrefix) =>
    buildPages(idPrefix, [
      {
        title: "Home",
        slug: "",
        sections: [
          {
            heading: "New season, new arrivals",
            body: "Discover the latest collection — thoughtfully made, designed to last, shipped free over $75.",
            image: "store-hero",
          },
          {
            heading: "Shop by category",
            body: "Browse our best-selling collections, from everyday essentials to statement pieces.",
            image: "store-collection",
          },
          {
            heading: "Why shop with us",
            body: "Free returns within 30 days, carbon-neutral shipping, and a quality guarantee on everything we sell.",
          },
        ],
      },
      {
        title: "Shop",
        slug: "shop",
        sections: [
          {
            heading: "Best sellers",
            body: "The pieces our customers can't stop reordering.",
            image: "store-products",
          },
          { heading: "New arrivals", body: "Fresh drops, updated weekly." },
          { heading: "Sale", body: "Limited-time markdowns on select styles." },
        ],
      },
      {
        title: "About",
        slug: "about",
        sections: [
          {
            heading: "Our mission",
            body: "We believe good design shouldn't cost the earth — every product is made with sustainably sourced materials.",
            image: "store-about",
          },
        ],
      },
      {
        title: "Contact",
        slug: "contact",
        sections: [
          {
            heading: "Need help?",
            body: "Our support team answers within 24 hours at support@yourstore.com.",
          },
        ],
      },
    ]),

  "website-realty-listings": (idPrefix) =>
    buildPages(idPrefix, [
      {
        title: "Home",
        slug: "",
        sections: [
          {
            heading: "Find your next home",
            body: "Local expertise, honest advice, and listings updated daily across the metro area.",
            image: "realty-hero",
          },
          {
            heading: "Featured listings",
            body: "A hand-picked selection of our newest properties on the market.",
            image: "realty-listing",
          },
          {
            heading: "Thinking of selling?",
            body: "Get a free, no-obligation home valuation from our team this week.",
          },
        ],
      },
      {
        title: "Listings",
        slug: "listings",
        sections: [
          {
            heading: "3 Bed, 2 Bath — Downtown",
            body: "A bright, updated home minutes from downtown, listed at $485,000.",
            image: "realty-property-1",
          },
          {
            heading: "4 Bed, 3 Bath — Suburbs",
            body: "Spacious family home with a large backyard, listed at $625,000.",
            image: "realty-property-2",
          },
          {
            heading: "2 Bed Condo — Waterfront",
            body: "Modern waterfront living with skyline views, listed at $395,000.",
          },
        ],
      },
      {
        title: "About",
        slug: "about",
        sections: [
          {
            heading: "Meet the team",
            body: "Our agents have closed hundreds of local deals and know every neighborhood inside out.",
            image: "realty-agents",
          },
        ],
      },
      {
        title: "Contact",
        slug: "contact",
        sections: [
          {
            heading: "Let's find your home",
            body: "Call (555) 010-4400 or send us your must-haves and we'll start searching today.",
          },
        ],
      },
    ]),

  "website-nonprofit": (idPrefix) =>
    buildPages(idPrefix, [
      {
        title: "Home",
        slug: "",
        sections: [
          {
            heading: "Together, we can change lives",
            body: "We're working to bring clean water, education, and opportunity to communities that need it most.",
            image: "nonprofit-hero",
          },
          {
            heading: "Our impact so far",
            body: "Thanks to supporters like you, we've reached thousands of families across a dozen communities.",
            image: "nonprofit-impact",
          },
          {
            heading: "Make a difference today",
            body: "Every donation, big or small, goes directly toward our programs on the ground.",
          },
        ],
      },
      {
        title: "Our Mission",
        slug: "mission",
        sections: [
          {
            heading: "Why we exist",
            body: "We believe everyone deserves access to clean water, quality education, and a fair chance to thrive.",
            image: "nonprofit-about",
          },
          {
            heading: "How we work",
            body: "We partner directly with local communities to build lasting, sustainable solutions — not quick fixes.",
          },
        ],
      },
      {
        title: "Programs",
        slug: "programs",
        sections: [
          { heading: "Clean water access", body: "Building wells and water systems in underserved regions." },
          { heading: "Education support", body: "Funding schools, teachers, and learning materials for children in need." },
          { heading: "Community development", body: "Supporting local leaders with resources to build lasting change." },
        ],
      },
      {
        title: "Donate",
        slug: "donate",
        sections: [
          {
            heading: "Your gift matters",
            body: "100% of individual donations go directly to program work. Give once, or become a monthly supporter.",
          },
        ],
      },
    ]),

  "website-saas-landing": (idPrefix) =>
    buildPages(idPrefix, [
      {
        title: "Home",
        slug: "",
        sections: [
          {
            heading: "The simplest way to manage your team's work",
            body: "Plan, track, and ship projects faster — all in one clean workspace your team will actually enjoy using.",
            image: "saas-hero",
          },
          {
            heading: "Everything your team needs",
            body: "Task boards, timelines, automations, and reporting — built to scale from 3 people to 300.",
            image: "saas-feature",
          },
          {
            heading: "Loved by fast-moving teams",
            body: "Join thousands of teams who switched and never looked back.",
          },
          {
            heading: "Start your free trial",
            body: "No credit card required. Set up your workspace in under two minutes.",
          },
        ],
      },
      {
        title: "Features",
        slug: "features",
        sections: [
          { heading: "Task boards", body: "Organize work the way your team thinks, with flexible boards and views." },
          { heading: "Automations", body: "Cut busywork with rules that handle the repetitive stuff for you." },
          { heading: "Reporting", body: "See progress at a glance with real-time dashboards for every project." },
        ],
      },
      {
        title: "Contact",
        slug: "contact",
        sections: [
          {
            heading: "Talk to our team",
            body: "Have questions about plans or onboarding your team? We're happy to help — reach out any time.",
          },
        ],
      },
    ]),

  "website-personal-blog": (idPrefix) =>
    buildPages(idPrefix, [
      {
        title: "Home",
        slug: "",
        sections: [
          {
            heading: "Welcome to my corner of the internet",
            body: "I write about the things I'm learning, building, and thinking about — usually somewhere between design, tech, and life.",
            image: "blog-hero",
          },
          {
            heading: "Latest posts",
            body: "A running log of essays, notes, and the occasional rabbit hole.",
            image: "blog-post",
          },
          {
            heading: "Get new posts by email",
            body: "No spam, just a note whenever I publish something new.",
          },
        ],
      },
      {
        title: "About",
        slug: "about",
        sections: [
          {
            heading: "A little about me",
            body: "I'm a curious person who likes writing things down. This site is where I keep the good stuff.",
            image: "blog-about",
          },
        ],
      },
      {
        title: "Blog",
        slug: "blog",
        sections: [
          { heading: "On starting before you're ready", body: "Some thoughts on why waiting for the 'right time' rarely pays off." },
          { heading: "What I learned this year", body: "A short reflection on the lessons that stuck with me." },
          { heading: "Tools I actually use", body: "A running list of the apps and habits that make my work easier." },
        ],
      },
      {
        title: "Contact",
        slug: "contact",
        sections: [
          { heading: "Say hello", body: "Reach me at hello@yourname.com or find me on social." },
        ],
      },
    ]),
};

export const flagshipTemplateIds = Object.keys(flagshipWebsiteTemplateContent);

