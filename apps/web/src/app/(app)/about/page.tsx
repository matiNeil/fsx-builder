import { SiteNav } from "@/components/marketing/site-nav";

export default function AboutPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-14 px-6 py-20 sm:px-10">
        <div className="space-y-4 text-center">
          <span className="inline-flex items-center rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
            About us
          </span>
          <h1 className="text-4xl font-semibold tracking-tight">
            Built by{" "}
            <span className="text-red-600 dark:text-red-500">Forge</span>stackX
          </h1>
          <p className="mx-auto max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            ForgeStackX is a software studio building practical, AI-powered tools for people who
            want to create without fighting their software.
          </p>
        </div>

        <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white/60 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="text-xl font-semibold">FSX Studio</h2>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            FSX Studio is our flagship product — one workspace for building websites, posters,
            and AI-generated images, without needing design or code experience. Pick a template,
            let AI help with the copy, and publish in minutes.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white/60 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="text-xl font-semibold">For developers — FSX.ai</h2>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            If you build software, we also make{" "}
            <a
              href="https://fsx.ai"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-blue-600 underline dark:text-blue-400"
            >
              FSX.ai
            </a>{" "}
            — an AI-assisted development tool to help you build and ship faster.
          </p>
        </section>

        <section className="space-y-3 text-center">
          <h2 className="text-xl font-semibold">What we believe</h2>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Creative and technical tools should feel simple, not intimidating. We build products
            that get out of your way — so you can focus on what you&apos;re actually trying to
            make.
          </p>
        </section>

        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          Questions? Reach us through{" "}
          <a
            href="https://support.forgestackx.com"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Support
          </a>
          .
        </p>
      </main>
    </>
  );
}
