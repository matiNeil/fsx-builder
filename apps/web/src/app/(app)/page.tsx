import { SiteNav } from "@/components/marketing/site-nav";
import { BackgroundFx } from "@/components/marketing/background-fx";
import { HeroMockup } from "@/components/marketing/hero-mockup";
import { SocialProof } from "@/components/marketing/social-proof";
import { StatsSection } from "@/components/marketing/stats-section";
import { ToolCard } from "@/components/marketing/tool-card";
import { FeatureList } from "@/components/marketing/feature-list";
import { ExamplesSection } from "@/components/marketing/examples-section";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { Reveal } from "@/components/marketing/reveal";

const tools = [
  {
    href: "/website-builder",
    title: "Website Builder",
    description: "Responsive websites, built visually and published live in seconds.",
    gradient: "from-indigo-500 to-blue-500",
    glyphPath: "M6 10h36v28H6zM6 17h36M12 13h.01M17 13h.01M22 13h.01",
  },
  {
    href: "/poster-generator",
    title: "Poster Generator",
    description: "Design posters from templates and export as PNG.",
    gradient: "from-orange-500 to-pink-500",
    glyphPath: "M10 6h28v36H10zM16 14h16v12H16zM16 30h16M16 34h10",
  },
  {
    href: "/image-creator",
    title: "Image Creator",
    description: "Edit layers, apply effects, and generate images with AI.",
    gradient: "from-emerald-500 to-sky-500",
    glyphPath: "M8 12h28v24H8zM16 20a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM8 30l8-8 6 6 10-10v18H8z",
  },
];

export default function Home() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-24 px-6 py-16 sm:px-10">
        <section className="relative">
          <BackgroundFx />
          <div className="relative grid items-center gap-10 sm:grid-cols-2">
            <div className="animate-fade-in space-y-5">
              <span className="inline-flex items-center rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                AI-Powered Creative Suite
              </span>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Build anything visual{" "}
                <span className="text-blue-600 dark:text-blue-400">with AI.</span>
              </h1>
              <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
                Websites. Posters. Images. One workspace.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="/register"
                  className="btn-gradient rounded-lg px-5 py-2.5 text-sm font-medium text-white"
                >
                  Start building ✨
                </a>
                <a
                  href="/image-creator"
                  className="rounded-lg border border-zinc-300/70 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700/70 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  Try Image Creator
                </a>
              </div>
              <SocialProof />
            </div>
            <div className="relative">
              <HeroMockup />
            </div>
          </div>
        </section>

        <Reveal>
          <StatsSection />
        </Reveal>

        <section id="tools" className="scroll-mt-24 space-y-8">
          <Reveal className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight">Three tools, one workspace</h2>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-3">
            {tools.map((tool, index) => (
              <Reveal key={tool.href} delayMs={index * 100}>
                <ToolCard {...tool} />
              </Reveal>
            ))}
          </div>
        </section>

        <ExamplesSection />

        <TestimonialsSection />

        <CtaBanner />

        <FeatureList />
      </main>
    </>
  );
}
