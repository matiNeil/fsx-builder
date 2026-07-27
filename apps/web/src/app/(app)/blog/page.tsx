import { SiteNav } from "@/components/marketing/site-nav";

const POSTS = [
  {
    title: "Introducing the redesigned Website Builder",
    date: "July 27, 2026",
    excerpt:
      "A guided flow, real starter content, AI-assisted copy, and a built-in photo gallery — here's what changed and why.",
    body: (
      <>
        <p>
          The Website Builder used to put everything on one page: your saved projects, a long
          scrolling gallery of templates, and the full editor, all at once. It worked, but it
          wasn&apos;t easy for a first-time visitor to know where to start.
        </p>
        <p>
          We split it into three focused steps. First, your projects — a simple list with one
          clear action: <strong>New Website</strong>. Second, a template picker with real,
          fully-written starter content instead of empty placeholder sections, plus a &ldquo;describe
          your business&rdquo; box that uses AI to pick a template and write your homepage intro for
          you. Third, the editor itself — now with a{" "}
          <strong>Generate with AI</strong> button next to every heading and body field, an{" "}
          <strong>Add image</strong> button backed by a built-in photo gallery, and the
          more technical responsive controls tucked behind an &ldquo;Advanced settings&rdquo; toggle instead
          of sitting front and center.
        </p>
        <p>The goal was simple: get you to a real, published website faster, with less to learn.</p>
      </>
    ),
  },
  {
    title: "5 tips for a stronger website in under 10 minutes",
    date: "July 20, 2026",
    excerpt:
      "Small changes that make a bigger difference than people expect — none of them require design experience.",
    body: (
      <>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Lead with what you do, not who you are.</strong> Your homepage headline should
            say what a visitor gets, not just your company name.
          </li>
          <li>
            <strong>Add a photo to your hero section.</strong> Pages with a real image next to the
            headline consistently feel more finished than plain text.
          </li>
          <li>
            <strong>Keep your first sentence short.</strong> If it takes more than one breath to
            read out loud, it&apos;s probably too long.
          </li>
          <li>
            <strong>Give every page one clear next step.</strong> A single obvious button beats
            three competing ones.
          </li>
          <li>
            <strong>Publish before it&apos;s perfect.</strong> You can always edit a live site —
            you can&apos;t get feedback on one that&apos;s never published.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "Why we built FSX Builder",
    date: "July 10, 2026",
    excerpt:
      "Most creative tools are either too simple to be useful or too complex to actually use. We wanted something in between.",
    body: (
      <>
        <p>
          We kept meeting people who had a business, an event, or an idea — and no easy way to put
          it online. Design software had a learning curve. Website builders had too many knobs.
          What was missing was something that could just start you off with something real, then
          get out of the way.
        </p>
        <p>
          That&apos;s the idea behind FSX Builder: one workspace for websites, posters, and
          images, where AI handles the blank-page problem and you handle the decisions that
          actually matter.
        </p>
      </>
    ),
  },
];

export default function BlogPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-14 px-6 py-16 sm:px-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight">Blog</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Product updates, guides, and notes from the team.
          </p>
        </div>
        {POSTS.map((post) => (
          <article key={post.title} className="space-y-3 border-t border-zinc-200 pt-8 dark:border-zinc-800">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{post.date}</p>
              <h2 className="text-2xl font-semibold tracking-tight">{post.title}</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{post.excerpt}</p>
            </div>
            <div className="space-y-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {post.body}
            </div>
          </article>
        ))}
      </main>
    </>
  );
}
