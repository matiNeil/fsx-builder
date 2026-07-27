import { SiteNav } from "@/components/marketing/site-nav";

const SECTIONS = [
  {
    id: "getting-started",
    title: "Getting Started",
    body: (
      <>
        <p>
          Create a free account from <a href="/register" className="underline">Sign up</a> — every
          new account starts on the <strong>Free plan</strong> with 50 credits that renew every
          month, no card required.
        </p>
        <p>
          Once you&apos;re signed in you land on your{" "}
          <a href="/dashboard" className="underline">Dashboard</a>, where you can jump into any of
          the three tools, see your recent projects, and check your remaining credits.
        </p>
      </>
    ),
  },
  {
    id: "credits",
    title: "Credits & Plans",
    body: (
      <>
        <p>
          Every project-changing action costs credits, shown before you take it so there are no
          surprises:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Create a website — 20 credits · Save changes — 2 credits</li>
          <li>Generate a poster — 5 credits · Save changes — 2 credits</li>
          <li>Generate an AI image — 8 credits · Save changes — 3 credits</li>
          <li>Generate section copy with AI — 3 credits</li>
        </ul>
        <p>
          Autosave never costs credits — only an explicit Save, Publish, or Generate action does.
          If an AI generation fails, you aren&apos;t charged. See{" "}
          <a href="/pricing" className="underline">Pricing</a> for the full plan lineup and how
          many credits each includes per month.
        </p>
      </>
    ),
  },
  {
    id: "website-builder",
    title: "Website Builder",
    body: (
      <>
        <p>
          Pick a template and we&apos;ll set up a full, multi-page website with real starter
          content for you — or describe your business and tap{" "}
          <strong>Generate with AI</strong> to have it pick a template and write your homepage
          intro automatically.
        </p>
        <p>
          From there, edit pages and sections directly: add or remove pages, drag sections to
          reorder them, tap <strong>Generate with AI</strong> next to any heading or body field to
          have it written for you, and use <strong>Add image</strong> to pick a photo from the
          built-in gallery.
        </p>
        <p>
          Fine-tuning content width, section spacing, font scale, and columns per breakpoint is
          available under <strong>Advanced settings</strong> if you need it — most sites don&apos;t.
        </p>
        <p>
          <strong>Publish</strong> makes your site live at a shareable{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">
            fsxbuilder.com/published/&lt;project-id&gt;
          </code>{" "}
          URL that anyone can view without signing in.
        </p>
      </>
    ),
  },
  {
    id: "poster-generator",
    title: "Poster Generator",
    body: (
      <>
        <p>
          Pick a poster template, then edit the title, subtitle, call-to-action, colors, and any
          number of detail lines. The preview updates live as you type.
        </p>
        <p>
          When you&apos;re happy with it, use <strong>Export PNG</strong> to download a
          high-resolution image sized to the template&apos;s dimensions.
        </p>
      </>
    ),
  },
  {
    id: "image-creator",
    title: "Image Creator",
    body: (
      <>
        <p>
          A layer-based canvas editor: add text layers, shapes, or upload your own images, then
          move, resize, and rotate them freely.
        </p>
        <p>
          Select an image layer to adjust brightness, contrast, blur, and grayscale. Use{" "}
          <strong>Generate with AI</strong> to create a new image layer from a text prompt —
          generation only charges credits if it actually succeeds.
        </p>
        <p>Undo and redo are available at any point, and Export PNG downloads the full canvas.</p>
      </>
    ),
  },
  {
    id: "account",
    title: "Account",
    body: (
      <>
        <p>
          Visit <a href="/account" className="underline">Account</a> to see your current plan,
          credits remaining, credits used this period, and your next monthly reset date.
        </p>
      </>
    ),
  },
];

export default function DocsPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto flex w-full max-w-4xl flex-1 gap-10 px-6 py-16 sm:px-10">
        <aside className="hidden w-48 shrink-0 space-y-1 text-sm md:block">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
            On this page
          </p>
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="block rounded-md px-2 py-1.5 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
            >
              {section.title}
            </a>
          ))}
        </aside>
        <div className="min-w-0 flex-1 space-y-12">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight">Documentation</h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Everything you need to build with the Website Builder, Poster Generator, and Image
              Creator.
            </p>
          </div>
          {SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24 space-y-3">
              <h2 className="text-2xl font-semibold tracking-tight">{section.title}</h2>
              <div className="space-y-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {section.body}
              </div>
            </section>
          ))}
          <p className="border-t border-zinc-200 pt-6 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            Can&apos;t find what you&apos;re looking for?{" "}
            <a
              href="https://support.forgestackx.com"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Contact Support
            </a>
            .
          </p>
        </div>
      </main>
    </>
  );
}
